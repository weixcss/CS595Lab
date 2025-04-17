// File: scripts/extract-public-inputs.js

const fs = require('fs');
const path = require('path');

/**
 * Read the first numInputs * 32 bytes from a proof file,
 * write them to public_inputs, and log each Field as hex.
 */
function extractAndWrite(proofPath, outPath, numInputs) {
  const raw = fs.readFileSync(proofPath);
  const pubRaw = raw.slice(0, numInputs * 32);

  // ensure output directory exists
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  // write raw public inputs bytes
  fs.writeFileSync(outPath, pubRaw);

  console.log(`Wrote ${numInputs} public inputs to ${outPath}`);
  for (let i = 0; i < numInputs; i++) {
    const chunk = pubRaw.slice(i * 32, (i + 1) * 32);
    console.log(`  input[${i}]: 0x${chunk.toString('hex')}`);
  }
}

function main() {
  // Deposit circuit proof → 4 public inputs
  const depositProofPath = path.join(
    __dirname,
    '../contracts/circuits/deposit_circuit/target/deposit_proof/proof'
  );
  const depositOutPath = path.join(
    __dirname,
    '../contracts/circuits/deposit_circuit/target/deposit_proof/public_inputs'
  );
  extractAndWrite(depositProofPath, depositOutPath, 4);

  // Withdraw circuit proof → 2 public inputs
  const withdrawProofPath = path.join(
    __dirname,
    '../contracts/circuits/withdraw_circuit/target/withdraw_proof/proof'
  );
  const withdrawOutPath = path.join(
    __dirname,
    '../contracts/circuits/withdraw_circuit/target/withdraw_proof/public_inputs'
  );
  extractAndWrite(withdrawProofPath, withdrawOutPath, 2);
}

main();