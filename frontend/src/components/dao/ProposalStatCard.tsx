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

const convertToDate = (time: number) => {
  const date = new Date(time * 1000);
  const formattedDate = date.toLocaleString();

  return formattedDate;
};

export const ProposalStatCard = ({ proposal, proposalId }: any) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Status</CardTitle>
          <div>
            <p className="font-bold">
              Vote Started At:{" "}
              <span className="text-green-400">
                {convertToDate(proposal.voteStart)}
              </span>
            </p>
            <p className="text-left font-bold">
              Vote Ended On:{" "}
              <span className="text-green-400">
                {convertToDate(proposal.voteStart)}
              </span>
            </p>
          </div>
        </div>
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
