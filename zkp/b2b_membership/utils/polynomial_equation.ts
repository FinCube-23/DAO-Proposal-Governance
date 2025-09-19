// polynomial_equation.ts
export const bn_254_fp =
    21888242871839275222246405745257275088548364400416034343698204186575808495617n

export const initial_polynomial = [1n] // Represents the polynomial P(x) = 1

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

export function addRoot(oldPoly: bigint[], newRoot: bigint): bigint[] {
    const newPoly = new Array(oldPoly.length + 1).fill(0n)

    for (let i = 0; i < oldPoly.length; i++) {
        // x term: coefficient stays same, degree increases
        newPoly[i + 1] = mod(newPoly[i + 1] + oldPoly[i])

        // constant term: multiply by -newRoot
        newPoly[i] = mod(newPoly[i] - mod(oldPoly[i] * newRoot))
    }

    return newPoly
}

export function removeRoot(
    oldPoly: bigint[],
    rootToRemove: bigint
): bigint[] | null {
    const n = oldPoly.length - 1
    if (n <= 0) throw new Error("Polynomial degree too low")

    const newPoly = new Array(n).fill(0n)

    // Synthetic division: divide oldPoly by (x - rootToRemove)
    let carry = 0n
    for (let i = n; i >= 0; i--) {
        const coeff = mod(oldPoly[i] + carry)
        if (i > 0) {
            newPoly[i - 1] = coeff
            carry = mod(coeff * rootToRemove)
        } else {
            // remainder should be 0 if root is valid
            if (coeff !== 0n) return null // root not valid
        }
    }

    return newPoly
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

// Enhanced test function that includes removeRoot testing
export function testPolynomial() {
    console.log("=== Testing Polynomial Functions ===\n")

    // 1. Basic interpolation test
    console.log("1️⃣ Testing interpolatePolynomial:")
    const roots = [1n, 2n, 3n]
    const poly = interpolatePolynomial(roots)

    console.log("Original roots:", roots)
    console.log("Polynomial coefficients:", poly)

    // Verify all roots work
    for (const root of roots) {
        const isValid = verifyPolynomial(poly, root)
        console.log(`  Root ${root} valid: ${isValid ? "✅" : "❌"}`)
    }

    // Test non-root
    const nonRootValid = verifyPolynomial(poly, 4n)
    console.log(`  Non-root 4 valid: ${nonRootValid ? "❌ PROBLEM" : "✅"}`)

    // 2. Test addRoot function
    console.log("\n2️⃣ Testing addRoot:")
    const newRoot = 4n
    const newPoly = addRoot(poly, newRoot)
    console.log(`Adding root ${newRoot} to polynomial`)
    console.log("New polynomial coefficients:", newPoly)
    console.log(
        `Degree changed from ${poly.length - 1} to ${newPoly.length - 1}`
    )

    // Verify all roots including the new one
    for (const root of [...roots, newRoot]) {
        const isValid = verifyPolynomial(newPoly, root)
        console.log(
            `  Root ${root} valid in new polynomial: ${isValid ? "✅" : "❌"}`
        )
    }

    const nonRootValidNewPoly = verifyPolynomial(newPoly, 5n)
    console.log(
        `  Non-root 5 valid in new polynomial: ${
            nonRootValidNewPoly ? "❌ PROBLEM" : "✅"
        }`
    )

    // 3. Test removeRoot function
    console.log("\n3️⃣ Testing removeRoot:")

    // Test removing a valid root
    const rootToRemove = 2n
    console.log(`Attempting to remove root ${rootToRemove}`)
    const reducedPoly = removeRoot(newPoly, rootToRemove)

    if (reducedPoly === null) {
        console.log("❌ Failed to remove root - this should not happen!")
        return
    }

    console.log("Reduced polynomial coefficients:", reducedPoly)
    console.log(
        `Degree changed from ${newPoly.length - 1} to ${reducedPoly.length - 1}`
    )

    // Verify remaining roots still work
    const remainingRoots = [...roots, newRoot].filter((r) => r !== rootToRemove)
    console.log("Expected remaining roots:", remainingRoots)

    for (const root of remainingRoots) {
        const isValid = verifyPolynomial(reducedPoly, root)
        console.log(`  Remaining root ${root} valid: ${isValid ? "✅" : "❌"}`)
    }

    // Verify removed root no longer works
    const removedRootStillValid = verifyPolynomial(reducedPoly, rootToRemove)
    console.log(
        `  Removed root ${rootToRemove} still valid: ${
            removedRootStillValid ? "❌ PROBLEM" : "✅"
        }`
    )

    // 4. Test removing invalid root
    console.log("\n4️⃣ Testing removeRoot with invalid root:")
    const invalidRoot = 99n
    console.log(`Attempting to remove non-existent root ${invalidRoot}`)
    const failedRemoval = removeRoot(reducedPoly, invalidRoot)

    if (failedRemoval === null) {
        console.log("✅ Correctly rejected invalid root removal")
    } else {
        console.log("❌ Should have failed to remove invalid root")
    }

    // 5. Test round-trip: add then remove same root
    console.log("\n5️⃣ Testing round-trip (add then remove):")
    const testRoot = 10n
    console.log(`Round-trip test with root ${testRoot}`)

    // Start with original polynomial
    const step1 = addRoot(poly, testRoot)
    console.log(`After adding ${testRoot}: degree ${step1.length - 1}`)

    const step2 = removeRoot(step1, testRoot)
    if (step2 === null) {
        console.log("❌ Round-trip failed at removal step")
        return
    }

    console.log(`After removing ${testRoot}: degree ${step2.length - 1}`)

    // Should be back to original
    const backToOriginal =
        poly.length === step2.length &&
        poly.every((coeff, i) => coeff === step2[i])
    console.log(`Round-trip successful: ${backToOriginal ? "✅" : "❌"}`)

    if (!backToOriginal) {
        console.log("Original:", poly)
        console.log("After round-trip:", step2)
    }

    // 6. Test edge cases
    console.log("\n6️⃣ Testing edge cases:")

    // Test with single root polynomial
    const singleRootPoly = interpolatePolynomial([5n])
    console.log("Single root polynomial [5]:", singleRootPoly)

    const removedSingle = removeRoot(singleRootPoly, 5n)
    if (removedSingle === null) {
        console.log("❌ Failed to remove from single-root polynomial")
    } else {
        console.log("After removing single root:", removedSingle)
        console.log(
            `Result is constant ${removedSingle[0]} (should be constant): ${
                removedSingle.length === 1 ? "✅" : "❌"
            }`
        )
    }

    // Test removing from constant polynomial (should fail)
    try {
        const constantPoly = [5n] // P(x) = 5
        removeRoot(constantPoly, 1n)
        console.log("❌ Should have thrown error for constant polynomial")
    } catch (error) {
        console.log(
            "✅ Correctly threw error for constant polynomial:",
            (error as Error).message
        )
    }

    console.log("\n" + "=".repeat(50))
    console.log("🎉 All polynomial function tests completed!")
}

const mod = (x: bigint, f: bigint = bn_254_fp): bigint => {
    const result = x % f
    return result >= 0n ? result : result + f
}

testPolynomial()