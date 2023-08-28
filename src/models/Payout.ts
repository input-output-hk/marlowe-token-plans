import Token from "./Token";
import Status from "./Status";



export default class Payout {
  payoutId: string;
  contractId: string;
  status: Status;
  role: Token;
  tokens: Token[];

  constructor(payoutId: string, contractId: string, status: Status, role: Token, tokens: Token[]) {
    this.payoutId = payoutId;
    this.contractId = contractId;
    this.status = status;
    this.role = role;
    this.tokens = tokens;
  }
}
