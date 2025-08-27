'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import WithLoader from '@/shared/components/with-loader';
import CreateProposalDialog from './components/create-proposal-dialog';
import ProposalCard from './components/proposal-card';
import ProposalCardSkeleton from './components/proposal-card-skeleton';
import ProposalStats from './components/proposal-stats';
import { useProposals } from './hooks/use-proposals';

export default function Proposals() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { 
    onchainProposals, 
    offchainProposals, 
    loading, 
    error, 
    refetch 
  } = useProposals({ debug: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Proposals</h1>
          <p className="text-gray-400 mt-1">
            Manage and vote on DAO proposals
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button>
      </div>

      {/* Stats */}
      <ProposalStats />

      {/* Proposals Content */}
      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="executed">Executed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-6">
              <WithLoader loading={loading} error={error}>
                <div className="space-y-4">
                  {onchainProposals.length === 0 && offchainProposals.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No proposals found</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Create your first proposal to get started
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* On-chain proposals */}
                      {onchainProposals.map((proposal) => (
                        <ProposalCard
                          key={`onchain-${proposal.proposalId}`}
                          proposal={proposal}
                          type="onchain"
                        />
                      ))}
                      
                      {/* Off-chain proposals */}
                      {offchainProposals.map((proposal) => (
                        <ProposalCard
                          key={`offchain-${proposal.id}`}
                          proposal={proposal}
                          type="offchain"
                        />
                      ))}
                    </>
                  )}
                </div>
              </WithLoader>
              
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ProposalCardSkeleton key={i} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4 mt-6">
              <div className="space-y-4">
                {onchainProposals
                  .filter(p => !p.executed && !p.canceled)
                  .map((proposal) => (
                    <ProposalCard
                      key={`active-${proposal.proposalId}`}
                      proposal={proposal}
                      type="onchain"
                    />
                  ))}
                {onchainProposals.filter(p => !p.executed && !p.canceled).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No active proposals</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-6">
              <div className="space-y-4">
                {offchainProposals
                  .filter(p => p.proposal_status === 'pending')
                  .map((proposal) => (
                    <ProposalCard
                      key={`pending-${proposal.id}`}
                      proposal={proposal}
                      type="offchain"
                    />
                  ))}
                {offchainProposals.filter(p => p.proposal_status === 'pending').length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No pending proposals</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="executed" className="space-y-4 mt-6">
              <div className="space-y-4">
                {onchainProposals
                  .filter(p => p.executed)
                  .map((proposal) => (
                    <ProposalCard
                      key={`executed-${proposal.proposalId}`}
                      proposal={proposal}
                      type="onchain"
                    />
                  ))}
                {onchainProposals.filter(p => p.executed).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No executed proposals</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Proposal Dialog */}
      <CreateProposalDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
