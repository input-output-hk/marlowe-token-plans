# Vesting contract

The vesting contract is defined as follows:

1. There are `N` vesting periods.
2. Each vesting period involves `P` tokens.
3. The employer initially deposits `N * P` tokens into the contract.
4. At the end of each vesting period, `P` tokens are transferred from the employer account to the employee account.
5. During each vesting period, the employer may cancel the contract, receiving back the *unvested* funds from their account and distributing the *vested* funds to the employee.
6. Also during each vesting period, the employee may withdraw once any of the funds in their account. The employer can still cancel the contract during the vesting period after the employee has withdrawn funds during that vesting period.
7. When the contract's ultimate timeout is reached, vested and unvested funds are distributed to the employee and employer, respectively.
8. The employer may cancel the contract during the first vesting period.
9. The employer may not cancel the contract after all funds have been vested.

See [contract.ts](contract.ts) for the TypeScript version of the contract from the Marlowe Playground, and [contract.js](contract.js) for the equivalent JavaScript version.
