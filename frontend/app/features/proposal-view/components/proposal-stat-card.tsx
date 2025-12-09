import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { labels } from "../utils/labels";
import VotingBreakdown from "./voting-breakdown";

function convertToDate(time: number) {
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
}

export function ProposalStatCard({ proposal, proposalId }: any) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-5">
      <Card className="flex-grow w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <CardTitle className="text-lg sm:text-xl">
              Proposal Status
            </CardTitle>
            <div className="w-full sm:w-auto">
              <p className="font-bold text-xs text-right">
                Started On:{" "}
                <span className="text-blue-400">
                  {convertToDate(proposal.voteStart)}
                </span>
              </p>
              <p className="font-bold text-xs text-right">
                Ended On:{" "}
                <span className="text-blue-400">
                  {convertToDate(proposal.voteDuration)}
                </span>
              </p>
            </div>
          </div>
          <CardDescription>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                proposal.canceled
                  ? "bg-red-500/20 border-red-500/20 text-red-400"
                  : "bg-yellow-500/20 border-yellow-500/20 text-yellow-400"
              } border whitespace-nowrap w-fit`}
            >
              <span className="capitalize">
                {proposal.canceled ? "Canceled" : "Pending"}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakdown">
            <TabsList className="rounded-xl w-fit">
              <TabsTrigger
                className="rounded-xl text-xs sm:text-sm"
                value="breakdown"
              >
                Breakdown
              </TabsTrigger>
            </TabsList>
            <TabsContent value="breakdown" className="mt-4">
              <VotingBreakdown proposalId={proposalId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="lg:min-w-[150px]">
        <p className="text-base sm:text-lg font-bold py-2">Vote Labels:</p>
        {labels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`h-3 w-3 sm:h-4 sm:w-4 bg-${label.color}-400`} />
            <span className="text-sm sm:text-base">{label.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
