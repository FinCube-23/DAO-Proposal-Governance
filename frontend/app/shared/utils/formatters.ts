export function formatAddress(address: string, length = 6): string {
  if (!address)
    return '';
  if (address.length <= length * 2 + 2)
    return address;

  return `${address.slice(0, length + 2)}…${address.slice(-length)}`;
}

export function shortenHash(hash: string, length = 8): string {
  if (!hash)
    return '';
  if (hash.length <= length * 2 + 2)
    return hash;

  return `${hash.slice(0, length + 2)}…${hash.slice(-length)}`;
}

export function formatValue(
  valueRaw: string,
  decimals: number,
  currency: string = 'ETH',
): string {
  if (!valueRaw || valueRaw === '0')
    return `0 ${currency}`;

  const value = BigInt(valueRaw);
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const remainder = value % divisor;

  if (remainder === BigInt(0)) {
    return `${whole.toString()} ${currency}`;
  }

  const decimalsStr = remainder.toString().padStart(decimals, '0');
  const trimmed = decimalsStr.replace(/0+$/, '');

  return `${whole.toString()}.${trimmed} ${currency}`;
}

export function formatFee(gasUsed?: number, effectiveFeeRaw?: string): string {
  if (!gasUsed || !effectiveFeeRaw)
    return 'N/A';

  const fee = BigInt(effectiveFeeRaw);
  const divisor = BigInt(10 ** 18); // Assuming ETH units
  const feeEth = Number(fee) / Number(divisor);

  return `${feeEth.toFixed(6)} ETH`;
}

export function relativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0)
    return `${days}d ago`;
  if (hours > 0)
    return `${hours}h ago`;
  if (minutes > 0)
    return `${minutes}m ago`;
  if (seconds > 0)
    return `${seconds}s ago`;
  return 'Just now';
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

export function determinePrimaryResource(resources: any[]): any | null {
  return resources.find(r => r.role === 'PRIMARY') || resources[0] || null;
}

export function classifyAction(transaction: any): string[] {
  // Mock classification logic - in production this would be more sophisticated
  const actions: string[] = [];

  if (transaction.function_name) {
    switch (transaction.function_name.toLowerCase()) {
      case 'transfer':
        actions.push('TOKEN.TRANSFER');
        break;
      case 'approve':
        actions.push('TOKEN.APPROVE');
        break;
      case 'mint':
        actions.push('TOKEN.MINT');
        break;
      case 'swap':
        actions.push('DEFI.SWAP');
        break;
      case 'vote':
        actions.push('GOVERNANCE.VOTE_CAST');
        break;
      default:
        actions.push('UNKNOWN');
    }
  }

  return actions.length > 0 ? actions : ['UNKNOWN'];
}

export function getChainColor(chainRef: string): string {
  const chainColors: Record<string, string> = {
    'ethereum:1': 'bg-blue-500',
    'polygon:137': 'bg-purple-500',
    'arbitrum:42161': 'bg-cyan-500',
    'optimism:10': 'bg-red-500',
    'base:8453': 'bg-blue-600',
  };

  return chainColors[chainRef] || 'bg-gray-500';
}
