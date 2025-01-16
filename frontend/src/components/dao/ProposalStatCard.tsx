import { Badge } from "@components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import VotingBreakdown from "./VotingBreakdown";
import VoterList from "./VoterList";
import VotingInfo from "./VotingInfo";

const convertStatusToVariant = (status: boolean) => {
  return status ? "success" : "warning";
};

export const ProposalStatCard = ({ proposal, proposalId }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Status</CardTitle>
        <CardDescription>
          <Badge variant={convertStatusToVariant(proposal.executed)}>
            <p className="capitalize">
              {proposal.executed ? "Confirmed" : "Pending"}
            </p>
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="breakdown">
          <TabsList>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="voters">Voters</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
          <TabsContent value="breakdown" className="mt-4">
            <VotingBreakdown proposalId={proposalId} />
          </TabsContent>
          <TabsContent value="voters" className="mt-4">
            <VoterList />
          </TabsContent>
          <TabsContent value="info" className="mt-4">
            <VotingInfo />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
