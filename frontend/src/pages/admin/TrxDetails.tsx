import { useLazyGetTransactionQuery } from "@redux/services/auditTrail";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@components/ui/table";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";

const TrxDetails = () => {
  const { id } = useParams();
  const [getTransaction, { data: trx, isFetching, error }] =
    useLazyGetTransactionQuery();

  useEffect(() => {
    const getTrx = async () => {
      try {
        await getTransaction(Number(id));
      } catch (e) {
        console.error(e);
      }
    };
    getTrx();
  }, [id, getTransaction]);

  if (isFetching) return <div className="text-center p-8">Loading...</div>;
  if (error)
    return (
      <div className="text-red-500 text-center p-8">
        Error loading transaction details
      </div>
    );
  if (!trx) return <div className="text-center p-8">Transaction not found</div>;

  // Parse metadata
  const parsedMetadata =
    typeof trx.metaData === "string" ? JSON.parse(trx.metaData) : trx.metaData;

  const newTrx = { ...trx, metaData: parsedMetadata };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transaction Details</h1>
        <p className="text-muted-foreground my-5 text-xl">ID: {trx.id}</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={trx.trx_status ? "success" : "warning"}
                  className="text-sm"
                >
                  {trx.trx_status ? "Confirmed" : "Pending"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Created At: {formatDate(trx.created_at)}</p>
                <p>Updated At: {formatDate(trx.updated_at)}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="capitalize">
                  {trx.source}
                </Badge>
              </CardContent>
            </Card>

            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="text-lg">
                  Transaction Details (Metadata)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Proposal ID:</TableCell>
                      <TableCell>{parsedMetadata.data.proposalId}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Proposal Type:</TableCell>
                      <TableCell>
                        {!parsedMetadata.data.proposalType ? (
                          <Badge>Membership</Badge>
                        ) : (
                          <Badge>General</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Hash</TableCell>
                      <TableCell className="font-mono break-all">
                        <a
                          className="hover:underline text-blue-300"
                          href={`${import.meta.env.VITE_TRX_EXPLORER}${
                            trx.trx_hash
                          }`}
                          target="_"
                        >
                          {trx.trx_hash}
                        </a>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Raw Transaction Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                {JSON.stringify(newTrx, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrxDetails;
