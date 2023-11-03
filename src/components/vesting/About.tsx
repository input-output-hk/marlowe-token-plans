import React from 'react';

type AboutProps = {
};

export const About: React.FC<AboutProps> = () => {
  return (
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
        <p>The second iteration will allow you to create an infinite number of periods. The missing Marlowe 
          feature to be provided at this DApp level is called <b>Long Live Running Contract</b> or <b>Contract 
          Merkleization</b>. The capabilities are already available in the Runtime but not yet available in the Marlowe TS-SDK.</p>
        <p>Enjoy and stay tuned for our next releases!</p>   
      </div>
  );
};
