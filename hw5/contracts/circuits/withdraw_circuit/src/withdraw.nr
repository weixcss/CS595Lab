// File: circuits/withdraw-circuit/src/withdraw.nr

const DEPTH: u32 = 8;

// Helper: Convert the deposit index to an array of booleans (length DEPTH).
fn to_bits(index: Field) -> [bool; DEPTH] {
    return field_to_bits(index, DEPTH);
}

// Helper: Compute the Merkle root from a leaf, path, and index bit directions.
fn compute_merkle_root(leaf: Field, path: [Field; DEPTH], index_bits: [bool; DEPTH]) -> Field {
    let mut current = leaf;
    for i in 0..DEPTH {
        if index_bits[i] {
            current = pedersen_hash([path[i], current]);
        } else {
            current = pedersen_hash([current, path[i]]);
        }
    }
    return current;
}

fn main(
    // Private inputs:
    r: Field,
    index: Field,
    path: [Field; DEPTH],
    // Public inputs:
    pub root: Field,
    pub id: Field   // id serves as the nullifier
) {
    // 1. Compute the commitment from id and r.
    let computed_commitment = pedersen_hash([id, r]);

    // 2. Convert the index to its bit representation.
    let index_bits: [bool; DEPTH] = to_bits(index);

    // 3. Recompute the Merkle root using the given path.
    let computed_root = compute_merkle_root(computed_commitment, path, index_bits);
    assert(computed_root == root);
}