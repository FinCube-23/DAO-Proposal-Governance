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
// import VoterList from "./VoterList";
import { labels } from "./Labels";

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
    <div className="flex items-center gap-5">
      <Card className="flex-grow">
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
            <Badge variant={convertStatusToVariant(proposal.canceled)}>
              <p className="capitalize">
                {proposal.canceled ? "Canceled" : "Pending"}
              </p>
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakdown">
            <TabsList>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              {/* <TabsTrigger value="voters">Voters</TabsTrigger> */}
            </TabsList>
            <TabsContent value="breakdown" className="mt-4">
              <VotingBreakdown proposalId={proposalId} />
            </TabsContent>
            {/* <TabsContent value="voters" className="mt-4">
              <VoterList />
            </TabsContent> */}
          </Tabs>
        </CardContent>
      </Card>
      <div>
        <p className="text-xl font-bold py-2">Vote Labels:</p>
        {labels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`h-4 w-4 bg-${label.color}-400`}></div>
            <span>{label.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
