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

const convertStatusToVariant = (status: boolean) => {
  return status ? "success" : "warning";
};

const convertToDate = (time: number) => {
  const date = new Date(time * 1000);
  const formattedDate = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return formattedDate.replace(",", " at");
};

export const OngoingProposalStatCard = ({ proposal, proposalId }: any) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Proposal Status</CardTitle>
          <div>
            <p className="font-bold">
              Vote Started On:
              <span className="text-blue-400">
                {convertToDate(proposal.voteStart)}
              </span>
            </p>
            <p className="text-left font-bold">
              Vote Ended On:{" "}
              <span className="text-blue-400">
                {convertToDate(proposal.voteDuration)}
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
          </TabsList>
          <TabsContent value="breakdown" className="mt-4">
            <VotingBreakdown proposalId={proposalId} />
          </TabsContent>
          <TabsContent value="voters" className="mt-4">
            <VoterList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
