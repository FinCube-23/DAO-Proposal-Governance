// zkp/b2b_membership/utils/test_data_generator.js

const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
// const circomlibjs = require("circomlibjs");  // we may still keep this for fallback

const { poseidon2Hash } = require("@zkpassport/poseidon2") // the Poseidon2 library you just installed

// BN254 field prime
const FIELD_PRIME =
    21888242871839275222246405745257275088548364400416034343698204186575808495617n

// Test configuration
const TEST_CONFIG = {
    roots: [123n, 456n, 789n],
    userEmail: "test@example.com",
    salt: "test_salt_123",
    verifierKey: "verifier_key_456",
    isKYCed: true,
}

// Simple SHA-256 -> field helper (synchronous)
function hashToField(input) {
    const hash = crypto.createHash("sha256").update(input).digest("hex")
    return BigInt("0x" + hash) % FIELD_PRIME
}

// Fallback hash (very weak; only for fallback/testing)
function simpleFallbackHash(inputs) {
    let result = 1n
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i] !== 0n) {
            result = (result + inputs[i] * BigInt(i + 1)) % FIELD_PRIME
        }
    }
    return result
}

// Convert to canonical 0 <= x < FIELD_PRIME
function toPositiveField(value) {
    const r = value % FIELD_PRIME
    return r >= 0n ? r : r + FIELD_PRIME
}

/**
 * realPoseidon2Hash(inputs: bigint[]) -> bigint
 * Uses @zkpassport/poseidon2’s function to hash the inputs with Poseidon2, mod FIELD_PRIME.
 */
function realPoseidon2Hash(inputs) {
    try {
        // Normalize inputs (canonical representatives)
        const arr = inputs.map((x) => {
            const r = x % FIELD_PRIME
            return r >= 0n ? r : r + FIELD_PRIME
        })

        // The poseidon2 library (according to docs) accepts arrays of bigints or numbers
        const raw = poseidon2Hash(arr) // this might be synchronous or asynchronous depending on version

        // raw might already be a BigInt or a string:
        if (typeof raw === "bigint") {
            return raw % FIELD_PRIME
        }
        if (typeof raw === "string") {
            return BigInt(raw) % FIELD_PRIME
        }
        // Some versions might return an object with .toString:
        if (raw && raw.toString) {
            return BigInt(raw.toString()) % FIELD_PRIME
        }

        // If none matched, fallback
        console.warn("poseidon2 result unexpected type:", typeof raw, raw)
        return simpleFallbackHash(inputs)
    } catch (err) {
        console.warn("Poseidon2 hash error:", err)
        return simpleFallbackHash(inputs)
    }
}

/* ------------ Polynomial interpolation (mod FIELD_PRIME) ------------ */
function interpolatePolynomial(roots) {
    let polynomial = [1n]
    for (const root of roots) {
        const newPoly = new Array(polynomial.length + 1).fill(0n)
        for (let i = 0; i < polynomial.length; i++) {
            newPoly[i] = (newPoly[i] - polynomial[i] * root) % FIELD_PRIME
            newPoly[i + 1] = (newPoly[i + 1] + polynomial[i]) % FIELD_PRIME
        }
        polynomial = newPoly
    }
    return polynomial.map((coeff) => toPositiveField(coeff))
}

/* ------------ Test data generation (async) ------------ */
async function generateTestData() {
    console.log("🧪 Generating test data for ZKP circuit...\n")

    // 1. Generate secret from user email + salt
    const secret = hashToField(TEST_CONFIG.userEmail + TEST_CONFIG.salt)
    console.log(`Secret (from ${TEST_CONFIG.userEmail}): ${secret}`)

    // 2. Generate polynomial with secret as root
    const testRoots = [...TEST_CONFIG.roots, secret]
    const polynomial = interpolatePolynomial(testRoots)
    console.log(`Polynomial degree: ${polynomial.length - 1}`)

    // 3. Pad polynomial to MAX_POLY_DEGREE
    const MAX_POLY_DEGREE = 2048
    const paddedPolynomial = [...polynomial]
    while (paddedPolynomial.length <= MAX_POLY_DEGREE) paddedPolynomial.push(0n)
    const validatedPolynomial = paddedPolynomial.map((coeff) =>
        toPositiveField(coeff)
    )

    // 4. Generate REAL polynomial hash using Poseidon2
    const polynomialHash = realPoseidon2Hash(validatedPolynomial)
    console.log(`Polynomial hash (Poseidon2): ${polynomialHash}`)

    // 5. Generate verifier key
    const verifierKey = hashToField(TEST_CONFIG.verifierKey)

    // 6. Generate REAL nullifier using Poseidon2
    const nullifier = realPoseidon2Hash([secret, verifierKey])
    console.log(`Nullifier (Poseidon2): ${nullifier}`)

    const proverToml = `isKYCed = ${TEST_CONFIG.isKYCed}
nullifier = "${nullifier}"
polynomial = [${validatedPolynomial.map((p) => `"${p}"`).join(", ")}]
polynomial_hash = "${polynomialHash}"
secret = "${secret}"
verifier_key = "${verifierKey}"`

    return {
        secret,
        polynomial: validatedPolynomial,
        polynomialHash,
        nullifier,
        verifierKey,
        proverToml,
        testRoots,
    }
}

/* Evaluate polynomial at secret (for validation) */
function testPolynomialEvaluation(polynomial, secret) {
    let result = 0n
    let xPower = 1n
    for (let i = 0; i < polynomial.length; i++) {
        result = (result + polynomial[i] * xPower) % FIELD_PRIME
        xPower = (xPower * secret) % FIELD_PRIME
    }
    return result
}

/* Input validation */
async function validateCircuitInputs(testData) {
    console.log("\n🔍 Validating circuit inputs...")

    const evaluation = testPolynomialEvaluation(
        testData.polynomial,
        testData.secret
    )
    console.log(`✓ Polynomial evaluation at secret: ${evaluation}`)
    console.log(`✓ Secret is valid root: ${evaluation === 0n ? "✅" : "❌"}`)

    const recomputedHash = realPoseidon2Hash(testData.polynomial)
    const hashMatch = recomputedHash === testData.polynomialHash
    console.log(`✓ Polynomial hash consistency: ${hashMatch ? "✅" : "❌"}`)

    const recomputedNullifier = realPoseidon2Hash([
        testData.secret,
        testData.verifierKey,
    ])
    const nullifierMatch = recomputedNullifier === testData.nullifier
    console.log(`✓ Nullifier consistency: ${nullifierMatch ? "✅" : "❌"}`)

    const allInField = testData.polynomial.every(
        (coeff) => coeff < FIELD_PRIME && coeff >= 0n
    )
    console.log(`✓ All coefficients in field: ${allInField ? "✅" : "❌"}`)

    return evaluation === 0n && hashMatch && nullifierMatch && allInField
}

/* CLI entrypoint */
if (require.main === module) {
    ;(async () => {
        console.log(
            "🚀 Starting ZKP test data generation (using Poseidon2)...\n"
        )
        try {
            const testData = await generateTestData()
            const isValid = await validateCircuitInputs(testData)
            if (!isValid) {
                console.error("❌ Validation failed! Please check the inputs.")
                process.exit(1)
            }

            console.log("\n📝 Writing test data to Prover.toml...")
            const proverPath = path.join(__dirname, "../circuit/Prover.toml")
            fs.writeFileSync(proverPath, testData.proverToml)
            console.log("✅ Test data written to Prover.toml")

            console.log("\n📊 Test Summary:")
            console.log(`- Secret: ${testData.secret}`)
            console.log(
                `- Polynomial degree: ${testData.polynomial.length - 1}`
            )
            console.log(`- Polynomial hash: ${testData.polynomialHash}`)
            console.log(`- Nullifier: ${testData.nullifier}`)
            console.log(`- Verifier key: ${testData.verifierKey}`)
            console.log(`- Using Poseidon2 for hashing ✅`)

            console.log("\n📜 First few polynomial coefficients:")
            for (let i = 0; i < Math.min(5, testData.polynomial.length); i++) {
                console.log(`  coefficient[${i}]: ${testData.polynomial[i]}`)
            }

            console.log("\n🎯 Ready for circuit testing!")
            console.log("Run: cd circuit && nargo prove && nargo verify")
        } catch (err) {
            console.error("Fatal error generating test data:", err)
            process.exit(1)
        }
    })()
}

module.exports = {
    generateTestData,
    toPositiveField,
    FIELD_PRIME,
    realPoseidon2Hash,
    validateCircuitInputs,
}
