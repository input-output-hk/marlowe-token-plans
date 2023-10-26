import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import HashLoader from "react-spinners/HashLoader";
import './modal.scss';
import "react-datepicker/dist/react-datepicker.css";
import { Vesting } from '@marlowe.io/language-examples';
import { adaToken } from '@marlowe.io/language-core-v1';


interface NewVestingScheduleModalProps {
  showModal: boolean;
  closeModal: () => void;
  handleCreateVestingContract: (firstName : string, lastName : string , title : string,isSelfAttributed : Boolean, request : Vesting.VestingRequest, afterTxSubmitted : () => void) => void;
  changeAddress: string;
}

type FormData = {
  firstName: string;
  lastName : string;
  title : string;
  initialDepositAmount: number;
  startDate: Date;
  numberOfPeriods: number;
  frequency: Vesting.Frequency;
  claimerAddress: string;
};

const initialFormData : () => FormData = () => ({
  firstName: '',
  lastName: '',
  title : '',
  initialDepositAmount: 10,
  startDate: new Date(),
  numberOfPeriods: 2,
  frequency: "by-10-minutes",
  claimerAddress: '',
})

const formErrorsInitialState = {
  firstName: null,
  lastName: null,
  title: null,
  initialDepositAmount: null,
  startDate: null,
  claimerAddress: null,
}

const NewVestingScheduleModal: React.FC<NewVestingScheduleModalProps> = ({ showModal, closeModal, handleCreateVestingContract, changeAddress}) => {


  let [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>(initialFormData());
  
  const [formErrors, setFormErrors] = useState(formErrorsInitialState);
  
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
    let errors = formErrorsInitialState

    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        valid = false;
        errors = { ...errors, [key]: 'This field is required' };
      }
    }

    setFormErrors(errors);

    if (valid) {
      setLoading(true)
      
      handleCreateVestingContract(
        formData.firstName,
        formData.lastName,
        formData.title,
        formData.claimerAddress === changeAddress,
        { provider: { address: changeAddress }, 
          claimer: { address: formData.claimerAddress }, 
          scheme: {
            start: formData.startDate,
            frequency: formData.frequency,
            numberOfPeriods: BigInt(formData.numberOfPeriods),
            expectedInitialDeposit: { token: adaToken, amount: BigInt(formData.initialDepositAmount) * 1_000_000n }}
      }, () => {
        handleClose()
      })
      
    }
  };

  const handleClose = () => {
    setFormData(initialFormData());
    setLoading(false)
    setFormErrors(formErrorsInitialState);
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
                    <h5 className="modal-title">New Vesting Schedule</h5>
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
                      <div className='row'>
                        <div className="form-group my-3">
                        <label htmlFor="title">Title </label>
                          <input
                            type="text"
                            className="form-control"
                            id="title"
                            value={formData.title}
                            onChange={handleInputChange}
                          />
                          {formErrors.title && <small className="text-danger">{formErrors.title}</small>}
                      </div>
                      </div>
                      <div className='row'>
                        <div className="form-group my-2 col-6">
                          <label htmlFor="initialDepositAmount">Initial Deposit (in ₳)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="initialDepositAmount"
                            value={formData.initialDepositAmount}
                            min={10}
                            onChange={handleInputChange}
                          />
                          {formErrors.initialDepositAmount && <small className="text-danger">{formErrors.initialDepositAmount}</small>}
                        </div>
                      </div>
                      <p className='font-weight-bold mt-3'>Schedule</p>
                      <div className='row'>
                        <div className="form-group mb-3 col-6">
                          <div className='row'>
                            <label htmlFor="startDate">Start</label>
                          </div>
                          <DatePicker
                            selected={formData.startDate}
                            onChange={(date) => handleDateInputChange(date, 'startDate')}
                            minDate={new Date()}
                            showTimeSelect={true}
                            dateFormat="Pp"             
                            timeFormat="p"
                            className='form-control'
                            wrapperClassName='col-12'
                            showIcon={true}
                          />
                          {formErrors.startDate && <small className="text-danger">{formErrors.startDate}</small>}
                        </div>
                        <div className="form-group mb-3 col-6">
                          <div className='row'>
                            <label htmlFor="numberOfPeriods">Number of Periods</label>
                          </div>
                          <select
                            value={formData.numberOfPeriods}
                            className="form-control"
                            id="numberOfPeriods"
                            onChange={handleInputChange}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                          </select>
                        </div>
 
                        <div className="form-group my-3 col-6">
                          <label htmlFor="frequency">Frequency</label>
                          <select
                            value={formData.frequency}
                            className="form-control"
                            id="frequency"
                            onChange={handleInputChange}>
                              <option value="by-10-minutes">By 10 Minutes</option>
                              <option value="hourly">Hourly</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="half-yearly">Half-yearly</option>
                              <option value="monthly">Monthly</option>
                              <option value="quaterly">Quaterly</option>
                              <option value="annually">Annually</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group my-3">
                        <p className='font-weight-bold mt-3'>Employee's Details</p>
                        <label htmlFor="claimerAddress">Wallet Address </label>
                        <input
                          type="text"
                          className="form-control"
                          id="claimerAddress"
                          value={formData.claimerAddress}
                          onChange={handleInputChange} />
                        {formErrors.claimerAddress && <small className="text-danger">{formErrors.claimerAddress}</small>}
  
                      </div>
                      <div className="form-group row">
                        <div className="col">
                          <label htmlFor="firstName">First Name </label>
                          <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                          {formErrors.firstName && <small className="text-danger">{formErrors.firstName}</small>}
                        </div>
                        <div className="col">
                          <label htmlFor="lastName">Last Name </label>
                          <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                        {formErrors.lastName && <small className="text-danger">{formErrors.lastName}</small>}
                        </div>
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
                <div className='row justify-content-center'>
                  <div className='col-3' style={{width:"170px"}}>
                     <button type="button" className="btn btn-outline-secondary w-100" onClick={handleClose}>
                      Cancel
                     </button>
                  </div>
                  <div className='col-3'>
                  <div className='d-flex justify-content-start' style={{width:"200px"}}>
                        <button type="button" className="btn btn-primary"  onClick={handleSubmit} disabled = {loading} >
                        Create schedule                       
                        </button>
                        <HashLoader color="#4B1FED"
                        cssOverride={cssOverrideSpinnerCentered}
                        loading={loading}
                        size={15}
                        id="create-contract"
                      />
                  </div>
        
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

export const cssOverrideSpinnerCentered 
  = ({display: "block",
      marginLeft: "auto",
      marginRight:"auto",
      height: "auto",
      witdth : "20px",
      paddingTop: "10px"})

export default NewVestingScheduleModal;
