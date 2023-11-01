import { Vesting } from "@marlowe.io/language-examples";
import { ContractId, unContractId } from "@marlowe.io/runtime-core"
import React, { useEffect, useState } from 'react';

export function contractIdLink (marloweScanURL : string , contractId : ContractId) {
    return <a target="_blank"
     rel="noopener noreferrer"
     href={`${marloweScanURL}/contractView?tab=info&contractId=` + encodeURIComponent(unContractId(contractId))}>
     {truncateString(unContractId(contractId), 5, 60)} </a> 
   }

const truncateString = (str: string, start: number, end: number) => {
  const length = str.length;
  const lastLetterIndex = length ;
  return str.slice(end, lastLetterIndex)
}
export function displayCloseCondition(closeCondition : Vesting.CloseCondition ) {
  switch(closeCondition.name) {
    case "CancelledCloseCondition" : return `Cancelled Plan | ${closeCondition.percentageClaimed} % claimed `
    case "DepositDeadlineCloseCondition" : return "Deposit Deadline Passed"
    case "FullyClaimedCloseCondition" : return "Fully Claimed Plan" ;
    case "UnknownCloseCondition" : return "Unknown Close Condition" ;   
  }
}

export type CurrencyF = String
export type WholeNumberF = string
export type DecimalF = string
export const formatADAs = (lovelaces: bigint, isMainnet: Boolean = false, currencyName: string = "₳"): string=> {
  const adas = (Math.trunc(Number(lovelaces).valueOf() / 1_000_000))
  const decimalADAs = (lovelaces % 1_000_000n)
  const currency = isMainnet ? currencyName : "t" + currencyName
  if (decimalADAs === 0n) 
    return adas.toLocaleString()  + ' ' + currency;
  else 
    return adas.toLocaleString() + ' ' + decimalADAs.toString().padStart(6, '0') + ' ' + currency;
}

export const cssOverrideSpinnerCentered 
  = ({display: "block",
      marginLeft: "10px",
      marginRight:"auto",
      height: "auto",
      witdth : "20px",
      paddingTop: "10px"})
