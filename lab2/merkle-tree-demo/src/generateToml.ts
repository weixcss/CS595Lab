import { Fr, BarretenbergSync } from '@aztec/bb.js';
import { MerkleTree } from './MerkleTree';
import fs from 'fs';

function u16ToFr(u16: number): Fr {
    if (u16 > 0xffff) throw new Error('u16 overflow');
    const buf = Buffer.alloc(32); // 32-byte zero-padded buffer
    buf.writeUInt16BE(u16, 30);   // write into the LAST 2 bytes
    return Fr.fromBuffer(buf);
  }

/**
 * Converts a UTF-8 string into a pair of hex strings representing [Field; 2]
 * Each string is encoded into 64 bytes, then split into two 32-byte chunks.
 */
function stringToFieldHexPair(str: string): [string, string] {
  const buf = Buffer.alloc(64);
  Buffer.from(str, 'utf8').copy(buf);
  return [
    Fr.fromBufferReduce(buf.subarray(0, 32)).toString(),
    Fr.fromBufferReduce(buf.subarray(32, 64)).toString(),
  ];
}

/**
 * Given Fr elements, perform a Pedersen hash as a stand-in for Noir's hash_to_field
 */
function hashStudentLeaf(bb: BarretenbergSync, fields: Fr[]): Fr {
  return bb.pedersenHash(fields, 0);
}

async function main() {
  const students = [
    { firstName: "Alice", lastName: "Johnson", creditScore: 720 },
    { firstName: "Bob", lastName: "Smith", creditScore: 580 },
    { firstName: "Charlie", lastName: "Brown", creditScore: 490 },
  ];

  await BarretenbergSync.initSingleton();
  const bb = BarretenbergSync.getSingleton();

  const tree = new MerkleTree(5); // depth-5 for Noir circuit
  await tree.initialize([]);

  const leaves: Fr[] = [];

  for (const student of students) {
    const nameBuf = Buffer.alloc(64);
    Buffer.from(student.firstName, 'utf8').copy(nameBuf);
    const name: [Fr, Fr] = [
        Fr.fromBufferReduce(nameBuf.subarray(0, 32)),
        Fr.fromBufferReduce(nameBuf.subarray(32, 64))
    ];

    const lastBuf = Buffer.alloc(64);
    Buffer.from(student.lastName, 'utf8').copy(lastBuf);
    const lastname: [Fr, Fr] = [
      Fr.fromBufferReduce(lastBuf.subarray(0, 32)),
      Fr.fromBufferReduce(lastBuf.subarray(32, 64)),
    ];
    const credit = u16ToFr(student.creditScore);
    // const credit = new Fr(BigInt(student.creditScore));
    const message = [name[0], name[1], lastname[0], lastname[1], credit];
    const leaf = hashStudentLeaf(bb, message);
    console.log("LEAF:", leaf.toString());


    leaves.push(leaf);
    tree.insert(leaf);
  }

  // Select a student for whom to generate Prover.toml
  const selectedIndex = 1; // Bob
  const student = students[selectedIndex];
  const leaf = leaves[selectedIndex];
  const index = tree.getIndex(leaf);
  const proof = tree.proof(index);

  // Convert all fields to hex strings
  const creditHex = new Fr(BigInt(student.creditScore)).toString();
  const indexHex = new Fr(BigInt(index)).toString();
  const rootHex = proof.root.toString();

  const [name0, name1] = stringToFieldHexPair(student.firstName);
  const [last0, last1] = stringToFieldHexPair(student.lastName);

  const hashpathHex = proof.pathElements
    .map(el => el.toString())
    .concat(Array(5 - proof.pathElements.length).fill('0x0'))
    .slice(0, 5);

  // Format TOML
  const toml = `
credit_score = "${creditHex}"
hashpath = ["${hashpathHex.join('", "')}"]
index = "${indexHex}"
lastname = ["${last0}", "${last1}"]
name = ["${name0}", "${name1}"]
root = "${rootHex}"
`.trim();

  fs.writeFileSync('Prover.toml', toml);
  console.log('\n✅ Prover.toml written for:', student.firstName, student.lastName);
  console.log(toml);
}

main().catch(console.error);
