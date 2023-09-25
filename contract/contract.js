const vestingContract = function(
  numberOfPeriods,
  periodLength, // TODO: Modify to duration instead of number
  // withdrawalsPerPeriod: number; // TODO: The code is hardcoded to do one withdrawal/cancel per period. 
  vestingToken,
  vestingAmountPerPeriod, // NB: Using "per period" to avoid fractions
  contractStart, // TODO: Modify as a date
  employerDepositDeadline, // TODO: Modify as date
  employee,
  employer,
  ) {

    if (vestingAmountPerPeriod <= 0)
      throw "Vesting amount per period needs to be a positive number";
    if (employerDepositDeadline < contractStart)
      throw "Employer needs to deposit funds after contract start";
    if (employerDepositDeadline >= contractStart + periodLength)
      throw "Employer needs to deposit before the first vesting period";
    if (numberOfPeriods < 1)
      throw "The number of Periods needs to be greater or equal to 1";

    const employerCancel = function() {
      return "close";
    }
    
    const employerDepositsFunds = function(continuation) {
      return {
        when : [
          {
            case : {
              party : employer,
              deposits : numberOfPeriods * vestingAmountPerPeriod,
              of_token : vestingToken,
              into_account : employer,
            },
            then : continuation,
          },
        ],
        timeout : employerDepositDeadline,
        timeout_continuation : "close"
      };
    }

    const contractForPeriod = function(currentPeriod) {
      // NOTE: Currently this logic presents the withdrawal and cancel for the last period, even though it doesn't make sense
      // because there is nothing to cancel, and even if the employee does a partial withdrwal, they receive the balance in their account.
      const continuation = (currentPeriod == numberOfPeriods) ? "close" : contractForPeriod(currentPeriod + 1);
      const vestingDate = contractStart + currentPeriod * periodLength;
      const nextVestingDate = vestingDate + periodLength;

      // On every period, we allow an employee to do a withdrawal.
      const employeeWithdrawCase = 
        {
          case : {
            choose_between : [
              {
                from : 1,
                to : currentPeriod * vestingAmountPerPeriod
              }
            ],
            for_choice : {
              choice_name : "withdraw",
              choice_owner : employee,
            },
	  },
          then : {
            pay : {
              value_of_choice : {
                choice_name : "withdraw",
                choice_owner : employee,
              },
            },
            token : vestingToken,
            from_account : employee,
            to : {
              party : employee,
            },
            then : continuation
          },
	};

      const employerCancelCase =
        {
          case : {
            choose_between : [
              {
                from : 1,
                to : 1,
              },
            ],
            for_choice : {
              choice_name : "cancel",
              choice_owner : employer,
            },
          },
          then : employerCancel(),
        };

      // 1) Wait for the vesting period.
      // 2) Release vested funds
      // 3) Allow the employee to withdraw or the employer to cancel future vesting periods
      return {
        when : [
          employerCancelCase,
        ],
        timeout : vestingDate,
        timeout_continuation : {
          pay : vestingAmountPerPeriod,
          token : vestingToken,
          from_account : employer,
          to : {
            account : employee,
          },
          then : {
            when : (
              currentPeriod == numberOfPeriods
                ? [employeeWithdrawCase]
                : [employeeWithdrawCase, employerCancelCase]
            ),
            timeout : nextVestingDate,
            timeout_continuation : continuation,
          },
        },
      };
    };

    return employerDepositsFunds(contractForPeriod(1));

}

// An example. Use `nodejs contract.js` to print the contract.
console.log(JSON.stringify(
  vestingContract(
    3, 
    1000 * 60 * 60 * 2, // two hours 
    {currency_symbol : "", token_name : ""}, 
    1000 * 1000000,
    1726081548000,
    1726081549000,
    {role_token : "Employee"},
    {role_token : "Employer"},
  )
));
