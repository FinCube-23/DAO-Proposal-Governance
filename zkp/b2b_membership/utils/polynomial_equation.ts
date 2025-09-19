// polynomial_equation.ts
const bn_254_fp =
    21888242871839275222246405745257275088548364400416034343698204186575808495617n

const mod = (x: bigint, f: bigint = bn_254_fp): bigint => {
    const result = x % f
    return result >= 0n ? result : result + f
}

// returns an array of coefficients that represent an polynomial, P where P(roots[i]) = 0
// the array is sorted (lowest degree first)
export function interpolatePolynomial(roots: bigint[]): bigint[] {
    // Start with polynomial 1
    let polynomial = [1n]

    for (const root of roots) {
        const newPolynomial: bigint[] = new Array(polynomial.length + 1).fill(
            0n
        )

        // Multiply by (x - root)
        for (let i = 0; i < polynomial.length; i++) {
            // x term: coefficient stays same, degree increases
            newPolynomial[i + 1] = mod(newPolynomial[i + 1] + polynomial[i])

            // constant term: multiply by -root
            newPolynomial[i] = mod(newPolynomial[i] - mod(polynomial[i] * root))
        }

        polynomial = newPolynomial
    }

    return polynomial
}

// Verify the polynomial works correctly
export function verifyPolynomial(
    coefficients: bigint[],
    root: bigint
): boolean {
    let result = 0n
    let rootPower = 1n

    for (const coeff of coefficients) {
        result = mod(result + mod(coeff * rootPower))
        rootPower = mod(rootPower * root)
    }

    return result === 0n
}

// Test function
export function testPolynomial() {
    const roots = [1n, 2n, 3n]
    const poly = interpolatePolynomial(roots)

    console.log("Polynomial coefficients:", poly)

    // Verify all roots work
    for (const root of roots) {
        const isValid = verifyPolynomial(poly, root)
        console.log(`Root ${root} valid: ${isValid}`)
    }

    // Test non-root
    const nonRootValid = verifyPolynomial(poly, 4n)
    console.log(`Non-root 4 valid: ${nonRootValid}`) // Should be false
}
