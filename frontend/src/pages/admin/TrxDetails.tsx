import { useLazyGetTransactionQuery } from "@redux/services/auditTrail";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Button } from "@components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";

const TrxDetails = () => {
  const { id } = useParams();
  const [getTransaction, { data: trx, isFetching, error }] =
    useLazyGetTransactionQuery();
  const [copiedMetadata, setCopiedMetadata] = useState(false);
  const [copiedRawData, setCopiedRawData] = useState(false);
  const [copiedTrxHash, setCopiedTrxHash] = useState(false);

  useEffect(() => {
    const getTrx = async () => {
      try {
        await getTransaction(id);
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

  const defaultTheme = {
    key: "#9CDCFE", // Keep field names (keys) the same light blue
    string: "#47d147", // Green for strings
    number: "#2563EB", // Dark blue for numbers
    boolean: "#FF6B6B", // Red for booleans
    null: "#569CD6", // Keep original blue for null
    undefined: "#569CD6", // Keep original blue for undefined
    function: "#DCDCAA", // Keep original for functions
    symbol: "#DCDCAA", // Keep original for symbols
    date: "#B5CEA8", // Keep original for dates
    punctuation: "#D4D4D4", //
    text: "#D4D4D4",
  };

  const JsonRenderer = ({
    data,
    depth = 0,
    theme = defaultTheme,
  }: {
    data: any;
    depth?: number;
    theme?: typeof defaultTheme;
  }) => {
    const getValueType = (value: any) => {
      if (value === null) return "null";
      if (Array.isArray(value)) return "array";
      if (typeof value === "object") return "object";
      if (typeof value === "number") return "number";
      if (typeof value === "boolean") return "boolean";
      if (typeof value === "function") return "function";
      if (typeof value === "string") {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value))
          return "date";
        if (/^0x[a-fA-F0-9]+$/.test(value)) return "hex";
      }
      return typeof value;
    };

    const renderValue = (value: any) => {
      const type = getValueType(value);

      switch (type) {
        case "string":
          return (
            <span style={{ color: theme.string }}>{JSON.stringify(value)}</span>
          );
        case "number":
          return <span style={{ color: theme.number }}>{value}</span>;
        case "boolean":
          return (
            <span style={{ color: theme.boolean }}>{value.toString()}</span>
          );
        case "null":
          return <span style={{ color: theme.null }}>null</span>;
        case "date":
          return (
            <>
              <span style={{ color: theme.string }}>
                {JSON.stringify(value)}
              </span>
              <span style={{ color: theme.text, marginLeft: "8px" }}>
                ({new Date(value).toLocaleString()})
              </span>
            </>
          );
        case "hex":
          return (
            <span style={{ color: theme.string }}>
              {JSON.stringify(value)}
              <span style={{ color: theme.text, marginLeft: "8px" }}>
                (hex)
              </span>
            </span>
          );
        default:
          return (
            <span style={{ color: theme.text }}>{JSON.stringify(value)}</span>
          );
      }
    };

    if (typeof data !== "object" || data === null) {
      return renderValue(data);
    }

    if (Array.isArray(data)) {
      return (
        <span>
          <span style={{ color: theme.punctuation }}>[</span>
          <div style={{ marginLeft: `${depth * 20}px` }}>
            {data.map((item, index) => (
              <div key={index}>
                <JsonRenderer data={item} depth={depth + 1} theme={theme} />
                {index < data.length - 1 && (
                  <span style={{ color: theme.punctuation }}>,</span>
                )}
              </div>
            ))}
          </div>
          <span style={{ color: theme.punctuation }}>]</span>
        </span>
      );
    }

    return (
      <span>
        <span style={{ color: theme.punctuation }}>{"{"}</span>
        <div style={{ marginLeft: `${depth * 20}px` }}>
          <div className="ml-4">
            {Object.entries(data).map(([key, value], index, array) => (
              <div key={key}>
                <span style={{ color: theme.key }}>{JSON.stringify(key)}</span>
                <span style={{ color: theme.punctuation }}>: </span>
                <JsonRenderer data={value} depth={depth + 1} theme={theme} />
                {index < array.length - 1 && (
                  <span style={{ color: theme.punctuation }}>,</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <span style={{ color: theme.punctuation }}>{"}"}</span>
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transaction Details</h1>
        <p className="text-muted-foreground my-5 text-xl">
          Off-Chain ID: {trx.id}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-2 rounded-xl">
          <TabsTrigger className="rounded-xl" value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger className="rounded-xl" value="raw">
            Raw Data
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
                {trx.source === "alchemy" ? (
                  <Badge
                    variant="outline"
                    className="border-2 border-blue-400 text-white"
                  >
                    Alchemy
                  </Badge>
                ) : trx.source === "graph" ? (
                  <Badge
                    variant="outline"
                    className="border-2 border-purple-400 text-white"
                  >
                    The Graph
                  </Badge>
                ) : trx.source === "infura" ? (
                  <Badge variant="outline" className="border-2 border-gray-400">
                    Infura
                  </Badge>
                ) : (
                  trx.source === "manual" && (
                    <Badge
                      variant="outline"
                      className="border-2 border-yellow-400"
                    >
                      Manual
                    </Badge>
                  )
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Transaction Hash</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => {
                      copyToClipboard(trx.trx_hash);
                      setCopiedTrxHash(true);
                      setTimeout(() => setCopiedTrxHash(false), 2000);
                    }}
                  >
                    {copiedTrxHash ? (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2 text-green-400" />
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-4 w-4 mr-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <a
                  href={`${import.meta.env.VITE_TRX_EXPLORER}${trx.trx_hash}`}
                  target="_blank"
                  className="text-sm text-blue-400 hover:underline"
                >
                  {trx.trx_hash}
                </a>
              </CardContent>
            </Card>
            {parsedMetadata !== null && (
              <Card className="col-span-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Metadata</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => {
                        copyToClipboard(
                          JSON.stringify(parsedMetadata.data, null, 2)
                        );
                        setCopiedMetadata(true);
                        setTimeout(() => setCopiedMetadata(false), 2000);
                      }}
                    >
                      {copiedMetadata ? (
                        <>
                          <CheckIcon className="h-4 w-4 mr-2 text-green-400" />
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-4 w-4 mr-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                    <JsonRenderer data={parsedMetadata} />
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Raw Transaction Data</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => {
                    copyToClipboard(JSON.stringify(newTrx, null, 2));
                    setCopiedRawData(true);
                    setTimeout(() => setCopiedRawData(false), 2000);
                  }}
                >
                  {copiedRawData ? (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2 text-green-400" />
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-4 w-4 mr-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                <JsonRenderer data={newTrx} />
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrxDetails;
