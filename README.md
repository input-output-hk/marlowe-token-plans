<h2 align="center">
  <a href="" target="blank_">
    <img src="./doc/image/logo.svg" alt="Logo" height="75">
  </a>
  <br>
  Token Plan Prototype: A Vesting Contract Use Case  
</h2>

<div align="center">
  <a href=""><img src="https://img.shields.io/badge/stability-beta-33bbff.svg" alt="Beta"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg"></a>
  <a href="https://discord.com/invite/cmveaxuzBn"><img src="https://img.shields.io/discord/826816523368005654?label=Chat%20on%20Discord"></a>
  <a href="https://iohk.zendesk.com/hc/en-us/requests/new"><img src="https://img.shields.io/badge/Support-orange"></a>
</div>

# Overview 

The **Token Plan** Prototype includes the following:
 - A Web DApp powered by **Marlowe Smart Contract** Technology Over **Cardano** 
 - A use case of a vesting contract developed and available in the [Marlowe ts-sdk](https://github.com/input-output-hk/marlowe-ts-sdk/)
 - A demonstration of how to build DApps powered by Marlowe with well-known mainstream web technologies such as **Typescript** and **React Framework**.

## Deployed Instance

We invite you to test [a deployed instance of the Token Plan Prototype](https://token-plans-preprod.prod.scdev.aws.iohkdev.io/) for yourself. 

## The Vesting Contract

We designed the vesting contract in the <a href="https://play.marlowe.iohk.io">Marlowe Playground</a> and then integrated it in the [Marlowe TS-SDK](https://github.com/input-output-hk/marlowe-ts-sdk) to be used in the Token Plans use case. 

The vesting contract is available for use in the npm package `@marlowe.io/language-examples`
```ts
import { Vesting } from "@marlowe.io/language-examples";
```
It is available as open source code here: [`\marlowe-ts-sdk/blob/main/packages/language/examples/src/vesting.ts`](https://github.com/input-output-hk/marlowe-ts-sdk/blob/main/packages/language/examples/src/vesting.ts)

The vesting contract is documented in our TS-SDK [API Reference](https://input-output-hk.github.io/marlowe-ts-sdk/modules/_marlowe_io_language_examples.vesting.html).

## The Prototype 

The prototype allows you to create ₳ Token Plans over Cardano. 
- ₳ Token Plans are created by a "Token Provider." 
- The Provider will deposit a given ₳ amount with a time-based scheme defining how to release these ₳ over time to a "Claimer." 

**N.B**: In the context of this prototype, we have combined these 2 participants' views to simplify the use case demonstration.

The intent here is not to provide services to you over Cardano, but to demonstrate Marlowe technology capabilities with a concrete and fully open-source use case. We highly recommend that you take a close look at how this prototype is implemented.

# Roadmap
The current version is a full end-to-end Marlowe contract example integrated within a Web DApp. It is a first iteration and is limited at the moment to three periods per Vesting Contract.

The second iteration will allow you to create an infinite number of periods. The missing Marlowe feature to be provided at this DApp level is called Long Live Running Contract or Contract Merkleization. The capabilities are already available in the Runtime but not yet available in the Marlowe TS-SDK.

# How To Run Locally 

To get the DApp up and running on your local machine, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/input-output-hk/marlowe-payouts
   cd marlowe-payouts

2. **Install Dependencies**
   ```bash
   npm install

4. **Configure Marlowe URLs in .env**

   To ensure the DApp communicates correctly with the Marlowe Runtime and scan instances, you need to set the appropriate URLs in the `.env` file.

   ### Steps

   1. **Open the .env File**:
      Navigate to the root directory of your project and open the `.env` file in your preferred text editor.

   2. **Set the Marlowe Runtime Web URL**:
      Locate the line `MARLOWE_RUNTIME_WEB_URL=<Your-Runtime-Instance>`. Replace `<Your-Runtime-Instance>` with the actual URL of your Marlowe Runtime instance.

      MARLOWE_RUNTIME_WEB_URL=https://example-runtime-url.com

   3. **Set the Marlowe Scan URL**:
      Locate the line `MARLOWE_SCAN_URL=<Your-Scan-Instance>`. Replace `<Your-Scan-Instance>` with the actual URL of your Marlowe scan instance.

      MARLOWE_SCAN_URL=https://example-scan-url.com

3. **Run the DApp**
   ```bash
   npm run start

Enjoy and stay tuned for our next releases!
