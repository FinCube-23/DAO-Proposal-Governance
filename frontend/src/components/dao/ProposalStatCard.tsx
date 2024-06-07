import { Badge } from "@components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Proposal } from "@services/proposal/types";
import VotingBreakdown from "./VotingBreakdown";
import VoterList from "./VoterList";
import VotingInfo from "./VotingInfo";

const convertStatusToVariant = (status: string) => {
    switch (status) {
        case "ongoing":
            return "warning";
        case "executed":
            return "success";
        case "canceled":
            return "danger";
        default:
            return "default";
    }
};

interface Props {
    proposal: Proposal;
}

export const ProposalStatCard = ({ proposal }: Props) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Status</CardTitle>
                <CardDescription>
                    <Badge variant={convertStatusToVariant(proposal.status)}>
                        <p className="capitalize">{proposal.status}</p>
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
                    <TabsContent
                        value="breakdown"
                        className="mt-4"
                    >
                        <VotingBreakdown />
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
