// scripts/separate-and-test.js
require("dotenv").config();
const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  // ——— Setup & sanity checks ———
  const network = await ethers.provider.getNetwork();
  console.log(`→ Connected to network: ${network.name} (chainId=${network.chainId})`);

  const whirlwind = await ethers.getContractAt("Whirlwind", process.env.WHIRLWIND_ADDRESS);
  const code = await ethers.provider.getCode(whirlwind.address);
  console.log(`→ Using Whirlwind at ${whirlwind.address}`);
  console.log("→ On-chain bytecode length:", code.length / 2);

  const depositIndex = await whirlwind.depositIndex();
  const currentRoot  = await whirlwind.currentRoot();
  console.log("→ depositIndex =", depositIndex.toString());
  console.log("→ currentRoot  =", currentRoot);

  // ——— DEPOSIT ———
  // 1) read the packed proof
  const depositRaw = fs.readFileSync(
    "contracts/circuits/deposit_circuit/target/deposit_proof/proof"
  );
  const PUB_COUNT = 4, PUB_BYTES = PUB_COUNT * 32;
  const pubBuf   = depositRaw.slice(0, PUB_BYTES);
  const proofBuf = depositRaw.slice(PUB_BYTES);

  // 2) slice out each 32-byte field
  const depositPublics = Array.from({ length: PUB_COUNT }, (_, i) =>
    "0x" + pubBuf.slice(i * 32, (i + 1) * 32).toString("hex")
  );
  const [ oldRoot, newRoot, commitment, index ] = depositPublics;

  console.log("→ depositPublics (oldRoot,newRoot,commitment,index):", depositPublics);

  // 3) send the deposit txn (with an explicit gasLimit)
  console.log("→ waiting for deposit…");
  const tx1 = await whirlwind.deposit(
    proofBuf,
    newRoot,
    commitment,
    {
      value: ethers.utils.parseEther("0.1"),  // must be exactly 0.1 ETH
      gasLimit: 3_000_000,                     // dial up/down as needed
    }
  );
  const receipt1 = await tx1.wait();
  console.log(" → Deposit TX hash:", receipt1.transactionHash);

  // ——— WITHDRAW ———
  const withdrawRaw = fs.readFileSync(
    "contracts/circuits/withdraw_circuit/target/withdraw_proof/proof"
  );
  const W_PUB_COUNT = 2, W_PUB_BYTES = W_PUB_COUNT * 32;
  const wPubBuf   = withdrawRaw.slice(0, W_PUB_BYTES);
  const wProofBuf = withdrawRaw.slice(W_PUB_BYTES);

  const withdrawPublics = Array.from({ length: W_PUB_COUNT }, (_, i) =>
    "0x" + wPubBuf.slice(i * 32, (i + 1) * 32).toString("hex")
  );
  const [ root, nullifier ] = withdrawPublics;

  console.log("→ withdrawPublics (root,nullifier):", withdrawPublics);

  console.log("→ waiting for withdraw…");
  const tx2 = await whirlwind.withdraw(
    wProofBuf,
    nullifier,
    { gasLimit: 2_000_000 }
  );
  const receipt2 = await tx2.wait();
  console.log(" → Withdraw TX hash:", receipt2.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });