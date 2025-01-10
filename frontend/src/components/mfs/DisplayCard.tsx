import { Card } from "@components/ui/card";

interface Props {
  title: string;
  value: number | string;
  dataSource: string;
}
export default function DisplayCard({ title, value, dataSource }: Props) {
  return (
    <Card className="w-fit h-52 p-8">
      <div className="w-fit font-bold text-xs border-2 border-blue-600 p-1 rounded-xl ">
        {dataSource}
      </div>
      <div className="h-full flex flex-col justify-center items-center gap-5">
        <div>{title}</div>
        <div className="text-3xl font-bold">{value}</div>
      </div>
    </Card>
  );
}
