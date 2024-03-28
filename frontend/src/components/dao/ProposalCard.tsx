import { Badge } from "@components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@components/ui/card";
import { Proposal } from "@services/proposal/types";

interface Props {
    proposal: Proposal;
}

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
}

export default function ProposalCard({ proposal }: Props) {
    return (
        <Card>
            <CardHeader>
                <div>
                    <Badge variant={convertStatusToVariant(proposal.status)}>
                        <p className="capitalize">{proposal.status}</p>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="font-bold text-2xl">
                {proposal.title}
                </div>
                <div className="text-muted-foreground">
                {proposal.description}
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex gap-1 text-sm">
                    <div className="text-muted-foreground">Published by</div>
                    <a
                        href="#"
                        className="text-green-500 hover:underline cursor-pointer"
                    >
                        <p className="overflow-tranc">
                            {/* 0x68fa609716a1901b51e22c88baf660ca1d8dec0b */}
                            {proposal.address}
                        </p>
                    </a>
                </div>
            </CardFooter>
        </Card>
    );
}
