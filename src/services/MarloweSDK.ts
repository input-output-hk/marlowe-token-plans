import { Blockfrost, Lucid } from "lucid-cardano";
import { RuntimeBrowser } from "@marlowe.io/runtime"
import moment from "moment";
import Status from "../models/Status";
import Contract from "../models/Contract";
import * as E from "fp-ts/Either"
type Wallet = {
  enable: () => Promise<any>;
  getChangeAddress: () => Promise<string>;
};

class MarloweSDK {
  validWalletNames: string[];
  connectedWallet: Wallet | null;
  lovelaceBalance: bigint;
  changeAddress: string | null;
  contracts: any[];
  lucid: Lucid | null;
  runtimeSettings: any;
  runtimeBrowser: any;

  constructor() {
    this.validWalletNames = [
      'nami',
      'eternl',
      'flint',
      'gerowallet',
      'yoroi',
      'lace',
    ];
    this.connectedWallet = null;
    this.lovelaceBalance = 125000000n;
    this.changeAddress = null;

    const contract = new Contract(
      'contractID1',
      'Contract1',
      'addr_test1qzmzvy7e6h7hs6t4gsek4azkszd9pucmw2pwazpx2t6fna0q2ckh2rhm5s7cm765xeqjkm6xs4cm6j3994cakdep7tyqa9ffn2',
      { totalShares: 1000, vestedShares: 500, claimedShares: 318, startDate:  moment().subtract(100, 'days'), endDate: moment().add(100, 'days'), nextVestDate: moment().add(15, 'days')  },
      Status.IN_PROGRESS
    );

    const contract2 = new Contract(
      'contractID2',
      'Contract2',
      'addr_test1qzmzvy7e6h7hs6t4gsek4azkszd9pucmw2pwazpx2t6fna0q2ckh2rhm5s7cm765xeqjkm6xs4cm6j3994cakdep7tyqa9ffn2',
      { totalShares: 1000, vestedShares: 0, claimedShares: 0, startDate:  moment().subtract(100, 'days'), endDate: moment().add(100, 'days'), nextVestDate: moment().add(15, 'days')},
      Status.PENDING
    );

    const contract3 = new Contract(
      'contractID3',
      'Contract3',
      'addr_test1qzmzvy7e6h7hs6t4gsek4azkszd9pucmw2pwazpx2t6fna0q2ckh2rhm5s7cm765xeqjkm6xs4cm6j3994cakdep7tyqa9ffn2',
      { totalShares: 1000, vestedShares: 1000, claimedShares: 1000, startDate:  moment().subtract(100, 'days'), endDate: moment().add(100, 'days'), nextVestDate: moment().add(15, 'days')},
      Status.CLAIMED
    );

    const contract4 = new Contract(
      'contractID4',
      'Contract4',
      'addr_test1qzmzvy7e6h7hs6t4gsek4azkszd9pucmw2pwazpx2t6fna0q2ckh2rhm5s7cm765xeqjkm6xs4cm6j3994cakdep7tyqa9ffn2',
      { totalShares: 1000, vestedShares: 1000, claimedShares: 300, startDate:  moment().subtract(100, 'days'), endDate: moment().add(100, 'days'), nextVestDate: moment().add(15, 'days') },
      Status.CANCELLED
    );

    const contracts = [contract, contract2, contract3, contract4];
    this.contracts = contracts;

    this.lucid = null;

  }

  getContracts() {
    return this.contracts;
  }

  getConnectedWallet(): Wallet | null {
    return this.connectedWallet;
  }

  getLucid(): Lucid | null {
    return this.lucid;
  }

  async setChangeAddress(): Promise<void> {
    if (this.connectedWallet) {
      this.changeAddress = await this.runtimeBrowser.wallet.getChangeAddress();
    }
  }

  async connectWallet(walletName: string): Promise<void> {
    console.log(`Connecting to ${walletName}`)
    try {
      if (this.validWalletNames.includes(walletName)) {
        const lucid = await Lucid.new(
          new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", "previewGstJmKGkWEnJetz8heF9Gfs6q4FbOvc0"),
          "Preview",
        );
        
        this.runtimeBrowser = await RuntimeBrowser.mkRuntimeBroswer(`https://marlowe-runtime-preview-web.scdev.aws.iohkdev.io`)(walletName)()

        E.match(
          (err) => console.log("runtimeBrowser erro", err),
          (lovelaceBalance) => console.log("runtimeBrowser", lovelaceBalance)
        ) (this.runtimeBrowser)
        
        const wallet = await (window as any).cardano[walletName].enable();
        lucid.selectWallet(wallet);
        this.lucid = lucid;
        this.connectedWallet = wallet;
        console.log(lucid);
        await this.setChangeAddress();
      } else {
        console.log(
          `Please select from accepted wallets ${this.validWalletNames.join(', ')}`
        );
      }
    } catch (e) {
      console.log("FAILED TO CONNECT WALLET: ", e);
    }

  }

  disconnectWallet(): void {
    this.connectedWallet = null;
  }

  getLovelaceBalance(): Promise<bigint> {
    return Promise.resolve(this.lovelaceBalance);
  }

  getDestinationAddress(): string {
    return "addr_test1qrtwu0c4lpfpfd89d8j0mvxrznx3ypa30cafhzure0ufc9w6vhc3ts2pccnuqxp25a0nfhdm94z89tu2qj325hkema2sg659ex";
  }
}

export default MarloweSDK;
