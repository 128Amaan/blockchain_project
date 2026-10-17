# Community Relief Voucher DApp

An original Ethereum DApp for transparent community-aid distribution. A program owner registers eligible households and authorizes trusted issuers. An authorized issuer creates a time-limited voucher, while only its recipient can redeem it. The blockchain stores an auditable record of each issue and redemption without handling private keys or real funds.

## Project contents

- `contracts/CommunityReliefVoucher.sol` - Solidity smart contract for Remix.
- `frontend/` - HTML, CSS and JavaScript interface using Ethers.js and MetaMask.
- `docs/DEPLOYMENT.md` - deployment record template.
- `docs/TEST_CASES.md` - required test evidence and expected outcomes.

## Deploy with Remix and Ganache

1. Start Ganache and add its network/account to MetaMask. This project's Ganache Quickstart workspace uses chain ID `5777` (`0x1691`); use the ID shown in your Ganache header if yours differs.
2. Open [Remix IDE](https://remix.ethereum.org), create `CommunityReliefVoucher.sol`, and paste in the contract source.
3. In Solidity Compiler, select compiler `0.8.20` or later within the `0.8.x` range and compile.
4. In Deploy & Run, select **Injected Provider - MetaMask**, select the Ganache network, then deploy. The deploying wallet is the program owner and initial issuer.
5. Copy the deployed contract address into `frontend/config.js`. Change `expectedChainId` if using another test network.
6. Serve the `frontend` directory with a local web server (for example, VS Code Live Server), open it in a browser, and click **Connect MetaMask**.

## Interaction sequence

1. Owner registers a household wallet and optionally authorizes another issuer.
2. An authorized issuer issues that registered wallet a voucher with an amount, purpose and future expiry.
3. Switch MetaMask to the recipient wallet. Click Refresh to retrieve its on-chain vouchers, then redeem an active voucher.

## Submission checklist

Record the deployed address and network in `docs/DEPLOYMENT.md`. Add screenshots for compilation, deployment, wallet connection, a successful transaction, a rejected transaction and vouchers displayed in the UI. Run every case in `docs/TEST_CASES.md`. Do not commit seed phrases, passwords, RPC secrets or private keys.
