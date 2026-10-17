const ABI = [
  "function owner() view returns (address)", "function issuers(address) view returns (bool)",
  "function registerHousehold(address,string)", "function setIssuer(address,bool)",
  "function issueVoucher(address,uint256,string,uint256) returns (uint256)", "function redeemVoucher(uint256)",
  "function getMyVoucherIds() view returns (uint256[])",
  "function getVoucher(uint256) view returns (tuple(uint256 id,address recipient,uint256 amount,string purpose,uint256 issuedAt,uint256 expiresAt,bool redeemed))"
];
let provider, signer, contract, account;
const $ = (id) => document.getElementById(id);
function inform(text, error = false) { $("message").textContent = text; $("message").style.color = error ? "#a32d2d" : "#164a3a"; }
function configured() { return /^0x[a-fA-F0-9]{40}$/.test(DAPP_CONFIG.contractAddress); }
async function connect() {
  try {
    if (!window.ethereum) throw new Error("MetaMask was not detected. Install or unlock it first.");
    if (!configured()) throw new Error("Add the deployed contract address to frontend/config.js first.");
    await ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(ethereum); signer = await provider.getSigner(); account = await signer.getAddress();
    const network = await provider.getNetwork();
    if (DAPP_CONFIG.expectedChainId && "0x" + network.chainId.toString(16) !== DAPP_CONFIG.expectedChainId) throw new Error("Wrong network. Switch MetaMask to the deployment network.");
    contract = new ethers.Contract(DAPP_CONFIG.contractAddress, ABI, signer);
    $("accountStatus").textContent = `${account.slice(0, 6)}...${account.slice(-4)}`;
    $("networkStatus").textContent = `Connected: chain ${network.chainId}`; $("connectButton").textContent = "Connected";
    inform("Wallet connected. Loading your vouchers..."); await refresh();
  } catch (err) { inform(err.shortMessage || err.message, true); }
}
async function submit(action, success) { try { if (!contract) throw new Error("Connect MetaMask first."); inform("Confirm the transaction in MetaMask..."); const tx = await action(); inform("Transaction sent. Waiting for confirmation..."); await tx.wait(); inform(success); await refresh(); } catch (err) { inform(err.shortMessage || err.reason || err.message, true); } }
async function refresh() {
  try { if (!contract) return; const ids = await contract.getMyVoucherIds(); const list = $("voucherList");
    if (!ids.length) { list.innerHTML = "<p>No vouchers are assigned to this wallet.</p>"; return; }
    const now = Math.floor(Date.now()/1000); const vouchers = await Promise.all(ids.map(id => contract.getVoucher(id)));
    list.innerHTML = vouchers.map(v => { const expired = Number(v.expiresAt) < now; const state = v.redeemed ? "Redeemed" : expired ? "Expired" : "Active"; return `<article class="voucher ${state.toLowerCase()}"><h3>#${v.id} - ${state}</h3><p><strong>${v.amount}</strong> credits for ${v.purpose}</p><p>Expires: ${new Date(Number(v.expiresAt)*1000).toLocaleString()}</p></article>`; }).join("");
  } catch (err) { inform(err.shortMessage || err.message, true); }
}
$("connectButton").addEventListener("click", connect); $("refreshButton").addEventListener("click", refresh);
$("registerForm").addEventListener("submit", e => { e.preventDefault(); submit(() => contract.registerHousehold($("householdAddress").value.trim(), $("householdName").value.trim()), "Household registered successfully."); });
$("issuerForm").addEventListener("submit", e => { e.preventDefault(); submit(() => contract.setIssuer($("issuerAddress").value.trim(), $("issuerAuthorized").checked), "Issuer permission updated."); });
$("issueForm").addEventListener("submit", e => { e.preventDefault(); const expiry = Math.floor(new Date($("expiresAt").value).getTime()/1000); submit(() => contract.issueVoucher($("recipientAddress").value.trim(), $("amount").value, $("purpose").value.trim(), expiry), "Voucher issued successfully."); });
$("redeemForm").addEventListener("submit", e => { e.preventDefault(); submit(() => contract.redeemVoucher($("voucherId").value), "Voucher redeemed successfully."); });
if (window.ethereum) ethereum.on("accountsChanged", () => location.reload());
