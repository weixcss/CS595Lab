// File: scripts/separate-and-test.js
require("dotenv").config();
const fs   = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  const WHIRLWIND_ADDRESS = process.env.WHIRLWIND_ADDRESS;
  if (!WHIRLWIND_ADDRESS) {
    throw new Error("WHIRLWIND_ADDRESS not set in .env");
  }

  const whirlwind = await ethers.getContractAt("Whirlwind", WHIRLWIND_ADDRESS);
  console.log(`→ Using Whirlwind at ${WHIRLWIND_ADDRESS}\n`);

  // —— DEPOSIT ——  
  const depositProof = fs.readFileSync(
    path.join(
      __dirname, "..",
      "contracts", "circuits", "deposit_circuit", "target", "deposit_proof", "proof"
    )
  );
  const depositPublics = fs.readFileSync(
    path.join(
      __dirname, "..",
      "contracts", "circuits", "deposit_circuit", "target", "deposit_proof", "public_inputs"
    ), "utf8"
  ).trim().split(/\r?\n/);

  if (depositPublics.length !== 4) {
    throw new Error("Deposit public_inputs file must have exactly 4 lines");
  }
  const [ oldRoot, newRoot, commitment, index ] = depositPublics;
  console.log("→ deposit inputs:", { oldRoot, newRoot, commitment, index });

  const tx1 = await whirlwind.deposit(
    depositProof,
    newRoot,       // bytes32 newRoot
    commitment,   // bytes32 commitment
    { value: ethers.utils.parseEther("0.1") }
  );
  const receipt1 = await tx1.wait();
  console.log(" → Deposit TX hash:", receipt1.transactionHash, "\n");

  // —— WITHDRAW ——  
  const withdrawProof = fs.readFileSync(
    path.join(
      __dirname, "..",
      "contracts", "circuits", "withdraw_circuit", "target", "withdraw_proof", "proof"
    )
  );
  const withdrawPublics = fs.readFileSync(
    path.join(
      __dirname, "..",
      "contracts", "circuits", "withdraw_circuit", "target", "withdraw_proof", "public_inputs"
    ), "utf8"
  ).trim().split(/\r?\n/);

  if (withdrawPublics.length !== 2) {
    throw new Error("Withdraw public_inputs file must have exactly 2 lines");
  }
  const [ root, nullifier ] = withdrawPublics;
  console.log("→ withdraw inputs:", { root, nullifier });

  const tx2 = await whirlwind.withdraw(
    withdrawProof,
    nullifier      // bytes32 nullifier
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