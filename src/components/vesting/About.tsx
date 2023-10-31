import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import moment from 'moment';

import { BrowserRuntimeLifecycleOptions, mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/browser";
import { Vesting } from "@marlowe.io/language-examples";
import { mkRestClient } from "@marlowe.io/runtime-rest-client";
import { AddressBech32, ContractId, Tags, unAddressBech32 } from '@marlowe.io/runtime-core';
import { SupportedWallet } from '@marlowe.io/wallet/browser';
import { RuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/api';
import { ContractDetails } from '@marlowe.io/runtime-rest-client/contract/details';
import HashLoader from 'react-spinners/HashLoader';
import { Input } from '@marlowe.io/language-core-v1';
import { ConnectionWallet } from '../Connection';

const runtimeURL = `${process.env.MARLOWE_RUNTIME_WEB_URL}`;

const dappId = "marlowe.examples.vesting.v0.0.4";

type AboutProps = {
  setAndShowToast: (title:string, message:any, isDanger: boolean) => void
};


const About: React.FC<AboutProps> = ({setAndShowToast}) => {
  const navigate = useNavigate();
  const selectedAWalletExtension = localStorage.getItem('walletProvider');
  if (!selectedAWalletExtension) { navigate('/'); }
  const [changeAddress, setChangeAddress] = useState<string>('')
  const truncatedAddress = changeAddress.slice(0,18);

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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const runtimeLifecycleParameters : BrowserRuntimeLifecycleOptions = { runtimeURL:runtimeURL, walletName:selectedAWalletExtension as SupportedWallet}
        const runtimeLifecycle = await mkRuntimeLifecycle(runtimeLifecycleParameters)
        await runtimeLifecycle.wallet.getChangeAddress()
          .then((changeAddress : AddressBech32) => setChangeAddress(unAddressBech32(changeAddress)))
        
      } catch (err : any) {
        console.log("Error", err);
        const error = JSON.parse(err);
        const { message } = error;
        setAndShowToast(
          'Failed Retrieving Payouts Infornation',
          <span className='text-color-white'>{message}</span>,
          true)
        }
    }

    fetchData()
    const intervalId = setInterval(() => {fetchData()}, 10_000); // 5 seconds
    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [selectedAWalletExtension, navigate, setAndShowToast]);


  return (
    <div className="container">
      <div className="header">
        <img src="/images/marlowe-logo-primary.svg" alt="Logo" />
        <h1 style={{margin:0}}>Token Plan Prototype</h1>
        <ConnectionWallet runtimeURL={runtimeURL} setAndShowToast={setAndShowToast} /> 
      </div>
      <div><button className="btn btn-link"  onClick={() => navigate("/created-plans")}>Created Token Plans</button> 
          | <button className="btn btn-link" onClick={() => navigate("/your-plans")}>Your Token Plans</button> 
          | <button className="btn btn-link" disabled={true} onClick={() => navigate("/about")}>About</button> 
          <hr></hr>
        </div>  
      <div className="my-5">
        Prototype Description to be done.
      </div>
    </div>
    
  );
};

export default About;