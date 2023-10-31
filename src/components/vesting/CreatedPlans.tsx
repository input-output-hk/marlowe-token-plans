import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import moment from 'moment';

import NewVestingScheduleModal from '../modals/NewVesting';
import { BrowserRuntimeLifecycleOptions, mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/browser";
import { Vesting } from "@marlowe.io/language-examples";
import { mkRestClient } from "@marlowe.io/runtime-rest-client";
import { AddressBech32, ContractId, Tags, contractId, unAddressBech32, unContractId } from '@marlowe.io/runtime-core';

import { RuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/api';
import { ContractDetails } from '@marlowe.io/runtime-rest-client/contract/details';
import HashLoader from 'react-spinners/HashLoader';
import { Address, Input } from '@marlowe.io/language-core-v1';
import { Contract } from './Models';
import { contractIdLink, displayCloseCondition } from './Utils';
import { ConnectionWallet } from '../Connection';

type CreatePlansProps = {
  runtimeURL : string,
  marloweScanURL : string,
  dAppId : string,
  setAndShowToast: (title:string, message:any, isDanger: boolean) => void
};

const CreatePlans: React.FC<CreatePlansProps> = ({runtimeURL,marloweScanURL,dAppId,setAndShowToast}) => {
  const navigate = useNavigate();
  const selectedAWalletExtension = localStorage.getItem('walletProvider');
  if (!selectedAWalletExtension) { navigate('/'); }
  
  const [runtimeLifecycle, setRuntimeLifecycle] = useState<RuntimeLifecycle>();
  const [changeAddress, setChangeAddress] = useState<string>('')

  const [contractsWaitingForDeposit, setContractsWaitingForDeposit] = useState<Contract<Vesting.WaitingDepositByProvider>[]>([]);
  const [contractsNoDepositBeforeDeadline, setContractsNoDepositBeforeDeadline] = useState<Contract<Vesting.NoDepositBeforeDeadline>[]>([]);
  const [contractsWithinVestingPeriod, setContractsWithinVestingPeriod] = useState<Contract<Vesting.WithinVestingPeriod>[]>([]);
  const [contractsVestingEnded, setContractsVestingEnded] = useState<Contract<Vesting.VestingEnded>[]>([]);
  const [contractsClosed, setContractsClosed] = useState<Contract<Vesting.Closed>[]>([]);

  const [isFetchingFirstTime, setIsFetchingFirstTime] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isWaitingConfirmation, setWaitingConfirmation] = useState(false);

  const [showNewVestingScheduleModal, setShowNewVestingScheduleModal] = useState(false);

 

  useEffect(() => {
    const fetchData = async () => {
      if(isFetching) return;
      try {
        setIsFetching(true)
        const runtimeLifecycleParameters : BrowserRuntimeLifecycleOptions = { runtimeURL:runtimeURL, walletName:selectedAWalletExtension as SupportedWallet}
        const runtimeLifecycle = await mkRuntimeLifecycle(runtimeLifecycleParameters).then((a) => {setRuntimeLifecycle(a);return a})
        const restClient = mkRestClient(runtimeURL); 
        const changeAddress = await runtimeLifecycle.wallet.getChangeAddress()
          .then((changeAddress : AddressBech32) => {setChangeAddress(unAddressBech32(changeAddress));return unAddressBech32(changeAddress)})
        
        const contractIdsAndTags : [ContractId,Tags][] = (await restClient.getContracts({ tags: [dAppId] })).headers.map((header) => [header.contractId,header.tags]);
        const contractIdsAndDetails : [ContractId,Tags,ContractDetails] []= await Promise.all(
          contractIdsAndTags.map(([contractId,tags]) =>
            restClient
              .getContractById(contractId)
              .then((details) => [contractId, tags, details] as [ContractId,Tags,ContractDetails])
          )
        );

        const contractIdsAndDetailsAndInputHistory = await Promise.all(
          contractIdsAndDetails.map(([contractId, tags, details]) =>
            restClient
              .getTransactionsForContract(contractId)
              .then((result) =>
                Promise.all(
                  result.headers.map((txHeader) =>
                    restClient.getContractTransactionById(
                      contractId,
                      txHeader.transactionId
                    )
                  )
                )
              )
              .then((txsDetails) =>
                txsDetails.map((txDetails) => txDetails.inputs).flat()
              )
              .then((inputHistory) => [contractId, tags, details, inputHistory] as [ContractId,Tags,ContractDetails,Input[]])
          )
        );
        const allContracts : Contract<Vesting.VestingState>[] = (await Promise.all(
          contractIdsAndDetailsAndInputHistory.map(([contractId, tags, details,inputHistory]) =>
            Vesting.getVestingState(
              tags[dAppId].scheme,
              details.state,
              inputHistory,
              (environment) =>
                runtimeLifecycle.contracts.getApplicableInputs(
                  contractId,
                  environment)
            ).then(state => ({ contractId : contractId,
                              title : tags[dAppId].title?tags[dAppId].title:"",
                              isSelfAttributed : tags[dAppId].isSelfAttributed === 1,
                              providerId : tags[dAppId].providerId,
                              claimer : {firstName : tags[dAppId].firstName, lastName:tags[dAppId].lastName, id: tags[dAppId].claimerId },
                              state : state} as Contract<Vesting.VestingState> )))))
           .filter(contract => contract.providerId === (changeAddress.slice(0,18)))

        setContractsWaitingForDeposit
          (allContracts
            .filter(c => c.state.name === "WaitingDepositByProvider" )
            .map (c => c as Contract<Vesting.WaitingDepositByProvider >))
        setContractsNoDepositBeforeDeadline
            (allContracts
              .filter(c => c.state.name === "NoDepositBeforeDeadline")
              .map (c => c as Contract<Vesting.NoDepositBeforeDeadline>))
        setContractsWithinVestingPeriod
              (allContracts
                .filter(c => c.state.name === "WithinVestingPeriod")
                .map (c => c as Contract<Vesting.WithinVestingPeriod>))
        setContractsVestingEnded
                (allContracts
                  .filter(c => c.state.name === "VestingEnded")
                  .map (c => c as Contract<Vesting.VestingEnded>))
        setContractsClosed
                  (allContracts
                    .filter(c => c.state.name === "Closed")
                    .map (c => c as Contract<Vesting.Closed>))
        setIsFetchingFirstTime(false)
        setIsFetching(false)
                  
      } catch (err) {
        console.log("Error", err);
        setIsFetchingFirstTime(false)
        setIsFetching(false)
        }
    }

    fetchData()
    const intervalId = setInterval(() => {fetchData()}, 5_000); 
    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAWalletExtension, navigate]);


  
  async function handleApplyInput(contractId : ContractId, actionName : string ,inputsToApply : Input[] | undefined) {
    try {
    if(inputsToApply && runtimeLifecycle) {
      setWaitingConfirmation(true)
      const txId = await runtimeLifecycle.contracts.applyInputs(
        contractId,
        { inputs: inputsToApply }
      );
      setAndShowToast(
        `${actionName} on Token Plan Submitted`,
        "The Token Plan will be updated once the transaction is confirmed...",
        false
      );
      console.log(`Apply Input submitted on Cardano with tx Id : ${txId}`);
      console.log(`Waiting Confirmation : ${txId}`);
      await runtimeLifecycle?.wallet.waitConfirmation(txId);
      setAndShowToast(
        `${actionName} on Token Plan Submitted`,
        "The Token Plan is about to be updated...",
        false
      );
      setWaitingConfirmation(false)
      console.log(`Apply Input Confirmed on Cardano.`);
    }} catch (e) {
      setWaitingConfirmation(false)
      setAndShowToast(
        `${actionName} on Token Plan has Failed`,
        "Please Retry...",
        true
      );
    }
  }

  async function handleCreateVestingContract 
    ( firstName : string
    , lastName : string
    , title : string
    , isSelfAttributed : Boolean
    , request : Vesting.VestingRequest
    , afterTxSubmitted : () => void) {
    try {
      if(runtimeLifecycle) {
        const vestingContract = Vesting.mkContract(request);
        setWaitingConfirmation(true)
        const claimerAddress = request.claimer as Address
        const providerAddress = request.provider as Address
        const [contractId, txIdCreated] = await runtimeLifecycle?.contracts.createContract({
              contract: vestingContract,
              tags: { [dAppId]: 
                { isSelfAttributed: isSelfAttributed?1:0
                  , title: title
                  , firstName:firstName
                  , lastName:lastName
                  , providerId : providerAddress.address.slice(0,18)
                  , claimerId :  claimerAddress.address.slice(0,18)
                  , scheme: request.scheme } },
            });
        afterTxSubmitted()
        setShowNewVestingScheduleModal(false);
        setAndShowToast(
          "New Token Plan Submitted",
          "The Token Plan will be listed once the transaction is confirmed...",
          false
          );
        console.log(`Contract submitted on Cardano with Id : ${contractId}`);
        console.log(`Waiting Confirmation : ${txIdCreated}`);
        await runtimeLifecycle?.wallet.waitConfirmation(txIdCreated);
        setWaitingConfirmation(false)
        console.log(`Contract Creation Confirmed on Cardano.`);
      }
    } catch (e) {
      setWaitingConfirmation(false)
      setAndShowToast(
        "Creation Aborted",
        "...",
        false
      );
    }
    
    
  }


  function formatDate(date: Date) {
    return moment(date).format('hh:mma MM/DD/YYYY');
  }


  return (
    <div className="container">
      <div className="header">
        <img src="/images/marlowe-logo-primary.svg" alt="Logo" />
        <h1 style={{margin:0}}>Token Plan Prototype</h1>
        <ConnectionWallet runtimeURL={runtimeURL} setAndShowToast={setAndShowToast} /> 
      </div>
      <div><button className="btn btn-link" disabled={true} onClick={() => navigate("/created-plans")}>Token Provider's View</button> 
          | <button className="btn btn-link"  disabled={isWaitingConfirmation} onClick={() => navigate("/your-plans")}>Claimer's View</button> 
          | <button className="btn btn-link" disabled={isWaitingConfirmation} onClick={() => navigate("/about")}>About</button> 
          <hr></hr>
        </div>
        <div className='d-flex justify-content-start' style={{width:"200px"}}>
            <button
              className='btn btn-outline-primary' onClick={() => setShowNewVestingScheduleModal(true)}
              disabled = {isWaitingConfirmation} >
            Schedule a new plan                        
            </button>
            <HashLoader color="#4B1FED"
            cssOverride={cssOverrideSpinnerCentered}
            loading={isWaitingConfirmation}
            size={15}
            id="cancel-id"
          />
        </div>
  
        <div className="my-5">

        { (isFetchingFirstTime ? 
            <div className='d-flex justify-content-start' style={{width:"150px"}}>
              <HashLoader color="#4B1FED"
                cssOverride={cssOverrideSpinnerCentered}
                loading={isFetchingFirstTime}
                size={15}
                id="loading-plans"/> 
          <div>Loading Plans</div>
          </div> 
          :  contractsWaitingForDeposit.length === 0 
        && contractsNoDepositBeforeDeadline.length === 0 
        && contractsWithinVestingPeriod.length === 0 
        && contractsVestingEnded.length === 0 
        && contractsClosed.length === 0? <p>No Plans Scheduled</p> 
          : 
        <table className="table">
          <thead>
            <tr>
              <th>Contract Id</th>
              <th>Title</th>
              <th>Claimer</th>
              <th>Status</th>
              <th>Cycle</th>
              <th>Periods</th>
              <th>Total</th>
              <th>Claimable</th>
              <th>Deadline</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contractsWaitingForDeposit
                .map((contract, index) => (
                <tr key={index}>
                  <td>{contractIdLink(marloweScanURL,contract.contractId)}</td>
                  <td>{contract.title}</td>
                  <td>{contract.claimer.firstName + '  ' + contract.claimer.lastName}</td>
                  <td><span className='text-success'>Awaiting Deposit</span></td>
                  <td>{contract.state.scheme.frequency}</td>
                  <td>{contract.state.scheme.numberOfPeriods.toString()}</td>
                  <td>{formatADAs(contract.state.scheme.expectedInitialDeposit.amount)}</td>
                  <td>0%</td>
                  <td>{formatDate(contract.state.initialDepositDeadline)}</td>
                  <td>
                    {contract.state.depositInput? 
                            <div className='d-flex justify-content-start'>
                              <button
                                  className='btn btn-outline-success' 
                                  onClick={() => handleApplyInput(contract.contractId,"Deposit",contract.state.depositInput)}
                                  disabled = {isWaitingConfirmation} >
                              Deposit                        
                              </button>
                              <HashLoader color="#4B1FED"
                              cssOverride={cssOverrideSpinnerCentered}
                              loading={isWaitingConfirmation}
                              size={15}
                              id="cancel-id"
                            />
                          </div>
                        : (<span></span>)}
                  </td>
                </tr>
              ))}
            {contractsWithinVestingPeriod
              .map((contract, index) => (
              <tr key={index}>
                <td>{contractIdLink(marloweScanURL,contract.contractId)}</td>
                <td>{contract.title}</td>
                <td>{contract.claimer.firstName + '  ' + contract.claimer.lastName}</td>
                <td>
                    {contract.state.currentPeriod === contract.state.scheme.numberOfPeriods 
                     ? <span className='text-primary'>Plan Ended</span>
                     : <span className='text-primary'>
                      Period {(contract.state.currentPeriod).toString()}/{contract.state.scheme.numberOfPeriods.toString()}
                      </span> 
                     }</td>
                <td>{contract.state.scheme.frequency}</td>
                <td>{contract.state.scheme.numberOfPeriods.toString()}</td>
                <td>{formatADAs(contract.state.quantities.total)}</td>
                <td>{((contract.state.quantities.withdrawable* 100n) / contract.state.quantities.total)  + '%'}</td>
                <td>{formatDate(contract.state.periodInterval[1])} </td>
                <td>
                  {contract.state.cancelInput? 
                       <div className='d-flex justify-content-start'>
                          <button 
                            className='btn btn-outline-danger'
                            disabled = {isWaitingConfirmation}  
                            onClick={() => handleApplyInput(contract.contractId,"Cancel",contract.state.cancelInput)}>
                          Cancel                        
                          </button>
                          <HashLoader color="#4B1FED"
                          cssOverride={cssOverrideSpinnerCentered}
                          loading={isWaitingConfirmation}
                          size={15}
                          id="cancel-id"
                        />
                      </div>
                       : (<span></span>)}
                </td>
              </tr>
            ))}
            {contractsVestingEnded
              .map((contract, index) => (
              <tr key={index}>
                <td>{contractIdLink(marloweScanURL,contract.contractId)}</td>
                <td>{contract.title}</td>
                <td> {contract.claimer.firstName + '  ' + contract.claimer.lastName}</td>
                <td> <span className='text-primary'>Plan Ended</span></td>
                <td>{contract.state.scheme.frequency}</td>
                <td>{contract.state.scheme.numberOfPeriods.toString()}</td>
                <td>{formatADAs(contract.state.quantities.total)}</td>
                <td>{((contract.state.quantities.withdrawable* 100n) / contract.state.quantities.total)  + '%'}</td>
                <td>Vested Tokens aren't yet fully claimed</td>
              </tr>
                ))}
            {contractsNoDepositBeforeDeadline
              .map((contract, index) => (
              <tr key={index}>
                <td>{contractIdLink(marloweScanURL,contract.contractId)}</td>
                <td>{contract.title}</td>
                <td>{contract.claimer.firstName + '  ' + contract.claimer.lastName}</td>
                <td><span className='text-danger'>Deposit Deadline Passed</span></td>
                <td>{contract.state.scheme.frequency}</td>
                <td>{contract.state.scheme.numberOfPeriods.toString()}</td>
                <td>{formatADAs(contract.state.scheme.expectedInitialDeposit.amount)}</td>
                <td>0%</td>
                <td></td>
                <td >
                {contract.state.payMinUtxoBackInput?
                    <div className='d-flex justify-content-start'>
                        <button className='btn btn-outline-danger'
                                disabled = {isWaitingConfirmation} 
                                onClick={() => handleApplyInput(contract.contractId,"Close",contract.state.payMinUtxoBackInput)}>
                              Close                        
                        </button>
                        <HashLoader color="#4B1FED"
                        cssOverride={cssOverrideSpinnerCentered}
                        loading={isWaitingConfirmation}
                        size={15}
                        id="payMinUtxoBackInput-id"
                      />
                    </div>  
                  : (<span></span>)}
                </td>
              </tr>
            ))}
            {contractsClosed
                  .map((contract, index) => (
                  <tr key={index}>
                    <td>{contractIdLink(marloweScanURL,contract.contractId)}</td>
                    <td>{contract.title}</td>
                    <td>{contract.claimer.firstName + '  ' + contract.claimer.lastName}</td>
                    <td><b className='text-secondary'>Closed</b> <br/> <span style={{fontSize :'smaller', whiteSpace:'nowrap'}}>({displayCloseCondition(contract.state.closeCondition)})</span></td>
                    <td>{contract.state.scheme.frequency}</td>
                    <td>{contract.state.scheme.numberOfPeriods.toString()}</td>
                    <td>{formatADAs(contract.state.scheme.expectedInitialDeposit.amount)}</td>
                    <td>0%</td>
                    <td>N/A</td>
                    <td></td>
                  </tr>
                ))}
          </tbody>
        </table> )}
        
      </div>

      <NewVestingScheduleModal 
        showModal={showNewVestingScheduleModal} 
        handleCreateVestingContract={handleCreateVestingContract} 
        closeModal={() => setShowNewVestingScheduleModal(false) } 
        changeAddress={changeAddress} />

    </div>
    
  );
};




export type CurrencyF = String
export type WholeNumberF = string
export type DecimalF = string
const formatADAs = (lovelaces: bigint, isMainnet: Boolean = false, currencyName: string = "₳"): string=> {
  const adas = (Math.trunc(Number(lovelaces).valueOf() / 1_000_000))
  const decimalADAs = (lovelaces % 1_000_000n)
  const currency = isMainnet ? currencyName : "t" + currencyName
  if (decimalADAs === 0n) 
    return adas.toString()  + ' ' + currency;
  else 
    return adas.toString() + ' ' + decimalADAs.toString().padStart(6, '0') + ' ' + currency;
}

const cssOverrideSpinnerCentered 
  = ({display: "block",
      marginLeft: "auto",
      marginRight:"auto",
      height: "auto",
      witdth : "20px",
      paddingTop: "10px"})

export default CreatePlans;