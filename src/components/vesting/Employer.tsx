import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import moment from 'moment';

import NewVestingScheduleModal from '../modals/NewVesting';
import DepositVestingScheduleModal from '../modals/DepositVestingScheduleModal';
import CancelVestingScheduleModal from '../modals/CancelVestingScheduleModal';
import ClaimsModal from '../modals/ClaimsModal';
import ProgressMeter from '../widgets/ProgressMeter';
import { css } from "@emotion/react";
import { BrowserRuntimeLifecycleOptions, mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/browser";
import { Vesting } from "@marlowe.io/language-examples";
import { mkRestClient } from "@marlowe.io/runtime-rest-client";
import { AddressBech32, ContractId, Tags, unAddressBech32 } from '@marlowe.io/runtime-core';
import { SupportedWallet } from '@marlowe.io/wallet/browser';
import { RuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/api';
import { ContractDetails } from '@marlowe.io/runtime-rest-client/contract/details';
import HashLoader from 'react-spinners/HashLoader';
import { Input } from '@marlowe.io/language-core-v1';

const runtimeURL = `${process.env.MARLOWE_RUNTIME_WEB_URL}`;
const employerAddress = `${process.env.EMPLOYER_ADDRESS}`;

const dappId = "marlowe.examples.vesting.v0.0.3";

type VestingScheduleProps = {
  setAndShowToast: (title:string, message:any, isDanger: boolean) => void
};
export type Contract<State> = 
  { contractId : ContractId;
    employee : Employee ;
    title : string;
    state : State;
  }
export type VestingContract = 
  { contractId : ContractId;
    employee : Employee ;
    title : string;
    state : Vesting.VestingState;
  }
export type Employee = 
  { firstName : string
  , lastName : string} 

const VestingSchedule: React.FC<VestingScheduleProps> = ({setAndShowToast}) => {
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

  const [isEmployer, setIsEmployer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const truncatedAddress = changeAddress.slice(0,18);
  const [showNewVestingScheduleModal, setShowNewVestingScheduleModal] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      const runtimeLifecycleParameters : BrowserRuntimeLifecycleOptions = { runtimeURL:runtimeURL, walletName:selectedAWalletExtension as SupportedWallet}
      const runtimeLifecycle = await mkRuntimeLifecycle(runtimeLifecycleParameters).then((a) => {setRuntimeLifecycle(a);return a})
      const restClient = mkRestClient(runtimeURL); 
      await runtimeLifecycle.wallet.getChangeAddress()
        .then((changeAddress : AddressBech32) => 
            { setChangeAddress(unAddressBech32(changeAddress));
              if(unAddressBech32(changeAddress) === employerAddress) {setIsEmployer(true)} 
              else {setIsEmployer(false)} } )
      
      const contractIdsAndTags : [ContractId,Tags][] = (await restClient.getContracts({ tags: [dappId] })).headers.map((header) => [header.contractId,header.tags]);
      const contractIdsAndDetails : [ContractId,Tags,ContractDetails] []= await Promise.all(
        contractIdsAndTags.map(([contractId,tags]) =>
          restClient
            .getContractById(contractId)
            .then((details) => [contractId, tags, details] as [ContractId,Tags,ContractDetails])
        )
      );
      const allContracts : Contract<Vesting.VestingState>[] = await Promise.all(
        contractIdsAndDetails.map(([contractId, tags, details]) =>
          Vesting.getVestingState(
            tags[dappId].scheme,
            details.state,
            (environment) =>
              runtimeLifecycle.contracts.getApplicableInputs(
                contractId,
                environment)
          ).then(state => ({ contractId : contractId,
                             title : tags[dappId].description?tags[dappId].description:"",
                             employee : {firstName : tags[dappId].firstName, lastName:tags[dappId].lastName},
                             state : state})))
      )
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
    }

    fetchData()
      .catch(err => 
        { console.log("Error", err);
          const error = JSON.parse(err);
          const { message } = error;
          setAndShowToast(
            'Failed Retrieving Payouts Infornation',
            <span className='text-color-white'>{message}</span>,
            true)
        })

    const intervalId = setInterval(() => {
      fetchData().catch(err => console.error(err));
    }, 5_000); // 5 seconds
    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [selectedAWalletExtension, navigate, setAndShowToast]);


  
  async function handleApplyInput(contractId : ContractId, inputsToApply : Input[] | undefined) {
    try {
    if(inputsToApply && runtimeLifecycle) {
      const txId = await runtimeLifecycle.contracts.applyInputs(
        contractId,
        { inputs: inputsToApply }
      );
      console.log(`Apply Input submitted on Cardano with tx Id : ${txId}`);
      console.log(`Waiting Confirmation : ${txId}`);
      await runtimeLifecycle?.wallet.waitConfirmation(txId);
      console.log(`Apply Input Confirmed on Cardano.`);
    }} catch (e) {
     
    }
  }

  async function handleCreateVestingContract (firstName : string,lastName : string,title : string, request : Vesting.VestingRequest) {
    try {
      if(runtimeLifecycle) {
        const vestingContract = Vesting.mkContract(request);
        const [contractId, txIdCreated] = await runtimeLifecycle?.contracts.createContract({
              contract: vestingContract,
              tags: { [dappId]: { description: title,firstName:firstName, lastName:lastName, scheme: request.scheme } },
            });
        setShowNewVestingScheduleModal(false);
        setAndShowToast(
          "New Vesting Contract Submitted",
          "The contract will be listed once confirmed on Cardano",
          false
        );
        console.log(`Contract submitted on Cardano with Id : ${contractId}`);
        console.log(`Waiting Confirmation : ${txIdCreated}`);
        await runtimeLifecycle?.wallet.waitConfirmation(txIdCreated);
        console.log(`Contract Creation Confirmed on Cardano.`);
      }
    } catch (e) {
      setAndShowToast(
        "Creation Aborted",
        "Please rety...",
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
      <span className='text-color-white'>Please connect a wallet to see a list of available payouts.</span>,
      false
    );
    navigate('/');
  }
  
  function formatDate(date: Date) {
    return moment(date).format('hh:mma MM/DD/YYYY');
  }


  function renderClaimProgress(contract: Contract<Vesting.WithinVestingPeriod | Vesting.VestingEnded>) {
    const {percentage,claimed,vested} =  
      {percentage : (contract.state.quantities.claimed / contract.state.quantities.total) * 100n
      , vested : contract.state.quantities.vested
      , claimed :contract.state.quantities.claimed }

    return (
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-6'>
            <ProgressMeter percentage={Number(percentage)} classNames='progress-bar' />
          </div>
        </div>
        <div className='row justify-content-center'>
            <span>{claimed.toString()}/{vested.toString()}</span>
        </div>
      </div>
    )
  }


  return (
    <div className="container">

      <div className="header">
        <img src="/images/marlowe-logo-primary.svg" alt="Logo" className="mb-4" />
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
      <div className='row'>
        <div className='col text-left'>
          <h2>Vesting Prototype</h2>
        </div>
        <div className='col text-right'>
          <button className='btn btn-outline-primary' onClick={() => setShowNewVestingScheduleModal(true)}>
            Add New schedule
          </button>
        </div> 
      </div>
      <div className="my-5">
        <h5>Schedules Waiting for Initial Deposit</h5>
        {contractsWaitingForDeposit.length === 0 
          ? <p>No Schedules</p>
          :  
        <table className="table">
          <thead>
            <tr>
              {/* Headers */}
              <th className="pb-2" scope="col">Title </th>
              <th className="pb-2" scope="col">Employee</th>
              <th className="pb-2" scope="col">Start</th>
              <th className="pb-2" scope="col">Deposit Deadline</th>
              <th className="pb-2" scope="col">Expected Deposit</th>
              <th className="pb-2" scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {contractsWaitingForDeposit
              .map((contract, index) => (
              <tr key={index}>
                <td>{contract.title}</td>
                <td> {contract.employee.firstName + '  ' + contract.employee.lastName}</td>
                <td>{formatDate(contract.state.scheme.start)}</td>
                <td>{formatDate(contract.state.initialDepositDeadline)}</td>
                <td>{formatADAs(contract.state.scheme.expectedInitialDeposit.amount)}</td>
                <td>
                  {contract.state.depositInput? 
                        <button className='btn btn-outline-success' onClick={() => handleApplyInput(contract.contractId,contract.state.depositInput)}>
                          Deposit
                        </button>
                       : (<span className='status-awaiting warning-color font-weight-bold'>Awaiting</span>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>

      <div className="my-5">
        <h5>Schedules Where Initial Deposit Deadlines have passed </h5>
        {contractsNoDepositBeforeDeadline.length === 0 
          ? <p>No Schedules</p>
          :  
        <table className="table">
          <thead>
            <tr>
              {/* Headers */}
              <th className="pb-2" scope="col">Title </th>
              <th className="pb-2" scope="col">Employee</th>
              <th className="pb-2" scope="col">Start</th>
              <th className="pb-2" scope="col">Deposit Deadline</th>
              <th className="pb-2" scope="col">Expected Deposit</th>
              <th className="pb-2" scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {contractsNoDepositBeforeDeadline
              .map((contract, index) => (
              <tr key={index}>
                <td>{contract.title}</td>
                <td> {contract.employee.firstName + '  ' + contract.employee.lastName}</td>
                <td>{formatDate(contract.state.scheme.start)}</td>
                <td>{formatDate(contract.state.initialDepositDeadline)}</td>
                <td>{formatADAs(contract.state.scheme.expectedInitialDeposit.amount)}</td>
                <td>
                  {contract.state.payMinUtxoBackInput? 
                       <button className='btn btn-outline-danger' onClick={() => handleApplyInput(contract.contractId,contract.state.payMinUtxoBackInput)}>
                          Close
                        </button>
                       : (<span className='status-awaiting warning-color font-weight-bold'>Outdated</span>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>


      <div className="my-5">
        <h5>Schedules In Progress</h5>
        {contractsWithinVestingPeriod.length === 0 
          ? <p>No Schedules</p>
          : 
        <table className="table">
          <thead>
            <tr>
              {/* Headers */}
              <th className="pb-3" scope="col">Title</th>
              <th className="pb-3" scope="col">Start date</th>
              <th className="pb-3" scope="col">End date</th>
              <th className="pb-3" scope="col">Total</th>
              <th className="pb-3" scope="col">Vested</th>
              <th className="pb-3" scope="col">Claimed</th>
              <th className="pb-3" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contractsWithinVestingPeriod
              .map((contract, index) => (
              <tr key={index}>
                <td className='py-3'> {contract.employee.firstName + '  ' + contract.employee.lastName}</td>
                <td className='py-3'>{formatDate(contract.state.periodInterval[0])}</td>
                <td className='py-3'>{formatDate(contract.state.periodInterval[1])}</td>
                <td className='py-3'>{formatADAs(contract.state.quantities.total)}</td>
                <td className='py-3'>{formatADAs(contract.state.quantities.vested)}</td>
                <td>{contract.title}</td>
                <td className='py-3'>{renderClaimProgress(contract)}</td>
                <td className='py-3'>
                  {contract.state.cancelInput? 
                       <button className='btn btn-outline-danger' onClick={() => handleApplyInput(contract.contractId,contract.state.cancelInput)}>
                          Cancel
                        </button>
                       : (<span></span>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table> }
      </div>


      <div className="my-5">
        <h5>Schedules Closed</h5>
        {contractsClosed.length === 0 
          ? <p>No Schedules</p>
          : 
        <table className="table">
          <thead>
            <tr>
              {/* Headers */}
              <th className="pb-3" scope="col">Title</th>
              <th className="pb-3" scope="col">Employee</th>
            </tr>
          </thead>
          <tbody>
            {contractsClosed
              .map((contract, index) => (
              <tr key={index}>
                <td className='py-3'> {contract.title}</td>
                <td className='py-3'> {contract.employee.firstName + '  ' + contract.employee.lastName}</td>
              </tr>
            ))}
          </tbody>
        </table> }
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


export default VestingSchedule;