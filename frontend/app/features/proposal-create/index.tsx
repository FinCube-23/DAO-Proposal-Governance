import GeneralProposal from './components/general-proposal';
import MemberProposal from './components/member-proposal';

interface Props {
  type: 'general' | 'member';
}
export default function ProposalCreate({ type }: Props) {
  return (
    <div>
      {type === 'general' ? <GeneralProposal /> : type === 'member' ? <MemberProposal /> : null}
    </div>
  );
}
