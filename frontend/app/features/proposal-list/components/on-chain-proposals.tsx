interface Props {
  filter?: string;
  search?: string;
}

export default function OnChainProposals({ filter, search }: Props) {
  return (
    <div>
      {filter}
      {' '}
      {search}
    </div>
  );
}
