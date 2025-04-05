import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import VotingInfo from "./VotingInfo";

export const OffchainStatCard = ({ proposal }: any) => {
  const convertStatusToVariant = (status: string) => {
    return status != "pending" ? "success" : "warning";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Proposal Status</CardTitle>
        </div>
        <CardDescription>
          <Badge variant={convertStatusToVariant(proposal.proposal_status)}>
            <p className="capitalize">
              {proposal.proposal_status != "pending" ? "Confirmed" : "Pending"}
            </p>
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info">
          <TabsList className="rounded-xl">
            <TabsTrigger value="info" className="rounded-xl">
              Info
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-4">
            <VotingInfo proposal={proposal} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
