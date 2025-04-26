# 🛡️ CS595 HW5: Privacy Preserving Asset Transfer with Noir on Ethereum

---

## 📏 Overview

Build a **privacy-preserving asset transfer mechanism** where users can deposit and withdraw 0.1 ETH anonymously via a Merkle-tree-based mixer:

- **Deposit:** Commit to a secret `id` + nonce `r`, insert commitment into an off-chain Merkle tree, generate a ZK proof of correct insertion.  
- **Withdraw:** Prove membership of a commitment in the tree without revealing which leaf, reveal a unique nullifier to prevent double-spend.

---

## 🔨 Project File Structure
```
/hw5/
├── circuits/
│   ├── deposit_circuit/
│   │   ├── src/deposit.nr
│   │   ├── Nargo.toml
│   │   └── Prover.toml
│   └── withdraw_circuit/
│       ├── src/withdraw.nr
│       ├── Nargo.toml
│       └── Prover.toml
├── contracts/
│   ├── Whirlwind.sol
│   └── build/
│       ├── DepositVerifier.sol
│       └── WithdrawVerifier.sol
├── scripts/
│   ├── deploy.js
│   ├── extract-public-inputs.js
│   └── separate-and-test.js
├── gen_toml/
│   └── src/demo.ts
├── .env
└── README.md
```

## 🔨 Circuit Verifier Generation

### Deposit Circuit

```bash
cd contracts/circuits/deposit_circuit

bb write_vk \
  --scheme ultra_honk \
  -b target/deposit_circuit.json \
  -o target/vk \
  --oracle_hash keccak

bb write_solidity_verifier \
  --scheme ultra_honk \
  -k target/vk \
  -o target/DepositVerifier.sol
```

### Withdraw Circuit
```bash
cd contracts/circuits/withdraw_circuit

bb write_vk \
  --scheme ultra_honk \
  -b target/withdraw_circuit.json \
  -o target/vk \
  --oracle_hash keccak

bb write_solidity_verifier \
  --scheme ultra_honk \
  -k target/vk \
  -o target/WithdrawVerifier.sol
```

###  Generating Prover TOML Files
```bash
root@codespaces-9a97b6:/workspaces/CS595Lab/hw5/gen_toml/src# npx ts-node demo.ts
Deposit TOML:
 id = "0x26030450e933dc22f96812084feb4ec123e2c298f551e75fa2af9bd6c5fe7d36"
r = "0x0128ccc925e80678c663d7c74b5633d0e4d462db008365c8f4864d581ef45041"
oldPath = ["0x18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63", "0x1dd3a379ce7fa07e74d13e201c4b964e172e0805fdd00f204a1d1cf2f4d0c88b", "0x0ae910ad0629ed19e4826cd25e08eff05b717719eddfbc8299dcb88e0f95d8a3", "0x10a631ede2e9c9ea88f1277199d58d1e6cb573a05e811ebcc9c62a7592fc751e", "0x1bf7675fd91e584ae4ca9433f82a5928685482175dddcb2a9cd71ac5ee51dad1", "0x042c2b94323279699c5843b5df500ee976da92c585190f3db8492b061a3c808c", "0x12c134b47544ceda1c5ee86b4b836911336bc0bfb56817dbb93e5fbcd26fea57", "0x069a7dbc7071efec83372fe563ed9b14280292159b241911becae4f6f8786063"]
oldRoot = "0x284470996674816a6562d21babb0686789730c31c7c8694426e6b27a5a5cf95c"
newRoot = "0x1d3021e040dcca44f18d85d807005b359a2d042bc90c351d7a91e8355ccfa623"
commitment = "0x1cca4914e0ba52d95bd52cc3b6fa85520aa0f158e6ed81a2518fa6566f93e14c"
index = "0x0000000000000000000000000000000000000000000000000000000000000000"
Withdraw TOML:
 r = "0x0128ccc925e80678c663d7c74b5633d0e4d462db008365c8f4864d581ef45041"
index = "0x0000000000000000000000000000000000000000000000000000000000000000"
path = ["0x18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63", "0x1dd3a379ce7fa07e74d13e201c4b964e172e0805fdd00f204a1d1cf2f4d0c88b", "0x0ae910ad0629ed19e4826cd25e08eff05b717719eddfbc8299dcb88e0f95d8a3", "0x10a631ede2e9c9ea88f1277199d58d1e6cb573a05e811ebcc9c62a7592fc751e", "0x1bf7675fd91e584ae4ca9433f82a5928685482175dddcb2a9cd71ac5ee51dad1", "0x042c2b94323279699c5843b5df500ee976da92c585190f3db8492b061a3c808c", "0x12c134b47544ceda1c5ee86b4b836911336bc0bfb56817dbb93e5fbcd26fea57", "0x069a7dbc7071efec83372fe563ed9b14280292159b241911becae4f6f8786063"]
root = "0x1d3021e040dcca44f18d85d807005b359a2d042bc90c351d7a91e8355ccfa623"
id = "0x26030450e933dc22f96812084feb4ec123e2c298f551e75fa2af9bd6c5fe7d36"
```

### BONUS #1: (+20%) Deploy your contract on-chain:

_Deployed with account: `0x86F2B01cA9399D370de8472400822dF5444C0C78`_

- **DepositVerifier.sol** → [0x085A054Ee265fC0a17385a4DA8435dfd1ecb20B4](https://sepolia.etherscan.io/tx/0xc55c76dc587c3583504c614879486c278002fbf8d8bbce79dd56e6fd9db1e76c)
- **WithdrawVerifier.sol** → [0x7161Ab40aa81026FEBD5047012276a76b696c7Ac](https://sepolia.etherscan.io/tx/0x6ca7281ab2be5fd137639ff895ad8e31d3f8951d723b72cd19c11c155e02bc57)
- **Whirlwind.sol**      → [0xA5811c20dDA88769BdAC65aC17bb27e41336b3B7](https://sepolia.etherscan.io/tx/0x566efd4881e8400dacfaae1869bb032f175c75e0e2cf7d4bfd8af482f5b93677)

- **Deposit TX** → [0xc55c76dc587c3583504c614879486c278002fbf8d8bbce79dd56e6fd9db1e76c](https://sepolia.etherscan.io/tx/0xc55c76dc587c3583504c614879486c278002fbf8d8bbce79dd56e6fd9db1e76c)
- **Withdraw TX** → [0x14ece661f70253a9ce5d9e33de247301dd11c56c17bf59b65df6af0ee0b0f831](https://sepolia.etherscan.io/tx/0x14ece661f70253a9ce5d9e33de247301dd11c56c17bf59b65df6af0ee0b0f831)
### deploy.js

```js
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
  const initialRoot = process.env.INITIAL_ROOT;
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
```

### separate-and-test.js
```js
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
```


