import React, { useState } from 'react';
import './modal.scss';

interface NewVestingScheduleModalProps {
  showModal: boolean;
  closeModal: () => void;
}

const NewVestingScheduleModal: React.FC<NewVestingScheduleModalProps> = ({ showModal, closeModal }) => {
  const [formData, setFormData] = useState({
    name: '',
    numberOfShares: '',
    startDate: '',
    endDate: '',
    vestingCycle: '',
    recipients: [],
  });

  const [formErrors, setFormErrors] = useState({
    name: null,
    numberOfShares: null,
    startDate: null,
    endDate: null,
    vestingCycle: null,
    recipients: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = () => {
    let valid = true;
    let errors = {
      name: null,
      numberOfShares: null,
      startDate: null,
      endDate: null,
      vestingCycle: null,
      recipients: null,
    };

    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        valid = false;
        errors = { ...errors, [key]: 'This field is required' };
      }
    }

    setFormErrors(errors);

    if (valid) {
      // All fields are filled, proceed with form submission
      console.log('Form submitted with', formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      numberOfShares: '',
      startDate: '',
      endDate: '',
      vestingCycle: '',
      recipients: [],
    });
    setFormErrors({
      name: null,
      numberOfShares: null,
      startDate: null,
      endDate: null,
      vestingCycle: null,
      recipients: null,
    });
    closeModal();
  }


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
                    <button type="button" className="close btn btn-outline-secondary" onClick={handleClose}>
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
                    <form>
                      <p className='font-weight-bold mt-3'>Details</p>
                      <div className="form-group my-3">
                        <label htmlFor="name">Enter name/ID of your schedule</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                        {formErrors.name && <small className="text-danger">{formErrors.name}</small>}
                      </div>
                      <div className="form-group my-3">
                        <label htmlFor="numberOfShares">Enter value of shares for each recipient</label>
                        <input
                          type="text"
                          className="form-control"
                          id="numberOfShares"
                          value={formData.numberOfShares}
                          onChange={handleInputChange}
                        />
                        {formErrors.numberOfShares && <small className="text-danger">{formErrors.numberOfShares}</small>}
                      </div>

                      <p className='font-weight-bold mt-3'>Schedule</p>
                      <div className="form-group my-3">
                        <label htmlFor="startDate">Start date</label>
                        <input
                          type="text"
                          className="form-control"
                          id="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                        />
                        {formErrors.startDate && <small className="text-danger">{formErrors.startDate}</small>}
                      </div>
                      <div className="form-group my-3">
                        <label htmlFor="endDate">End date</label>
                        <input
                          type="text"
                          className="form-control"
                          id="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                        />
                        {formErrors.endDate && <small className="text-danger">{formErrors.endDate}</small>}
                      </div>

                      <div className="form-group my-3">
                        <label htmlFor="vestingCycle">Vesting cycle</label>
                        <select
                          value={formData.vestingCycle}
                          className="form-control"
                          id="vestingCycle"
                          onChange={handleInputChange}
                        >
                          <option value="">Select a cycle</option>
                          <option value="annually">Annually</option>
                          <option value="monthly">monthly</option>
                          {/* Add your options here */}
                        </select>
                        {formErrors.vestingCycle && <small className="text-danger">{formErrors.vestingCycle}</small>}
                      </div>
                      <p className='font-weight-bold mt-3'>Recipients</p>
                      <div className="form-group my-3">
                        <label htmlFor="recipients">Add recipients to each receive the vesting schedule</label>
                        <input
                          type="text"
                          placeholder="Insert or select a wallet" 
                          className="form-control"
                          id="recipients"
                          value={formData.recipients}
                          onChange={handleInputChange}
                        />
                        {formErrors.recipients && <small className="text-danger">{formErrors.recipients}</small>}
  
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
                    <button type="button" className="btn btn-outline-secondary w-100" onClick={handleClose}>
                      Cancel
                    </button>
                  </div>
                  <div className='col'>
                    <button type="button" className="btn btn-primary w-100" onClick={handleSubmit}>
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