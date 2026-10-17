# Test cases and evidence log

Use different Ganache/MetaMask accounts for Owner, Issuer, Recipient and Attacker. Record the transaction hash and a screenshot after each case.

| ID | Case | Actor | Expected result | Observed result / transaction hash |
| --- | --- | --- | --- | --- |
| T1 | Register a new household with valid address/name | Owner | Succeeds; `HouseholdRegistered` emitted | |
| T2 | Issue voucher to registered household, positive amount, future expiry | Owner or authorized issuer | Succeeds; `VoucherIssued` emitted | |
| T3 | Retrieve vouchers in recipient UI | Recipient | Voucher ID, purpose, amount and expiry displayed | |
| T4 | Redeem active voucher | Recipient | Succeeds; `VoucherRedeemed` emitted and state becomes Redeemed | |
| T5 | Register household with an empty/too-short name | Owner | Reverts: `Name must be 2-80 characters` | |
| T6 | Issue to an unregistered address | Authorized issuer | Reverts: `Recipient is not registered` | |
| T7 | Issue with zero amount or past expiry | Authorized issuer | Reverts with validation error | |
| T8 | Redeem the same voucher twice | Recipient | Second call reverts: `Voucher already redeemed` | |
| T9 | Issue voucher from unapproved wallet | Attacker | Reverts: `Only authorized issuer can do this` | |
| T10 | Redeem another recipient's voucher | Attacker | Reverts: `Only voucher recipient can redeem` | |
| T11 | Register household from non-owner wallet | Attacker | Reverts: `Only program owner can do this` | |

## Screenshot list

1. Remix compiler success panel.
2. Remix deployment and contract address.
3. MetaMask connected to the frontend.
4. Successful issuance or redemption confirmation.
5. One invalid or unauthorized transaction rejection.
6. Recipient dashboard showing retrieved voucher data.
