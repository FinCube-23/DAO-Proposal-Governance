import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ProposalAdded } from "../generated/schema"
import { ProposalAdded as ProposalAddedEvent } from "../generated/FincubeTesting/FincubeTesting"
import { handleProposalAdded } from "../src/fincube-testing"
import { createProposalAddedEvent } from "./fincube-testing-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let proposalType = 123
    let proposalId = BigInt.fromI32(234)
    let data = Bytes.fromI32(1234567890)
    let newProposalAddedEvent = createProposalAddedEvent(
      proposalType,
      proposalId,
      data
    )
    handleProposalAdded(newProposalAddedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("ProposalAdded created and stored", () => {
    assert.entityCount("ProposalAdded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ProposalAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "proposalType",
      "123"
    )
    assert.fieldEquals(
      "ProposalAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "proposalId",
      "234"
    )
    assert.fieldEquals(
      "ProposalAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "data",
      "1234567890"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
