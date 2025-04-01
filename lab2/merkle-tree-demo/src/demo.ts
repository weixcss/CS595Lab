// demo.ts
import { MerkleTree } from './MerkleTree';
// @ts-ignore
import {Fr} from '@aztec/bb.js';

async function main() {
  // Create a MerkleTree with 3 levels
  const tree = new MerkleTree(3);

  // Initialize the tree with some leaves
  const defaultLeaves = [
    Fr.fromString('0x0000000000000000000000000000000000000000000000000000000000000001'),
    Fr.fromString('0x0000000000000000000000000000000000000000000000000000000000000002'),
    Fr.fromString('0x0000000000000000000000000000000000000000000000000000000000000003')
  ];
  await tree.initialize(defaultLeaves);

  console.log('Initial root:', tree.root().toString());

  // Insert a new leaf
  const newLeaf = Fr.fromString('0x0000000000000000000000000000000000000000000000000000000000000004');
  console.log('Inserting leaf "4" ...');
  tree.insert(newLeaf);

  console.log('New root after insert:', tree.root().toString());

  // Show how we can get a proof for the leaf we just inserted
  const indexOfNewLeaf = tree.getIndex(newLeaf);
  console.log('Index of newly inserted leaf:', indexOfNewLeaf);

  const proof = tree.proof(indexOfNewLeaf);
  console.log('Proof details:');
  console.log('  Leaf:', proof.leaf.toString());
  console.log('  Root:', proof.root.toString());
  console.log('  Path Elements:', proof.pathElements.map(fr => fr.toString()));
  console.log('  Path Indices:', proof.pathIndices);

  console.log(tree.getIndex(defaultLeaves[2]));
}

main().catch(console.error);
