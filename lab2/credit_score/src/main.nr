use dep::std::merkle::compute_merkle_root;

fn main(
    name: pub [Field; 2],
    lastname: pub [Field; 2],
    credit_score: u16,
    index: Field,
    hashpath: [Field; 5], // for depth-5 Merkle tree
    root: pub Field,
) {
    // 1. Enforce credit_score > 500
    assert(credit_score > 500);

    // 2. Convert credit_score to Field
    let credit_score_field: Field = credit_score as Field;
    
    // 3. Construct the message: name || lastname || credit_score
    let message: [Field; 5] = [
        name[0], name[1],
        lastname[0], lastname[1],
        credit_score_field
    ];

    // 4. Hash the message into a Merkle leaf
    let leaf = std::hash::pedersen_hash(message);


    // 5. Recompute Merkle root from leaf and path
    let merkle_root = compute_merkle_root(leaf, index, hashpath);

    // 6. Verify it matches the expected root
    assert(merkle_root == root);
}