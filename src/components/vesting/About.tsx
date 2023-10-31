import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import moment from 'moment';

import { BrowserRuntimeLifecycleOptions, mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/browser";
import { Vesting } from "@marlowe.io/language-examples";
import { mkRestClient } from "@marlowe.io/runtime-rest-client";
import { AddressBech32, ContractId, Tags, unAddressBech32 } from '@marlowe.io/runtime-core';
import { RuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/api';
import { ContractDetails } from '@marlowe.io/runtime-rest-client/contract/details';
import HashLoader from 'react-spinners/HashLoader';
import { Input } from '@marlowe.io/language-core-v1';
import { ConnectionWallet } from '../Connection';
import { SupportedWalletName } from '@marlowe.io/wallet/browser';
import { Footer } from '../Footer';

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
        const runtimeLifecycleParameters : BrowserRuntimeLifecycleOptions = { runtimeURL:runtimeURL, walletName:selectedAWalletExtension as SupportedWalletName}
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
      <div style={{width:"700px"}} className="d-flex justify-content-start align-items-baseline" >
          <span ><h1 style={{margin:0}}>Token Plan Prototype</h1> </span>
          <span ><h3 style={{margin:0,paddingLeft:"10px"}}>/ About</h3> </span>
        </div>
        <ConnectionWallet runtimeURL={runtimeURL} setAndShowToast={setAndShowToast} /> 
      </div>
      <div> <button className="btn btn-link" disabled={true} onClick={() => navigate("/about")}>About</button> 
          | <button className="btn btn-link"  onClick={() => navigate("/provider")}>Token Provider's View</button> 
          | <button className="btn btn-link" onClick={() => navigate("/claimer")}>Claimer's View</button> 
          <hr></hr>
        </div>  
      <div className="my-5">
        This prototype  
      </div>
      <Footer />
    </div>
  );
};

export default About;