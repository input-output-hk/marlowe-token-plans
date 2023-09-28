import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import './modal.scss';
import "react-datepicker/dist/react-datepicker.css";

interface NewVestingScheduleModalProps {
  showModal: boolean;
  closeModal: () => void;
  changeAddress: string;
}

const NewVestingScheduleModal: React.FC<NewVestingScheduleModalProps> = ({ showModal, closeModal, changeAddress}) => {

  type FormData = {
    name: string;
    numberOfShares: string;
    startDate: Date;
    endDate: Date;
    vestingCycle: string;
    recipient: string;
  };

  const [formData, setFormData] = useState<FormData>({
    name: '',
    numberOfShares: '',
    startDate: new Date,
    endDate: new Date,
    vestingCycle: '',
    recipient: '',
  });

  const [formErrors, setFormErrors] = useState({
    name: null,
    numberOfShares: null,
    startDate: null,
    endDate: null,
    vestingCycle: null,
    recipient: null,
  });

  const [recipientInput, setRecipientInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleDateInputChange = (date: Date | null, id: string) => {
    setFormData({
      ...formData,
      [id]: date,
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
      recipient: null,
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
      startDate: new Date,
      endDate: new Date,
      vestingCycle: '',
      recipient: '',
    });
    setFormErrors({
      name: null,
      numberOfShares: null,
      startDate: null,
      endDate: null,
      vestingCycle: null,
      recipient: null,
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
                      <div className='row'>
                        <div className="form-group my-3 col-6">
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
                      </div>
                      <p className='font-weight-bold mt-5'>Schedule</p>
                      <div className='row'>
                        <div className="form-group mb-3 col-6">
                          <div className='row'>
                            <label htmlFor="startDate">Start date</label>
                          </div>
                          <DatePicker
                            selected={formData.startDate}
                            onChange={(date) => handleDateInputChange(date, 'startDate')}
                            minDate={new Date}
                            className='form-control'
                            wrapperClassName='col-12'
                            showIcon={true}
                          />
                          {formErrors.startDate && <small className="text-danger">{formErrors.startDate}</small>}
                        </div>
                        <div className="form-group mb-3 col-6">
                          <div className='row'>
                            <label htmlFor="endDate">End date</label>
                          </div>
                          <DatePicker
                            selected={formData.endDate}
                            onChange={(date) => handleDateInputChange(date, 'endDate')}
                            minDate={new Date}
                            className='form-control'
                            wrapperClassName='col-12'
                            showIcon={true}
                          />
                          {formErrors.endDate && <small className="text-danger">{formErrors.endDate}</small>}
                        </div>

                        <div className="form-group my-3 col-6">
                          <label htmlFor="vestingCycle">Vesting cycle</label>
                          <select
                            value={formData.vestingCycle}
                            className="form-control"
                            id="vestingCycle"
                            onChange={handleInputChange}
                          >
                            <option value="">Select a cycle</option>
                            <option value="annually">Annually</option>
                            <option value="monthly">Monthly</option>
                          </select>
                          {formErrors.vestingCycle && <small className="text-danger">{formErrors.vestingCycle}</small>}
                        </div>
                      </div>
                      <p className='font-weight-bold mt-3'>Recipients</p>
                      <div className="form-group my-3">
                        <label htmlFor="recipient">Add the recipient to receive the vesting schedule</label>
                        <input
                          type="text"
                          className="form-control"
                          id="recipient"
                          value={formData.recipient}
                          onChange={handleInputChange}
                        />
                        {formErrors.recipient && <small className="text-danger">{formErrors.recipient}</small>}
  
                      </div>
                    <div className='col-12 my-3'>
                      <hr className='mx-1'/>
                    </div>

                    <div className='col-12'>
                      <p className='destination-address-title'>Your wallet address</p>
                      <div className='container destination-address-container'>
                        <p className='destination-address'>{changeAddress}</p>
                      </div>
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
