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