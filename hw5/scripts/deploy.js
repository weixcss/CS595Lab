// scripts/deploy.js
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying with account:", (await ethers.getSigners())[0].address);

  // 1) Deploy DepositVerifier
  const DepositVerifier = await ethers.getContractFactory("DepositVerifier");
  const depositVerifier = await DepositVerifier.deploy();
  await depositVerifier.deployed();
  console.log(" → DepositVerifier:", depositVerifier.address);

  // 2) Deploy WithdrawVerifier
  const WithdrawVerifier = await ethers.getContractFactory("WithdrawVerifier");
  const withdrawVerifier = await WithdrawVerifier.deploy();
  await withdrawVerifier.deployed();
  console.log(" → WithdrawVerifier:", withdrawVerifier.address);

  // 3) Deploy Whirlwind
  const depth = 8;
  // Replace with the on‑chain expected initial root (empty tree)
  const initialRoot = "0x18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63";
  const Whirlwind = await ethers.getContractFactory("Whirlwind");
  const whirlwind = await Whirlwind.deploy(
    depositVerifier.address,
    withdrawVerifier.address,
    depth,
    initialRoot
  );
  await whirlwind.deployed();
  console.log(" → Whirlwind:", whirlwind.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });