import Status from "./Status";

export default class Transaction {
  id: string;
  contractId: string;
  name: string;
  metadata: Object;
  status: Status;

  constructor(id: string, contractId: string, name: string, metadata: Object, status: Status) {
    this.id = id;
    this.contractId = contractId;
    this.name = name;
    this.metadata = metadata;
    this.status = status;
  }
}