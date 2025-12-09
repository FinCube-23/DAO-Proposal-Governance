import type { GetOneTrxResponse } from '@/core/api/types';
import { Receipt } from 'lucide-react';
import { CopyableCode } from '@/shared/components/copyable-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatAddress } from '@/shared/utils';

interface Props {
  transaction: GetOneTrxResponse;
}
export default function TransactionOverview({ transaction }: Props) {
  // Check if function contains 'transfer'
  const isTransferFunction = transaction.function?.toLowerCase().includes('transfer');

  // Extract wallet addresses for transfer transactions
  const getWalletAddresses = () => {
    if (!isTransferFunction) {
      return { from: transaction.from, to: transaction.to };
    }

    try {
      const rawTx = JSON.parse(transaction.raw_transaction || '{}');
      if (rawTx.senderWalletAddress && rawTx.receiverWalletAddress) {
        return {
          from: rawTx.senderWalletAddress,
          to: rawTx.receiverWalletAddress,
        };
      }
    }
    catch (e) {
      console.error('Failed to parse raw_transaction for wallet addresses:', e);
    }

    // Fallback to default addresses
    return { from: transaction.from, to: transaction.to };
  };

  const { from, to } = getWalletAddresses();

  // Extract contract address from various sources
  const getContractAddress = () => {
    // Try to get from transaction_receipt
    try {
      const receipt = JSON.parse(transaction.transaction_receipt || '{}');
      if (receipt.to) {
        return receipt.to;
      }
      // Check for contractAddress in receipt (for contract creation)
      if (receipt.contractAddress) {
        return receipt.contractAddress;
      }
    }
    catch (e) {
      console.error('Failed to parse transaction_receipt:', e);
    }

    // Try to get from raw_transaction
    try {
      const rawTx = JSON.parse(transaction.raw_transaction || '{}');
      if (rawTx.contractAddress) {
        return rawTx.contractAddress;
      }
    }
    catch (e) {
      console.error('Failed to parse raw_transaction:', e);
    }

    // Fallback to transaction.to
    return transaction.to || null;
  };

  const contractAddress = getContractAddress();

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <label className="text-xs sm:text-sm font-medium">From</label>
              <CopyableCode value={from} displayValue={formatAddress(from)} />
            </div>
            <div className="min-w-0">
              <label className="text-xs sm:text-sm font-medium">To</label>
              {to
                ? (
                    <CopyableCode value={to} displayValue={formatAddress(to)} />
                  )
                : (
                    <span className="text-xs sm:text-sm text-muted-foreground">Contract Creation</span>
                  )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <label className="text-xs sm:text-sm font-medium">Contract Address</label>
              {contractAddress
                ? (
                    <CopyableCode value={contractAddress} displayValue={formatAddress(contractAddress)} />
                  )
                : (
                    <span className="text-xs sm:text-sm text-muted-foreground">-</span>
                  )}
            </div>
            {transaction.function?.toLowerCase().includes('transfer') && (() => {
              try {
                const rawTxData = JSON.parse(transaction.raw_transaction || '{}');
                const amount = rawTxData.amount;
                if (amount !== undefined && amount !== null) {
                  return (
                    <div className="min-w-0">
                      <label className="text-xs sm:text-sm font-medium">Amount</label>
                      <div className="font-mono text-xs sm:text-sm break-words">
                        {amount}
                        {' '}
                        USDC
                      </div>
                    </div>
                  );
                }
              }
              catch (e) {
                console.error('Failed to parse raw_transaction:', e);
              }
              return null;
            })()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium">Source</label>
              <span className={`inline-flex w-fit items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                transaction.source === 'alchemy'
                  ? 'bg-blue-500 text-white'
                  : transaction.source === 'graph'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-500 text-white'
              }`}
              >
                {transaction.source}
              </span>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium">Chain ID</label>
              <div className="font-mono text-xs sm:text-sm break-words">
                {transaction.chain_id || '-'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm font-medium">Gas Cost</label>
              <div className="font-mono text-xs sm:text-sm break-words">
                {transaction.gas_cost ? `${transaction.gas_cost.toFixed(18)} ETH` : 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium">Transaction Fee</label>
              <div className="font-mono text-xs sm:text-sm break-words">
                {transaction.transaction_fee ? `${transaction.transaction_fee.toFixed(18)} ETH` : 'N/A'}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium">Function</label>
            <div className="font-mono text-xs sm:text-sm break-words">
              {transaction.function || 'Unknown'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
