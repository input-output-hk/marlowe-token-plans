// Payouts.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarloweSDK from '../services/MarloweSDK';
import PayoutsModal from './ClaimsModal';
import Token from '../models/Token';
import Payout from '../models/Payout';
import moment from 'moment';
import Status from '../models/Status';

type VestingScheduleProps = {
  sdk: MarloweSDK,
  setAndShowToast: (title:string, message:any) => void
};

const Payouts: React.FC<VestingScheduleProps> = ({sdk, setAndShowToast}) => {
  const changeAddress = sdk.changeAddress || '';
  const truncatedAddress = changeAddress.slice(0,18);
  const sdkPayouts = sdk.getPayouts();
  const navigate = useNavigate();
  const [payoutsToBePaidIds, setPayoutsToBePaidIds] = useState<string[]>([]);
  const [payouts, setPayouts] = useState<any[]>(sdkPayouts);
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const walletProvider = localStorage.getItem('walletProvider');
    if (walletProvider && !changeAddress) {
      navigate('/');
    }
  }, [changeAddress, navigate]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(changeAddress);
      setAndShowToast(
        'Address copied to clipboard',
        <span>Copied <span className="font-weight-bold">{changeAddress}</span> to clipboard</span>
      );
    } catch (err) {
      console.error('Failed to copy address: ', err);
    }
  };

  const disconnectWallet = () => {
    sdk.disconnectWallet();
    localStorage.setItem('walletProvider', '');
    setAndShowToast(
      'Disconnected wallet',
      <span>Please connect a wallet to see a list of available payouts.</span>
    );
    navigate('/');
  }

  const showTooManyPayoutsWarning = () => {
      return setAndShowToast(
        'Warning: Too many payouts selected',
        <div>
          <span>This payout bundle might be too big to go on chain.</span>
          <span>Please consider breaking up your payouts into smaller bundles</span>
        </div>
      );
  }

  const handleWithdrawals = async () => {
    try {
      const payoutsToBeWithdrawn = payouts.filter(payout => payoutsToBePaidIds.includes(payout.payoutId))
      await sdk.withdrawPayouts(payoutsToBeWithdrawn,
      () => {
        const newState = sdk.getPayouts().filter(payout => !payoutsToBePaidIds.includes(payout.payoutId));
        setPayouts(newState);
        setPayoutsToBePaidIds([]);
        setAndShowToast(
          'Payouts withdrawn',
          <span>Successfully withdrew payouts.</span>
        );
      });
    } catch (err) {
      console.error('Failed to withdraw payouts: ', err);
      setAndShowToast(
        'Failed to withdraw payouts',
        <span>Failed to withdraw payouts. Please try again.</span>
      );
    }
  }

  function formatDate(date: Date) {
    return moment(date).format('MM/DD/YYYY');
  }

  function handlePayout(payoutId: string) {
    return true;
  }

  function renderAction(payout: Payout) {
    switch (payout.status) {
      case Status.PENDING:
        return (<span className='status-awaiting'>Awaiting</span>)
      case Status.IN_PROGRESS:
        return (
          <button className='btn btn-outline-danger' onClick={() => handlePayout(payout.payoutId)}>
            Cancel
          </button>
        );
      case Status.CANCELLED:
        return (<span className='status-cancelled'>Cancelled</span>)
      case Status.CLAIMED:
        return (<span className='status-claimed'>Claimed</span>)
    }
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
        <div className='col text-right'>
          <button className='btn btn-outline-primary' onClick={openModal}>
              Create a vesting schedule
          </button>
        </div>

      </div>
      <div className="my-5">
        <table className="table">
          <thead>
            <tr>
              {/* Logos */}
              <th scope="col"><img src="images/fingerprint.svg" alt="Name Logo" className="header-logo" /></th>
              <th scope="col"><img src="images/event_available.svg" alt="Start Date Logo" className="header-logo" /></th>
              <th scope="col"><img src="images/event_busy.svg" alt="End Date Logo" className="header-logo" /></th>
              <th scope="col"><img src="images/cycle.svg" alt="Next Vest Date Logo" className="header-logo" /></th>
              <th scope="col"><img src="images/forest.svg" alt="Total Shares Logo" className="header-logo" /></th>
              <th scope="col"><img src="images/nature.svg" alt="Vested Logo" className="header-logo" /></th>
              <th scope="col"><img src="images/nature_people.svg" alt="Claim Logo" className="header-logo" /></th>
              <th scope="col"><img src="images/check_circle.svg" alt="Actions Logo" className="header-logo" /></th>
            </tr>
            <tr>
              {/* Headers */}
              <th scope="col">Name</th>
              <th scope="col">Start date</th>
              <th scope="col">End date</th>
              <th scope="col">Next vest date</th>
              <th scope="col">Total shares</th>
              <th scope="col">Vested</th>
              <th scope="col">Claim</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout, index) => (
              <tr key={index}>
                <td className='py-3'>{payout.payoutId}</td>
                <td className='py-3'>{formatDate(new Date())}</td>
                <td className='py-3'>{formatDate(new Date())}</td>
                <td className='py-3'>{formatDate(new Date())}</td>
                <td className='py-3'>{payout.role.tokenName}</td>
                <td className='py-3'>{payout.role.tokenName}</td>
                <td className='py-3'>{payout.tokens.map((tk : Token) => tk.tokenName).join(", ")}</td>
                <td className='py-3'>
                  {renderAction(payout)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PayoutsModal showModal={showModal} closeModal={closeModal} payoutsToBePaidIds={payoutsToBePaidIds} payouts={payouts} handleWithdrawals={handleWithdrawals} destinationAddress={sdk.getDestinationAddress()} />
    </div>
  );
};

export default Payouts;

