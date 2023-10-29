import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';


import { BrowserRuntimeLifecycleOptions, mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/browser";
import { Vesting } from "@marlowe.io/language-examples";
import { mkRestClient } from "@marlowe.io/runtime-rest-client";
import { AddressBech32, ContractId, Tags, unAddressBech32 } from '@marlowe.io/runtime-core';
import { SupportedWallet } from '@marlowe.io/wallet/browser';
import { RuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/api';
import { ContractDetails } from '@marlowe.io/runtime-rest-client/contract/details';
import HashLoader from 'react-spinners/HashLoader';
import { Input } from '@marlowe.io/language-core-v1';
import { Contract } from './Models';
import { contractIdLink, displayCloseCondition } from './Utils';


type YourTokenPlansProps = {
  runtimeURL : string,
  marloweScanURL : string,
  dAppId : string,
  setAndShowToast: (title:string, message:any, isDanger: boolean) => void
};

const YourTokenPlans: React.FC<YourTokenPlansProps> = ({runtimeURL,marloweScanURL,dAppId,setAndShowToast}) => {
  const navigate = useNavigate();
  const selectedAWalletExtension = localStorage.getItem('walletProvider');
  if (!selectedAWalletExtension) { navigate('/'); }
  
  const [runtimeLifecycle, setRuntimeLifecycle] = useState<RuntimeLifecycle>();
  const [changeAddress, setChangeAddress] = useState<string>('')

 
  const [contractsWithinVestingPeriod, setContractsWithinVestingPeriod] = useState<Contract<Vesting.WithinVestingPeriod>[]>([]);
  const [contractsVestingEnded, setContractsVestingEnded] = useState<Contract<Vesting.VestingEnded>[]>([]);
  const [contractsClosed, setContractsClosed] = useState<Contract<Vesting.Closed>[]>([]);

  const [isFetchingFirstTime, setIsFetchingFirstTime] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [isWaitingConfirmation, setWaitingConfirmation] = useState(false);

  const truncatedAddress = changeAddress.slice(0,18);
  

  useEffect(() => {
    const fetchData = async () => {
      if(isFetching) return;
      try {
        const runtimeLifecycleParameters : BrowserRuntimeLifecycleOptions = { runtimeURL:runtimeURL, walletName:selectedAWalletExtension as SupportedWallet}
        const runtimeLifecycle = await mkRuntimeLifecycle(runtimeLifecycleParameters).then((a) => {setRuntimeLifecycle(a);return a})
        const restClient = mkRestClient(runtimeURL); 
        const changeAddress = await runtimeLifecycle.wallet.getChangeAddress()
          .then((changeAddress : AddressBech32) => {setChangeAddress(unAddressBech32(changeAddress));return changeAddress;})
        
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
          contractIdsAndDetailsAndInputHistory.map(([contractId, tags, details, inputHistory]) =>
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
                    state : state}))))).filter(contract => contract.claimer.id === (unAddressBech32(changeAddress).slice(0,18)))
       
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
      } catch (err : any) {
        console.log("Error", err);
        setIsFetchingFirstTime(false)
        setIsFetching(false)
        }
    }

    fetchData()
    const intervalId = setInterval(() => {fetchData()}, 10_000); 
    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAWalletExtension, navigate]);


  
  async function handleClaim(contractId : ContractId, inputsToApply : Input[] | undefined) {
    try {
    if(inputsToApply && runtimeLifecycle) {
      setWaitingConfirmation(true)
      const txId = await runtimeLifecycle.contracts.applyInputs(
        contractId,
        { inputs: inputsToApply }
      );
      setAndShowToast(
        "Claim on Token Plan Submitted",
        "The Token Plan will be updated once the transaction is confirmed...",
        false
      );
      console.log(`Apply Input submitted on Cardano with tx Id : ${txId}`);
      console.log(`Waiting Confirmation : ${txId}`);
      await runtimeLifecycle?.wallet.waitConfirmation(txId);
      setAndShowToast(
        "Claim on the Token Plan is Confirmed",
        "The Token Plan is about to be updated...",
        false
      );
      setWaitingConfirmation(false)
      console.log(`Apply Input Confirmed on Cardano.`);
    }} catch (e) {
      setWaitingConfirmation(false)
      setAndShowToast(
        "Action Aborted",
        "...",
        false
      );
    }
  }


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(changeAddress);
      setAndShowToast(
        'Address copied to clipboard',
        <span>Copied <span className="font-weight-bold">{changeAddress}</span> to clipboard</span>,
        false
      );
    } catch (err) {
      console.error('Failed to copy address: ', err);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('walletProvider');
    setChangeAddress('');
    setAndShowToast(
      'Disconnected wallet',
      <span className='text-color-white'>Please, Connect a wallet to see your Token Plans.</span>,
      false
    );
    navigate('/');
  }
  
  return (
    <div className="container">

      <div className="header">
        <img src="/images/marlowe-logo-primary.svg" alt="Logo" className="mb-4" />
        <div className='col-5 text-center'>
          <h1>Token Plan Prototype</h1>
        </div>
        <div className="connected-wallet-details">
          <div className="dropdown">
            <button className="btn btn-light btn-sm dropdown-toggle mr-2" title="menu" data-bs-toggle="dropdown" aria-expanded="false">
              <span className="truncated">{truncatedAddress}</span>
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" type="button" onClick={() => disconnectWallet()}>
                  Disconnect wallet
                  <img src="/images/electrical_services.svg" alt="icon" style={{ marginLeft: '8px' }} />
                </button>
              </li>
            </ul>
            <button className="btn btn-light btn-sm mr-2" title="Copy Address" onClick={copyToClipboard}>
              <img src="/images/content_copy.svg" alt="content-copy" />
            </button>
            <button className="btn btn-light btn-sm d-none" title="Show QR Code">
              <img src="/images/qr_code_2.svg" alt="QR Code" />
            </button>
          </div>
        </div>
      </div>
      <div><button className="btn btn-link"  disabled={isWaitingConfirmation} onClick={() => navigate("/created-plans")}>Created Token Plans</button> 
          | <button className="btn btn-link" disabled={true} onClick={() => navigate("/your-plans")}>Your Token Plans</button> 
          | <button className="btn btn-link" disabled={isWaitingConfirmation} onClick={() => navigate("/about")}>About</button> 
          <hr></hr>
        </div>  
      <div className="my-5">
        {(isFetchingFirstTime ? 
            <div className='d-flex justify-content-start' style={{width:"150px"}}>
              <HashLoader color="#4B1FED"
                cssOverride={cssOverrideSpinnerCentered}
                loading={isFetchingFirstTime}
                size={15}
                id="loading-plans"/> 
          <div>Loading Plans</div>
          </div> 
          : (contractsWithinVestingPeriod.length === 0 && contractsVestingEnded.length === 0 && contractsClosed.length === 0)? 
              <p>No Plans</p> 
          : 
        <table className="table">
          <thead>
            <tr>
              {/* Headers */}
              <th>Contract Id</th>
              <th>Title</th>
              <th>Status </th>
              <th>Cycle</th>
              <th>Periods</th>
              <th>Total</th>
              <th>Claimable</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          {contractsVestingEnded
              .map((contract, index) => (
              <tr key={index}>
                <td>{contractIdLink(marloweScanURL,contract.contractId)}</td>
                <td>{contract.title}</td>
                <td> <span className='text-primary'>Plan Ended</span></td>
                <td>{contract.state.scheme.frequency}</td>
                <td>{contract.state.scheme.numberOfPeriods.toString()}</td>
                <td>{formatADAs(contract.state.quantities.total)}</td>
                <td>{((contract.state.quantities.withdrawable* 100n) / contract.state.quantities.total)  + '%'}</td>
                <td>
                  {contract.state.withdrawInput? 
                       <div className='d-flex justify-content-start'>
                          <button 
                            className='btn btn btn-outline-primary'
                            disabled = {isWaitingConfirmation}  
                            onClick={() => handleClaim(contract.contractId,contract.state.withdrawInput)}>
                          Claim                        
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
                <td>{(((contract.state.quantities.vested - contract.state.quantities.claimed) * 100n) / contract.state.quantities.total)  + '%'}</td>
                <td>
                  {contract.state.withdrawInput? 
                       <div className='d-flex justify-content-start'>
                          <button 
                            className='btn btn btn-outline-primary'
                            disabled = {isWaitingConfirmation}  
                            onClick={() => handleClaim(contract.contractId,contract.state.withdrawInput)}>
                          Claim                        
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
            {contractsClosed
              .map((contract, index) => (
              <tr key={index}>
                <td>{contractIdLink(marloweScanURL,contract.contractId)}</td>
                <td>{contract.title}</td>
                <td><b className='text-secondary'>Closed</b> <br/> <span style={{fontSize :'smaller', whiteSpace:'nowrap'}}>({displayCloseCondition(contract.state.closeCondition)})</span></td>
                <td>{contract.state.scheme.frequency}</td>
                <td>{contract.state.scheme.numberOfPeriods.toString()}</td>
                <td>{formatADAs(contract.state.scheme.expectedInitialDeposit.amount)}</td>
                <td> Closed </td>
                <td>
                </td>
              </tr>
            ))}
          </tbody>
        </table> )}
      </div>
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

export default YourTokenPlans;