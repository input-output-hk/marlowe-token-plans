import React, {useState} from 'react';
import ClaimDetail from '../widgets/ClaimDetail';
import moment from 'moment';
import ProgressMeter from '../widgets/ProgressMeter';

interface ClaimModalProps {
  showModal: boolean;
  closeModal: () => void;
  changeAddress: string;
}

const ClaimsModal: React.FC<ClaimModalProps> = ({ showModal, closeModal, changeAddress }) => {

  const claim = {
    name: 'ID 1',
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().add(1, 'years').format('YYYY-MM-DD'),
    nextVestDate: moment().add(1, 'months').format('YYYY-MM-DD'),
    totalShares: '1000',
    vestedShares: '100',
    claimedShares: '0',
  }
  const [sharesLeft, setSharesLeft] = useState(Number(claim.vestedShares))

  const handleSharesLeft = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSharesLeft(Number(claim.vestedShares) - Number(value))
  }

  return (
    <>
      <div className={`modal ${showModal ? 'show' : ''}`} tabIndex={-1} style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className='container'>
                <div className='row'>
                  <div className='col-10 text-left'>
                    <h5 className="modal-title">Claim shares</h5>
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
                    <ClaimDetail imgSrc="images/fingerprint.svg" altText="Name" label="Name" value={claim.name} />
                    <ClaimDetail imgSrc="images/event_available.svg" altText="Start date" label="Start date" value={claim.startDate}/>
                    <ClaimDetail imgSrc="images/event_busy.svg" altText="End date" label="End date" value={claim.endDate}/>
                    <ClaimDetail imgSrc="images/cycle.svg" altText="Next vest date" label="Next vest date" value={claim.nextVestDate}/>
                    <ClaimDetail imgSrc="images/forest.svg" altText="Total shares" label="Total shares" value={claim.totalShares}/>
                    <ClaimDetail imgSrc="images/nature.svg" altText="Vested shares" label="Vested shares" value={claim.vestedShares}/>
                    <ClaimDetail imgSrc="images/check_circle.svg" altText="Claimed shares" label="Claimed shares" value={claim.claimedShares}/>
                  </div>
                  <div className='col-12 my-3'>
                    <ProgressMeter percentage={Number(claim.vestedShares) / Number(claim.totalShares) * 100} classNames="progress-bar" />
                    <hr className='mx-1'/>
                  </div>

                  <div className='col-12 position-relative'>
                    <label htmlFor="amountToClaim" className="form-label">Enter number of shares to claim</label>
                    <input type="number" onChange={handleSharesLeft} className="form-control shadow text-color-primary font-weight-bold" max={claim.vestedShares} min={1} />
                    <span className="position-absolute end-0 top-50 translate-middle-y font-weight-bold" style={{ paddingRight: '20px', paddingTop: '30px' }}>
                      {sharesLeft} left
                    </span>
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
                      <p className='destination-address'>{changeAddress}</p>
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
                    <button type="button" className="btn btn-primary w-100" onClick={closeModal}>
                      Confirm
                    </button>
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
