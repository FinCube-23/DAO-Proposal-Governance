import { Badge } from "@components/ui/badge";
import { Card } from "@components/ui/card";

interface Props {
  title: string;
  value: number | string;
  dataSource: string;
}
export default function DisplayCard({ title, value, dataSource }: Props) {
  return (
    <Card className="w-fit h-52 p-8">
      <Badge className="border-2 border-blue-400">{dataSource}</Badge>
      <div className="h-full flex flex-col justify-center items-center gap-5">
        <div>{title}</div>
        <div className="text-3xl font-bold">{value}</div>
      </div>
    </Card>
  );
}
