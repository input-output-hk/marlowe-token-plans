import React from 'react';
import './modal.scss';

interface NewVestingScheduleModalProps {
  showModal: boolean;
  closeModal: () => void;
}

const NewVestingScheduleModal: React.FC<NewVestingScheduleModalProps> = ({ showModal, closeModal }) => {
  return (
    <>
    <div className={`modal ${showModal ? 'show' : ''}`} tabIndex={-1} style={{ display: showModal ? 'block' : 'none' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
            <div className="modal-header">
              <div className='container'>
                <div className='row'>
                  <div className='col-10 text-left'>
                    <h5 className="modal-title">Create vesting schedule</h5>
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
                    <form action="">
                      <p className='font-weight-bold mt-3'>Details</p>
                      <div className="form-group my-3">
                        <label htmlFor="name">Enter name/ID of your schedule</label>
                        <input type="text" className="form-control" id="name"  />
                      </div>
                      <div className="form-group my-3">
                        <label htmlFor="numberOfShares">Enter value of shares for each recipient</label>
                        <input type="text" className="form-control" id="numberOfShares"  />
                      </div>

                      <p className='font-weight-bold mt-3'>Schedule</p>
                      <div className="form-group my-3">
                        <label htmlFor="startDate">Start date</label>
                        <input type="date" className="form-control" id="startDate"  />
                      </div>
                      <div className="form-group my-3">
                        <label htmlFor="endDate">End date</label>
                        <input type="date" className="form-control" id="endDate"  />
                      </div>

                      <div className="form-group my-3">
                        <label htmlFor="vestingCycle">Vesting cycle</label>
                        <select className="form-control" id="vestingCycle">
                          <option value="">Select a cycle</option>
                          <option value="annually">Annually</option>
                          <option value="monthly">monthly</option>
                          {/* Add your options here */}
                        </select>
                      </div>
                      <p className='font-weight-bold mt-3'>Recipients</p>
                      <div className="form-group my-3">
                        <label htmlFor="startDate">Add recipients to each receive the vesting schedule</label>
                        <input type="text" placeholder="Insert or select a wallet" className="form-control" id="startDate"  />
                      </div>
                      <div className='wallet-list my-3'>
                        <ul>
                          <li>$BobsWallet</li>
                          <li>$AliceWallet</li>
                          <li>addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5es...</li>
                        </ul>
                      </div>
                    </form>
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
                    <button type="button" className="btn btn-primary w-100" onClick={() => true}>
                      Create schedule
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

export default NewVestingScheduleModal;
