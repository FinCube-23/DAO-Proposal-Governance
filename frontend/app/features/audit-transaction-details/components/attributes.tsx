import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/shared/types/transactions';
import { FileText } from 'lucide-react';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { JsonViewer } from '@/shared/components/json-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const attributeColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'attr_key',
    header: 'Key',
    cell: ({ row }) => (
      <code className="font-mono text-sm">
        {row.getValue('attr_key')}
      </code>
    ),
  },
  {
    accessorKey: 'attr_value_text',
    header: 'Value',
    cell: ({ row }) => {
      const attr = row.original;
      if (attr.attr_value_text)
        return attr.attr_value_text;
      if (attr.attr_value_number !== undefined)
        return attr.attr_value_number.toString();
      if (attr.attr_value_bool !== undefined)
        return attr.attr_value_bool.toString();
      if (attr.attr_value_json)
        return <JsonViewer data={attr.attr_value_json} initialCollapsed />;
      return <span className="text-muted-foreground">null</span>;
    },
  },
];

interface Props {
  transaction: Transaction;
}

export default function TransactionAttributes({ transaction }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          Transaction Attributes
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto -mx-4 sm:mx-0 px-8 sm:px-6">
        <DataTable
          columns={attributeColumns}
          data={transaction.attributes}
        />
      </CardContent>
    </Card>
  );
}
