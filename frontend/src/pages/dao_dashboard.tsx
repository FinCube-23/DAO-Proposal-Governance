import ProposalCard from "@components/dao/ProposalCard";
import { Button } from "@components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@components/ui/card";
import { Proposal } from "@services/proposal/types";
import { Box, Coins, Flag, Vote, WalletCards } from "lucide-react";

const proposals: Proposal[] = [
    {
        title: "Renovation Project",
        description: "Renovating the community center",
        status: "ongoing",
        address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
    },
    {
        title: "Education Program",
        description: "Funding educational workshops",
        status: "executed",
        address: "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
    },
    {
        title: "Park Cleanup",
        description: "Organizing a community park cleanup event",
        status: "canceled",
        address: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4",
    },
];

export default function DaoDashboard() {
    return (
        <div className="flex flex-col gap-5">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">DAO Title Dashboard</CardTitle>
                    <CardDescription>
                        <a
                            href="#"
                            className="text-sm text-green-500 cursor-pointer hover:underline"
                        >
                            
                        </a>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>
                        Lorem ipsum dolor sit amet consectetur, adipisicing
                        elit. Fugiat, corrupti fuga! Laudantium vero libero ipsa
                        possimus quos a provident sunt cupiditate neque, ipsam
                        totam facere temporibus nihil. Sapiente, praesentium
                        magni!
                    </p>
                </CardContent>
                <CardFooter>
                    <div className="flex gap-3 text-sm">
                        <div className="flex gap-1">
                            <Flag className="text-green-500" /> December 2023
                        </div>
                        <div className="flex gap-1">
                            <Box className="text-green-500" />
                            Polygon
                        </div>
                        <div className="flex gap-1">
                            <WalletCards className="text-green-500" />
                            Wallet-based
                        </div>
                    </div>
                </CardFooter>
            </Card>
            <div className="flex flex-col-reverse md:grid md:grid-cols-12 gap-5">
                <div className="md:col-span-7 flex flex-col gap-5">
                    <Card>
                        <div className="flex justify-between items-center p-3">
                            <div className="flex items-center gap-3">
                                <Vote className="text-green-500" />
                                <p>12 Proposal(s) created</p>{" "}
                            </div>
                            <div>
                                <Button>New Proposal</Button>
                            </div>
                        </div>
                    </Card>
                    {/* Proposal List */}
                    {proposals.map((proposal: Proposal, idx: number) => (
                        <ProposalCard key={idx} proposal={proposal} />
                    ))}
                </div>
                <div className="md:col-span-5">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Coins className="text-green-500" />
                                </div>
                                <div>
                                    <Button>New Member</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-2xl">$10,000</div>
                            <div className="text-muted-foreground">
                                Treasury value
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
