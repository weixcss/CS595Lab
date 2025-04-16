// File: circuits/deposit-circuit/src/deposit.nr

// Set the depth of the Merkle tree.
const DEPTH: u32 = 8;

// Helper: Convert the index Field to an array of booleans (length DEPTH).
fn to_bits(index: Field) -> [bool; DEPTH] {
    // You may replace this with the actual conversion implementation or use a built-in.
    return field_to_bits(index, DEPTH); // Pseudocode: assumes a helper exists.
}

// Helper: Compute the Merkle root given a starting leaf, a path, and the direction bits.
fn compute_merkle_root(leaf: Field, path: [Field; DEPTH], index_bits: [bool; DEPTH]) -> Field {
    let mut current = leaf;
    for i in 0..DEPTH {
        if index_bits[i] {
            // If the path bit is true, hash the path element first.
            current = pedersen_hash([path[i], current]);
        } else {
            // Otherwise, hash the current value first.
            current = pedersen_hash([current, path[i]]);
        }
    }
    return current;
}

fn main(
    // Private inputs:
    id: Field,
    r: Field,
    oldPath: [Field; DEPTH],
    // Public inputs:
    pub oldRoot: Field,
    pub newRoot: Field,
    pub commitment: Field,
    pub index: Field
) {
    // 1. Check that the provided commitment equals PedersenHash(id, r)
    let computed_commitment = pedersen_hash([id, r]);
    assert(computed_commitment == commitment);

    // 2. Convert index to its bit representation.
    let index_bits: [bool; DEPTH] = to_bits(index);

    // 3. Compute the old Merkle tree root using the known empty leaf value.
    let EMPTY_LEAF: Field = 0x18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63;
    let computed_oldRoot = compute_merkle_root(EMPTY_LEAF, oldPath, index_bits);
    assert(computed_oldRoot == oldRoot);

    // 4. Compute the new Merkle tree root after inserting the commitment.
    let computed_newRoot = compute_merkle_root(commitment, oldPath, index_bits);
    assert(computed_newRoot == newRoot);
}