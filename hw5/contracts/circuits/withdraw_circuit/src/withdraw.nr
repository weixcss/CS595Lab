// File: contracts/circuits/withdraw_circuit/src/withdraw.nr

use std::hash::pedersen_hash;

fn main(
    // Private inputs
    r: Field,
    index: Field,
    path: [Field; 8],

    // Public inputs
    root: Field,
    id: Field
) {
    // 1. Recompute the commitment = PedersenHash(id, r)
    let commitment = pedersen_hash([id, r]);

    // 2. Decompose index into 8 LE bits
    let bits: [u1; 8] = index.to_le_bits::<8>();

    // 3. Walk the Merkle path
    let mut cur: Field = commitment;
    for i in 0..8 {
        if bits[i] == 1 {
            cur = pedersen_hash([path[i], cur]);
        } else {
            cur = pedersen_hash([cur, path[i]]);
        }
    }

    // 4. Check that the resulting root matches the public `root`
    assert(cur == root);

    // 5. Enforce the nullifier = id
    //    (the public `id` input serves as your nullifier)
}