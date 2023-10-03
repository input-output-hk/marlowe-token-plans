import React, { useEffect, useState } from 'react';
import MarloweSDK from '../services/MarloweSDK';
import { useNavigate } from 'react-router-dom';
import { Browser } from "@marlowe.io/runtime-lifecycle"
import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/dist/apis/runtimeLifecycle"
import { unAddressBech32 } from "@marlowe.io/runtime-core"
import * as O from 'fp-ts/lib/Option.js'
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from 'fp-ts/lib/function';
import Contract from '../models/Contract';
import moment from 'moment';
import Status from '../models/Status';
import NewVestingScheduleModal from './modals/NewVestingScheduleModal';
import DepositVestingScheduleModal from './modals/DepositVestingScheduleModal';
import CancelVestingScheduleModal from './modals/CancelVestingScheduleModal';
import ClaimsModal from './modals/ClaimsModal';
import ProgressMeter from './widgets/ProgressMeter';

const runtimeURL = `${process.env.MARLOWE_RUNTIME_WEB_URL}`;

type VestingScheduleProps = {
  sdk: MarloweSDK,
  setAndShowToast: (title:string, message:any, isDanger: boolean) => void
};

enum VestingScheduleModal {
  NEW = 'new',
  CANCEL = 'cancel',
  CLAIM = 'claim',
  DEPOSIT = 'deposit',
}

const VestingSchedule: React.FC<VestingScheduleProps> = ({sdk, setAndShowToast}) => {
  const navigate = useNavigate();
  const selectedAWalletExtension = localStorage.getItem('walletProvider');
  if (!selectedAWalletExtension) { navigate('/'); }

  // TODO: Flip these two lines once we're ready to use the SDK
  const sdkContracts = sdk.getContracts();
  // const [sdk, setSdk] = useState<RuntimeLifecycle>();
  const [contracts, setContracts] = useState<any[]>(sdkContracts);
  // const [contracts, setContracts] = useState<any[]>([]);

  const contract = contracts[0];

  const [changeAddress, setChangeAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false);

  const truncatedAddress = changeAddress.slice(0,18);
  const [showModal, setShowModal] = useState(false);
  const [showNewVestingScheduleModal, setShowNewVestingScheduleModal] = useState(false);
  const [showEditVestingScheduleModal, setShowEditVestingScheduleModal] = useState(false);
  const [showDepositVestingScheduleModal, setShowDepositVestingScheduleModal] = useState(false);

  const openModal = (modalName:string) => {
    switch (modalName) {
      case VestingScheduleModal.NEW:
        setShowNewVestingScheduleModal(true);
        break;
      case VestingScheduleModal.DEPOSIT:
        setShowDepositVestingScheduleModal(true);
        break;
      case VestingScheduleModal.CANCEL:
        setShowEditVestingScheduleModal(true);
        break;
      default:
        setShowModal(true);
        break;
    }
  };

  const fetchData = async () => {
    if (!selectedAWalletExtension) { navigate('/'); }
    else {
      const runtimeLifecycle = await Browser.mkRuntimeLifecycle(runtimeURL)(selectedAWalletExtension)()
      // setSdk(runtimeLifecycle)
      const newChangeAddress = await runtimeLifecycle.wallet.getChangeAddress()
      setChangeAddress(unAddressBech32(newChangeAddress))
      await pipe(runtimeLifecycle.payouts.available(O.none) // TODO payouts -> vesting?
        , TE.match(
          (err) => {
            console.log("Error", err);
            const response = err?.request?.response;
            if (!response) { return }
            const error = JSON.parse(response);
            const { message } = error;
            setAndShowToast(
              'Available Payouts Request Failed',
              <span className='text-color-white'>{message}</span>,
              true
            );
          },
          a => true))()
      await pipe(runtimeLifecycle.payouts.withdrawn(O.none) // TODO payouts -> vesting?
        , TE.match(
          (err) => {
            console.log("Error", err);
            const response = err?.request?.response;
            if (!response) { return }
            const error = JSON.parse(response);
            const { message } = error;
            setAndShowToast(
              'Withdrawn Payouts Request Failed',
              <span className='text-color-white'>{message}</span>,
              true
            );
          },
          a => true))()
    }
  }

  useEffect( () => {
    fetchData().catch(err => console.error(err));
  },[selectedAWalletExtension, navigate]);

  const closeModal = ( modalName: string) => {
    switch (modalName) {
      case VestingScheduleModal.NEW:
        setShowNewVestingScheduleModal(false);
        break;
      case VestingScheduleModal.DEPOSIT:
        setShowDepositVestingScheduleModal(false);
        break;
      case VestingScheduleModal.CANCEL:
        setShowEditVestingScheduleModal(false);
        break;
      default:
        setShowModal(false);
        break;
    }
  };

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
  

  const isManager = (contract: Contract) => {
    return contract.managingAddress === changeAddress;
  }

  function formatDate(date: Date) {
    return moment(date).format('MM/DD/YYYY');
  }

  function renderAction(contract: Contract) {
    switch (contract.status) {
      case Status.CREATED:
        if (isManager(contract)) {
          return (
            <button className='btn btn-outline-success font-weight-bold' onClick={() => openModal(VestingScheduleModal.DEPOSIT)}>
              Deposit
            </button>
          );
        }
        return (<span className='status-awaiting warning-color font-weight-bold'>Awaiting</span>)
      case Status.PENDING:
        return (<span className='status-awaiting warning-color font-weight-bold'>Awaiting</span>)
      case Status.IN_PROGRESS:
        if (isManager(contract)) {
          return (
            <button className='btn btn-outline-danger font-weight-bold' onClick={() => openModal(VestingScheduleModal.CANCEL)}>
              Cancel
            </button>
          );
        } else {
          return (
            <button className='btn btn-outline-primary font-weight-bold' onClick={() => openModal(VestingScheduleModal.CLAIM)}>
              Claim
            </button>
          );
        }
  
      case Status.CANCELLED:
        return (<span className='status-cancelled'>Cancelled</span>)
      case Status.CLAIMED:
        return (<span className='status-claimed'>Claimed</span>)
    }
  }

  function renderClaimProgress(contract: Contract) {
    const metadata:any = contract.metadata;
    const { vestedShares, claimedShares } = metadata;
    const percentage = (claimedShares / vestedShares) * 100;

    const classNames = contract.status == Status.PENDING ? 'progress-bar bg-warning' : 'progress-bar';

    return (
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-6'>
            <ProgressMeter percentage={percentage} classNames={classNames} />
          </div>
        </div>
        <div className='row justify-content-center'>
            <span>{claimedShares}/{vestedShares}</span>
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
          <p className="title">Select rewards to withdraw</p>
        </div>
        {(isManager(contract)) ? 
          <div className='col text-right'>
            <button className='btn btn-outline-primary font-weight-bold' onClick={() => openModal('new')}>
              Create a vesting schedule
            </button>
          </div> : <div></div>
        }

      </div>
      <div className="my-5">
        <table className="table">
          <thead>
            <tr>
              {/* Logos */}
              <th className="pt-3" scope="col"><img src="images/fingerprint.svg" alt="Name Logo" className="header-logo" /></th>
              <th className="pt-3" scope="col"><img src="images/event_available.svg" alt="Start Date Logo" className="header-logo" /></th>
              <th className="pt-3" scope="col"><img src="images/event_busy.svg" alt="End Date Logo" className="header-logo" /></th>
              <th className="pt-3" scope="col"><img src="images/cycle.svg" alt="Next Vest Date Logo" className="header-logo" /></th>
              <th className="pt-3" scope="col"><img src="images/forest.svg" alt="Total Shares Logo" className="header-logo" /></th>
              <th className="pt-3" scope="col"><img src="images/nature.svg" alt="Vested Logo" className="header-logo" /></th>
              <th className="pt-3" scope="col"><img src="images/nature_people.svg" alt="Claim Logo" className="header-logo" /></th>
              <th className="pt-3" scope="col"><img src="images/check_circle.svg" alt="Actions Logo" className="header-logo" /></th>
            </tr>
            <tr>
              {/* Headers */}
              <th className="pb-3" scope="col">Name</th>
              <th className="pb-3" scope="col">Start date</th>
              <th className="pb-3" scope="col">End date</th>
              <th className="pb-3" scope="col">Next vest date</th>
              <th className="pb-3" scope="col">Total shares</th>
              <th className="pb-3" scope="col">Vested</th>
              <th className="pb-3" scope="col">Claimed</th>
              <th className="pb-3" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract, index) => (
              <tr key={index}>
                <td className='py-3'>{contract.id}</td>
                <td className='py-3'>{formatDate(contract.metadata.startDate)}</td>
                <td className='py-3'>{formatDate(contract.metadata.endDate)}</td>
                <td className='py-3'>{formatDate(contract.metadata.nextVestingDate)}</td>
                <td className='py-3'>{contract.metadata.totalShares}</td>
                <td className='py-3'>{contract.metadata.vestedShares}</td>
                <td className='py-3'>{renderClaimProgress(contract)}</td>
                <td className='py-3'>
                  {renderAction(contract)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <NewVestingScheduleModal showModal={showNewVestingScheduleModal} closeModal={() => closeModal(VestingScheduleModal.NEW) } changeAddress={changeAddress} />
      <DepositVestingScheduleModal showModal={showDepositVestingScheduleModal} closeModal={() => closeModal(VestingScheduleModal.DEPOSIT)} />
      <CancelVestingScheduleModal showModal={showEditVestingScheduleModal} closeModal={() => closeModal(VestingScheduleModal.CANCEL)} changeAddress={changeAddress} />
      <ClaimsModal showModal={showModal} closeModal={() => closeModal(VestingScheduleModal.CLAIM)}  changeAddress={changeAddress} />
    </div>
  );
};

export default VestingSchedule;