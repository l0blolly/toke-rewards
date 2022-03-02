# Tokemak Rewards

Another site to pull historical Tokemak rewards for a specific wallet.

## Disclaimers
1. All data is pulled from Tokemak's sources on best effort basis. Verify the results.
2. It should show a table of all rewards, aggregate rewards by type, and a chart

## Process for pulling data

1. Query Tokemak's [Reward Hash Contract](https://etherscan.io/address/0x5ec3EC6A8aC774c7d53665ebc5DDf89145d02fB6) for the IPFS hash for each Cycle Index
2. Pull the individual rewards payloads from IPFS for the given wallet

###Credit
This idea was heavily based on 0xDejenn's [Tokemak Rewards App](https://github.com/0xDejenn/tokemak-rewards)