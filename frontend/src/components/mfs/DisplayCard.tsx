import { Badge } from "@components/ui/badge";
import { Card } from "@components/ui/card";
import { ReactNode } from "react";

interface Props {
  title: string;
  value: number | string;
  dataSource: string;
  actionButton?: ReactNode;
}
export default function DisplayCard({
  title,
  value,
  dataSource,
  actionButton,
}: Props) {
  return (
    <Card className="w-fit h-52 p-8">
      <div className="flex items-center justify-start gap-2 h-10">
        <Badge variant="secondary">{dataSource}</Badge>
        {actionButton}
      </div>
      <div className="h-full flex flex-col justify-center items-center gap-5">
        <div>{title}</div>
        {value ? (
          <div className="text-3xl font-bold">{value}</div>
        ) : (
          <div className="text-3xl font-bold">N/A</div>
        )}
      </div>
    </Card>
  );
}
