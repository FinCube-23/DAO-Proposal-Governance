use dep::poseidon::poseidon2;

global MAX_POLY_DEGREE: u32 = 2048;

fn main(
    polynomial_hash: pub Field,
    nullifier: pub Field,
    verifier_key: pub Field,
    secret: Field,
    isKYCed: bool,
    polynomial: [Field; MAX_POLY_DEGREE + 1],
) {
    // 1. Verify polynomial integrity
    let computed_polynomial_hash = poseidon2::Poseidon2::hash(polynomial, MAX_POLY_DEGREE + 1);
    assert(computed_polynomial_hash == polynomial_hash, "Polynomial hash mismatch");

    // 2. Evaluate polynomial P(secret) - CORRECTED
    let mut result = 0;
    let mut secret_power = 1; // secret^0 = 1
    
    for i in 0..MAX_POLY_DEGREE + 1 {
        result += polynomial[i] * secret_power;
        secret_power *= secret; // Update to next power: secret^(i+1)
    }

    // 3. Verify polynomial evaluates to zero (membership proof)
    assert(result == 0, "Not a member: P(secret) ≠ 0");
    
    // 4. Verify KYC status
    assert(isKYCed == true, "KYC verification required");

    // 5. Generate and verify nullifier (prevent double-use)
    let computed_nullifier = poseidon2::Poseidon2::hash([secret, verifier_key], 2);
    assert(computed_nullifier == nullifier, "Nullifier mismatch");
}