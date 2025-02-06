import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { cn } from "@lib/utils";
import { ReactNode } from "react";

interface Props {
    title: string;
    value: number | string;
    dataSource: string;
    actionButton?: ReactNode;
    className?: string;
}
export default function DisplayCard({
    title,
    value,
    dataSource,
    actionButton,
    className,
}: Props) {
    return (
        <Card className={cn("w-fit h-52 p-8 relative", className)}>
            <div className="absolute top-4 right-4">
                <Badge variant="secondary">{dataSource}</Badge>
            </div>
            <div className="flex flex-col justify-center h-full mt-3">
                <CardContent className="p-0">
                    <div className="h-full flex flex-col justify-center items-center gap-2">
                        <div>{title}</div>
                        {value ? (
                            <div className="text-3xl font-bold">{value}</div>
                        ) : (
                            <div className="text-3xl font-bold">N/A</div>
                        )}
                        {actionButton}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
