import { ProposalAdded as ProposalAddedEvent } from "../generated/FincubeTesting/FincubeTesting"
import { ProposalAdded } from "../generated/schema"

export function handleProposalAdded(event: ProposalAddedEvent): void {
  let entity = new ProposalAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalType = event.params.proposalType
  entity.proposalId = event.params.proposalId
  entity.data = event.params.data

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
