import React from 'react';
import Payout from '../models/Payout';
import Token from '../models/Token';

interface ClaimModalProps {
  showModal: boolean;
  closeModal: () => void;
  // payoutsToBePaidIds: string[];
  // payouts: Payout[];
  // destinationAddress: string;
  // handleWithdrawals: () => void;
}

const extractAmount = () => {
  // return payout.tokens.map((token: Token) => token.amount).reduce((a, b) => a + b, 0n).toString();
};

const ClaimsModal: React.FC<ClaimModalProps> = ({ showModal, closeModal }) => {
  // const payoutsToBePaid = payouts.filter(payout => payoutsToBePaidIds.includes(payout.payoutId));

  return (
    <>
      <div className={`modal ${showModal ? 'show' : ''}`} tabIndex={-1} style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className='container'>
                <div className='row'>
                  <div className='col-10 text-left'>
                    <h5 className="modal-title">Confirm Withdrawal</h5>
                  </div>
                  <div className='col-2 text-right'>
                    <button type="button" className="close btn btn-outline-secondary" onClick={closeModal}>
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className='container'>
                <div className='row'>
                  <div className='col-12'>
                    <div className='container outer-modal-body'>
                      <p className='font-weight-bold'>Reward name</p>
                      <div className='container inner-modal-body'>
                        <ul>
                          {/* {payoutsToBePaid.map((payout, index) => (
                            <li key={index}>{payout.payoutId}: {extractAmount(payout)} lovelace</li>
                          ))} */}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className='col-12 my-3'>
                    <hr className='mx-1'/>
                    <p className='transfer-title'>
                      Will transfer to
                    </p>
                    <hr className='mx-1'/>
                  </div>

                  <div className='col-12'>
                    <p className='destination-address-title'>Your wallet address</p>
                    <div className='container destination-address-container'>
                      {/* <p className='destination-address'>{destinationAddress}</p> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className='container'>
                <div className='row'>
                  <div className='col'>
                    <button type="button" className="btn btn-outline-secondary w-100" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                  <div className='col'>
                    {/* <button type="button" className="btn btn-primary w-100" onClick={handleWithdrawals}>
                      Confirm
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop show"></div>}
    </>
  );
};

export default ClaimsModal;
