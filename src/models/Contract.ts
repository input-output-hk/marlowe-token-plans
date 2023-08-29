import Status from "./Status";

export default class Contract {
  id: string;
  name: string;
  managingAddress: string;
  metadata: Object;
  status: Status;

  constructor(id: string, name: string, managingAddress: string, metadata: Object, status: Status) {
    this.id = id;
    this.name = name;
    this.managingAddress = managingAddress;
    this.metadata = metadata;
    this.status = status;
  }
}