export function getOnChainStatus(canceled: boolean, executed: boolean): string {
  if (executed)
    return 'executed';
  else if (canceled)
    return 'canceled';
  else return 'pending';
}
