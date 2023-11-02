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
      <div style={{fontFamily:"inter"}}>
        <h3>Overview</h3>
        <p>This Prototype is a Cardano/Marlowe DApp allowing you to create <b>₳ Token Plans</b> over Cardano. <b>₳ Token Plans</b> are created by a "<b>Token Provider</b>". The Provider will deposit a given ₳ amount with a time-based scheme 
           defining how to release these ₳ over time to a "<b>Claimer</b>". In the context of this prototype, we have combined these 2 
           participants' views to simplify the use case demonstration (see menu above).</p>

        <p>The intent here is not to provide services to you over Cardano, but to demonstrate Marlowe technology capabilities with a concrete 
           and fully open-source use case. We highly recommend that you look behind the scenes of this deployed instance. See the following resources: 
        </p>
          <ul>
          <li> <a href="https://github.com/input-output-hk/marlowe-vesting/" target="_blank" rel="noopener noreferrer">
                Token Plan Github Repository</a> 
               : The React Application Codebase.
          </li>
          <li> <a href="https://github.com/input-output-hk/marlowe-ts-sdk/blob/main/packages/language/examples/src/vesting.ts" target="_blank" rel="noopener noreferrer">
                Vesting Contract Implementation</a>
          </li>
          <li> <a href="https://input-output-hk.github.io/marlowe-ts-sdk/modules/_marlowe_io_language_examples.vesting.html" target="_blank" rel="noopener noreferrer">
                Vesting Contract Documentation </a> 
          </li>
          </ul>
        <p>This <b>Token Plan Prototype</b> is built using mainstream Web Technologies & Frameworks (Typescript & React) on top of the 
           Marlowe Web DApp Stack:</p> 
        <ul>
          <li> <a href="https://github.com/input-output-hk/marlowe-ts-sdk/" target="_blank" rel="noopener noreferrer">
                Marlowe TypeScript SDK (TS-SDK)
               </a>
               : a suite of TypeScript/JavaScript libraries for developing Web-DApp in the Cardano Blockchain using Marlowe Technologies.
          </li>
          <li> <a href="https://docs.marlowe.iohk.io/docs/developer-tools/runtime/marlowe-runtime" target="_blank" rel="noopener noreferrer">
                Marlowe Runtime
               </a>: Application backend for managing Marlowe contracts on the Cardano blockchain. It provides easy-to-use, higher-level APIs and complete backend services that enable developers to build and deploy enterprise and Web3 DApp solutions using Marlowe, but without having to assemble the “plumbing” that manually orchestrates a backend workflow for a Marlowe-based application.</li>
        </ul>
        <h3>Roadmap</h3>
        <p>The current version is a full end-to-end Marlowe contract example integrated within a Web DApp. 
           It is a first iteration and is limited at the moment to three periods per Vesting Contract.</p> 
        <p>The current version is a full end-to-end Marlowe contract example integrated within a Web DApp. It 
           is a first iteration and is limited at the moment to three periods per Vesting Contract.</p>
        <p>The second iteration will allow you to create an infinite number of periods. The missing Marlowe 
          feature to be provided at this DApp level is called <b>Long Live Running Contract</b> or <b>Contract 
          Merkleization</b>. The capabilities are already available in the Runtime but not yet available in the Marlowe TS-SDK.</p>
        <p>Enjoy and stay tuned for our next releases!</p>
             
      </div>
      <Footer />
    </div>
  );
};

export default About;