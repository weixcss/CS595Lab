# Noir Lab 2: Credit Score Proof

Welcome to **Lab 2** of the Noir Zero-Knowledge Proof series. In this lab, you’ll build a more realistic and sophisticated ZK system using Noir. You’ll implement a circuit that proves that a person’s credit score is above a threshold **without revealing the credit score itself**, and generate Merkle proofs to show that this person is part of a registered list.

---

## 🔐 Lab Overview

In this lab, you'll prove knowledge of a credit score above a certain threshold **while also proving inclusion in a public Merkle tree**. The Merkle tree is built from tuples of `(first_name, last_name, credit_score)`, and each user must prove:

> “I am in the tree, and my credit score is greater than 500.”

This lab is split into two parts:

---

## 📦 Part 1: Writing the Circuit in Noir

You will implement a Noir circuit that:

- Takes as input:
  - `name: [Field; 2]` (public)
  - `lastname: [Field; 2]` (public)
  - `credit_score: u16` (private)
  - `index: Field` (private)
  - `hashpath: [Field; 5]` (private)
  - `root: Field` (public)

- Reconstructs the Merkle leaf by hashing the inputs with Pedersen hash
- Recomputes the Merkle root using `compute_merkle_root`
- Asserts:
  - `credit_score > 500`
  - the recomputed root equals the public root

This part focuses on:
- Representing strings as `[Field; 2]`
- Handling Merkle proofs inside a ZK circuit
- Working with Pedersen hashing and Noir’s circuit semantics

---

## ⚙️ Part 2: JS Tooling — Generating `Prover.toml`

In this part, you'll write JavaScript code to:

- Encode names into `[Field; 2]` format using padding
- Convert credit scores into properly padded `Field` values (like Noir’s `u16 as Field`)
- Compute the Merkle tree using the `@aztec/bb.js` Barretenberg API
- Generate inclusion proofs (`pathElements`, `index`) for each user
- Output a valid `Prover.toml` file to test your Noir circuit

This part gives you experience with:
- Working with real zero-knowledge tooling
- Understanding serialization formats like TOML
- Matching JS and Noir hashing formats
- Handling tree updates and proofs programmatically

---

## ✅ Goals of Lab 2

- Learn to represent real-world data in Noir circuits
- Understand how Merkle trees are used in ZK applications
- See how frontends or provers generate proof inputs
- Use the Barretenberg backend (`bb`) to prove and verify circuits

---

## 🚀 Running in Codespaces

Same as Lab 1 — this repo supports zero-setup development via GitHub Codespaces.

1. **Fork** this repo to your own GitHub.
2. Click the **`<> Code`** button → **`Codespaces` → `Create codespace on main`**
3. Wait for it to initialize
4. Use the built-in terminal to run commands

---

## 🧩 What's Preinstalled

Everything is ready to go:

- `noirup` + `nargo`
- `bbup` with Barretenberg backend
- Node.js + npm + npx
- Preconfigured examples in the `src/` directory

---

## 🛠 Commands Recap

### Compile Circuit
```bash
nargo execute
```

### Generate Proof
```bash
bb prove --scheme ultra_honk --oracle_hash keccak -b ./target/[circuit].json -w ./target/[witness].gz -o ./target
```

### Generate Verifcation Key
```bash
bb write_vk --scheme ultra_honk  --oracle_hash keccak -b ./target/[circuit].json -o ./target
```

### Verify the Proof/Witness is Consistent with the Verification Key
```bash
bb verify --scheme ultra_honk --oracle_hash keccak -k ./target/vk -p ./target/proof
```

---

## 📤 Solidity Export

Once your circuit is working, you can:

- Export a verifier with:
  ```bash
  bb write_solidity_verifier --scheme ultra_honk -k ./target/vk -o ./target/Verifier.sol
  ```
- Deploy to Sepolia using Remix + MetaMask
- Format your proof + inputs with chunking helpers

---

## 📁 Project Structure

This lab consists of **two directories**:

### 1. `credit_score/` — Noir Circuit

This directory contains the **Noir circuit** that proves the following statement:

> “I am part of a public Merkle tree, and my credit score is greater than 500.”

### 🔍 Circuit Explanation

Inside `credit_score/src/main.nr`, you’ll find the following logic:

```rust
fn main(
    name: pub [Field; 2],
    lastname: pub [Field; 2],
    credit_score: u16,
    index: Field,
    hashpath: [Field; 5], // for depth-5 Merkle tree
    root: pub Field,
)
```

This circuit:

1. **Checks that `credit_score > 500`** — without revealing the actual score.
2. **Casts the score to a `Field`**, so it can be hashed alongside other data.
3. **Constructs a hash input** combining:
   - `name` → a `[Field; 2]` representation of the person's first name
   - `lastname` → a `[Field; 2]` version of the last name
   - `credit_score_field` → the score as a Field
4. **Uses Pedersen hash** to turn this message into a Merkle leaf:
   ```rust
   let leaf = std::hash::pedersen_hash(message);
   ```
5. **Recomputes the Merkle root** using:
   ```rust
   let merkle_root = compute_merkle_root(leaf, index, hashpath);
   ```
6. **Asserts that this root matches the public input**:
   ```rust
   assert(merkle_root == root);
   ```

✅ This allows someone to prove:
- They are listed in a known Merkle tree
- Their credit score is over the threshold
- Without revealing the actual credit score

---

Here's a new section you can add to the README under **Project Structure** or as its own section called:

---

### 2 📜 `merkle_tree_demo/` — JavaScript Files

To help you interact with the Noir circuit in a real-world way, we’ve included several JavaScript files that handle Merkle tree construction, input encoding, and TOML generation.

### 🔧 `MerkleTree.ts` — Reusable Merkle Tree Class

This is a fully self-contained and reusable `MerkleTree` class that:

- Uses the **same Pedersen hash function** as Noir (via `@aztec/bb.js`)
- Supports:
  - Inserting leaves
  - Generating Merkle proofs
  - Computing the Merkle root
- Can be reused in future ZK projects where you need Merkle proofs

💡 This class is compatible with the `compute_merkle_root` and `std::hash::pedersen_hash` functions used in Noir, so your JS and circuit logic stay in sync.

---

### 🧪 `demo.ts` — Simple Usage Example

This file demonstrates how to use the `MerkleTree` class in a straightforward, test-style setup.

It shows:
- How to insert data into the tree
- How to generate and inspect inclusion proofs
- How to compute the Merkle root and log the results

It’s a great starting point to understand the flow between data encoding, hashing, and tree mechanics.

---

### 🛠️ `generateToml.ts` — Automatic Input Generator

This file automates the creation of a `Prover.toml` file for your Noir circuit by:

- Defining a list of "students" (e.g., people with `firstName`, `lastName`, and `creditScore`)
- Encoding their data as `[Field; 2]` + `u16` → `Field`, as expected by the Noir circuit
- Inserting them into the Merkle tree
- Generating a Merkle proof for one of them
- Writing all necessary values (`name`, `lastname`, `credit_score`, `hashpath`, `index`, `root`) into a TOML file

You can run it with:

```bash
npx ts-node generateToml.ts
```

This prepares a fully valid `Prover.toml` so you can immediately run:

```bash
nargo execute
```

