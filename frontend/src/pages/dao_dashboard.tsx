import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@components/ui/card";

import { Box, Coins, Flag, Vote, WalletCards } from "lucide-react";

export default function DaoDashboard() {
    return (
        <div className="flex flex-col gap-5">
            <Card>
                <CardHeader>
                    <CardTitle>DAO Title Dashboard</CardTitle>
                    <CardDescription>
                        <a
                            href="#"
                            className="text-sm text-green-500 cursor-pointer hover:underline"
                        >
                            0x68fa609716a1901b51e22c88baf660ca1d8dec0b
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
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-7 flex flex-col gap-5">
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
                    <Card>
                        <CardHeader>
                            <div>
                                <Badge>Executed</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-2xl">
                                Proposal Title Placeholder
                            </div>
                            <div className="text-muted-foreground">
                                Proposal Desc Placeholder
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="flex gap-1 text-sm">
                                <div className="text-muted-foreground">
                                    Published by
                                </div>
                                <a href="#" className="text-green-500 hover:underline cursor-pointer">
                                    0x68fa609716a1901b51e22c88baf660ca1d8dec0b
                                </a>
                            </div>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div>
                                <Badge variant="destructive">Defeated</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-2xl">
                                Proposal Title Placeholder
                            </div>
                            <div className="text-muted-foreground">
                                Proposal Desc Placeholder
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="flex gap-1 text-sm">
                                <div className="text-muted-foreground">
                                    Published by
                                </div>
                                <a href="#" className="text-green-500 hover:underline cursor-pointer">
                                    0x68fa609716a1901b51e22c88baf660ca1d8dec0b
                                </a>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div className="col-span-5">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Coins className="text-green-500" />
                                </div>
                                <div>
                                    <Button>New Proposal</Button>
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
