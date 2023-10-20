import { ContractId } from "@marlowe.io/runtime-core";

export type ProviderId = string // truncated Changed Address 
export type ClaimerId = string  // truncated Changed Address 

export type Contract<State> = 
  { contractId : ContractId;
    providerId : ProviderId;
    claimer : Claimer ;
    isSelfAttributed : Boolean
    title : string;
    state : State;
  }

export type Claimer = 
  { firstName : string
  , lastName : string
  , id : ClaimerId} 