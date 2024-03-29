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
import VotingProgressBar from "./VotingProgressBar";
import { Button } from "@components/ui/button";

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
                    <TabsContent value="breakdown" className="mt-4">
                        <div className="flex justify-between">
                            <div className="text-primary font-bold">
                                Approved By
                            </div>
                            <div>
                                <span className="text-primary font-bold">
                                    50
                                </span>{" "}
                                of 100 Members
                            </div>
                        </div>
                        <VotingProgressBar total={100} yes={50} no={20} />
                        <div className="flex justify-end">
                            <Button className=" mt-2 bg-green-400 font-bold w-32">
                                Vote
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="voters" className="mt-4">
                        Change your password here.
                    </TabsContent>
                    <TabsContent value="info" className="mt-4">
                        Change your password here.
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
