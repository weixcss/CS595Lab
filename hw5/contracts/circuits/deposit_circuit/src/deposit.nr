// File: circuits/deposit_circuit/src/deposit.nr

use std::hash::pedersen_hash;

fn main(
    // Private inputs
    id: Field,
    r: Field,
    oldPath: [Field; 8],

    // Public inputs
    oldRoot: Field,
    newRoot: Field,
    commitment: Field,
    index: Field
) {
    // 1. Check that commitment == pedersen_hash(id, r)
    assert(pedersen_hash([id, r]) == commitment);

    // 2. Decompose index into 8 little-endian bits
    let bits: [u1; 8] = index.to_le_bits::<8>();

    // 3. Recompute the old root starting from the empty-leaf constant
    let mut current: Field = 0x18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63;
    for i in 0..8 {
        if bits[i] == 1 {
            current = pedersen_hash([oldPath[i], current]);
        } else {
            current = pedersen_hash([current, oldPath[i]]);
        }
    }
    assert(current == oldRoot);

    // 4. Compute the new root after inserting the commitment
    let mut updated: Field = commitment;
    for i in 0..8 {
        if bits[i] == 1 {
            updated = pedersen_hash([oldPath[i], updated]);
        } else {
            updated = pedersen_hash([updated, oldPath[i]]);
        }
    }
    assert(updated == newRoot);
}