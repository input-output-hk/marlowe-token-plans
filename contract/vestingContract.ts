type Token = {
  currency_symbol: string;
  token_name: string;
};

type Party = {
  role_token: string;
};

type VestingContractParams = {
  numberOfPeriods: number;
  periodLength: number;
  vestingToken: Token;
  vestingAmountPerPeriod: number;
  contractStart: number;
  employerDepositDeadline: number;
  employee: Party;
  employer: Party;
};

const vestingContract = ({
  numberOfPeriods,
  periodLength,
  vestingToken,
  vestingAmountPerPeriod,
  contractStart,
  employerDepositDeadline,
  employee,
  employer
}: VestingContractParams): any => {
  if (vestingAmountPerPeriod <= 0)
    throw 'Vesting amount per period needs to be a positive number';
  if (employerDepositDeadline < contractStart)
    throw 'Employer needs to deposit funds after contract start';
  if (employerDepositDeadline >= contractStart + periodLength)
    throw 'Employer needs to deposit before the first vesting period';
  if (numberOfPeriods < 1)
    throw 'The number of Periods needs to be greater or equal to 1';

  const employerCancel = function () {
    return 'close';
  };

  const employerDepositsFunds = function (continuation: any) {
    return {
      when: [
        {
          case: {
            party: employer,
            deposits: numberOfPeriods * vestingAmountPerPeriod,
            of_token: vestingToken,
            into_account: employer,
          },
          then: continuation,
        },
      ],
      timeout: employerDepositDeadline,
      timeout_continuation: 'close',
    };
  };

  const contractForPeriod = function (currentPeriod: number): any {
    // NOTE: Currently this logic presents the withdrawal and cancel for the last period, even though it doesn't make sense
    // because there is nothing to cancel, and even if the employee does a partial withdrwal, they receive the balance in their account.
    const continuation =
      currentPeriod == numberOfPeriods
        ? 'close'
        : contractForPeriod(currentPeriod + 1);
    const vestingDate = contractStart + currentPeriod * periodLength;
    const nextVestingDate = vestingDate + periodLength;

    // On every period, we allow an employee to do a withdrawal.
    const employeeWithdrawCase = {
      case: {
        choose_between: [
          {
            from: 1,
            to: currentPeriod * vestingAmountPerPeriod,
          },
        ],
        for_choice: {
          choice_name: 'withdraw',
          choice_owner: employee,
        },
      },
      then: {
        pay: {
          value_of_choice: {
            choice_name: 'withdraw',
            choice_owner: employee,
          },
        },
        token: vestingToken,
        from_account: employee,
        to: {
          party: employee,
        },
        then: continuation,
      },
    };

    const employerCancelCase = {
      case: {
        choose_between: [
          {
            from: 1,
            to: 1,
          },
        ],
        for_choice: {
          choice_name: 'cancel',
          choice_owner: employer,
        },
      },
      then: employerCancel(),
    };

    // 1) Wait for the vesting period.
    // 2) Release vested funds
    // 3) Allow the employee to withdraw or the employer to cancel future vesting periods
    return {
      when: [employerCancelCase],
      timeout: vestingDate,
      timeout_continuation: {
        pay: vestingAmountPerPeriod,
        token: vestingToken,
        from_account: employer,
        to: {
          account: employee,
        },
        then: {
          when:
            currentPeriod == numberOfPeriods
              ? [employeeWithdrawCase]
              : [employeeWithdrawCase, employerCancelCase],
          timeout: nextVestingDate,
          timeout_continuation: continuation,
        },
      },
    };
  };

  return employerDepositsFunds(contractForPeriod(1));

};

export default vestingContract;

// // An example. Use `nodejs contract.ts` to print the contract.
// console.log(
//   JSON.stringify(
//     vestingContract({
//       numberOfPeriods: 3,
//       periodLength: 1000 * 60 * 60 * 2, // two hours
//       vestingToken: { currency_symbol: '', token_name: '' },
//       vestingAmountPerPeriod: 1000 * 1000000,
//       contractStart: 1726081548000,
//       employerDepositDeadline: 1726081549000,
//       employee: { role_token: 'Employee' },
//       employer: { role_token: 'Employer' }
//     })
//   )
// );
