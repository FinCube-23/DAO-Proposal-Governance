import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ProposalAdded } from "../generated/FincubeTesting/FincubeTesting"

export function createProposalAddedEvent(
  proposalType: i32,
  proposalId: BigInt,
  data: Bytes
): ProposalAdded {
  let proposalAddedEvent = changetype<ProposalAdded>(newMockEvent())

  proposalAddedEvent.parameters = new Array()

  proposalAddedEvent.parameters.push(
    new ethereum.EventParam(
      "proposalType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(proposalType))
    )
  )
  proposalAddedEvent.parameters.push(
    new ethereum.EventParam(
      "proposalId",
      ethereum.Value.fromUnsignedBigInt(proposalId)
    )
  )
  proposalAddedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )

  return proposalAddedEvent
}
