

// (function (): Contract {
//     type VestingParameters = {
//         numberOfPeriods: number;
//         periodLength: number; //TODO: Modify to duration instead of number
//         // withdrawalsPerPeriod: number; // TODO: The code is hardcoded to do one withdrawal/cancel per period. 
//         vestingToken: Token;
//         vestingAmountPerPeriod: number; //NOTE: Using "per period" to avoid fractions
//         contractStart: number; // TODO: Modify as a date
//         employerDepositDeadline: number; //TODO: Modify as date
//         employee: Party;
//         employer: Party;
//     }


//     const vestingContract = function({numberOfPeriods, periodLength, vestingToken, vestingAmountPerPeriod, contractStart, employee, employer, employerDepositDeadline }:VestingParameters) {
//         if (vestingAmountPerPeriod <= 0) throw "Vesting amount per period needs to be a positive number";
//         if (employerDepositDeadline < contractStart) throw "Employer needs to deposit funds after contract start";
//         if (employerDepositDeadline >= contractStart + periodLength) throw "Employer needs to deposit before the first vesting period";
//         if (numberOfPeriods < 1) throw "The number of Periods needs to be greater or equal to 1";


//         const employerCancel = function() {
//             return Close;
//         }
        
//         const employerDepositsFunds = function(continuation:Contract) {
//             return When([Case(Deposit(employer, employer, vestingToken, (numberOfPeriods * vestingAmountPerPeriod)),continuation)], employerDepositDeadline, Close);
//         }

//         const contractForPeriod = function(currentPeriod:number) {
//             // NOTE: Currently this logic presents the withdrwal and cancel for the last period, even though it doesn't make sense
//             // because there is nothing to cancel, and even if the employee does a partial withdrwal, they receive the balance in their account.
//             // If we want all, but the last, we can use the commented line below instead:
//             // const continuation = (currentPeriod > (numberOfPeriods - 2)) ? Close : contractForPeriod(currentPeriod + 1);
//             const continuation = (currentPeriod == numberOfPeriods) ? Close : contractForPeriod(currentPeriod + 1);
//             const vestingDate = contractStart + currentPeriod * periodLength;
//             const nextVestingDate = vestingDate + periodLength;

//             // On every period, we allow an employee to do a withdrawal.
//             const employeeWithdrawCase = 
//                 Case(Choice(ChoiceId("withdraw", employee),
//                     [Bound(1, currentPeriod * vestingAmountPerPeriod)]),
//                     Pay(employee, Party(employee), vestingToken, ChoiceValue(ChoiceId("withdraw", employee)),continuation));


//             const employerCancelCase =
//                 Case(Choice(ChoiceId("cancel", employer),
//                 [Bound(1, 1)]),
//                 employerCancel());

//             // 1) Wait for the vesting period.
//             // 2) Release vested funds
//             // 3) Allow the employee to withdraw or the employer to cancel future vesting periods
//             return When([], vestingDate,
//                         Pay(employer, Account(employee), vestingToken, vestingAmountPerPeriod, 
//                             When([employeeWithdrawCase, employerCancelCase], nextVestingDate, continuation)
//                         )
//                     ) 
//         }

//         return employerDepositsFunds(contractForPeriod(1));

//     }

//     return vestingContract({
//         numberOfPeriods: 10, 
//         periodLength: 1000 * 60 * 60 * 2, // two hours 
//         vestingToken: ada, 
//         vestingAmountPerPeriod: 1000,
//         contractStart: 1726081548000,// September 11, 2024 7:05:48 PM
//         employee: Role('Employee'),
//         employer: Role("Employer"),
//         employerDepositDeadline: 1726081549000
//     });
// })();