import { useMutation } from '@tanstack/react-query';
import { CheckIcon, CopyIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { auditTrailApis } from '@/core/services/audit';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

function TrxDetails() {
  const { id } = useParams();
  const [copiedMetadata, setCopiedMetadata] = useState(false);
  const [copiedRawData, setCopiedRawData] = useState(false);
  const [copiedTrxHash, setCopiedTrxHash] = useState(false);
  const [trx, setTrx] = useState<any>(null);
  const getTransaction = useMutation({
    mutationKey: ['getTransaction', id],
    mutationFn: auditTrailApis.getTransaction,
    onSuccess: (data) => {
      setTrx(data);
    },
    onError: (error) => {
      console.error('Get transaction failed', error);
    },
  });

  useEffect(() => {
    const getTrx = async () => {
      if (id) {
        getTransaction.mutate(id);
      }
    };
    getTrx();
  }, [id]);

  if (getTransaction.isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-sm text-muted-foreground">Loading transaction details...</p>
      </div>
    );
  }
  if (getTransaction.isError) {
    return (
      <div className="text-red-500 text-center p-8">
        Error loading transaction details
      </div>
    );
  }
  if (!trx)
    return <div className="text-center p-8">Transaction not found</div>;

  // Parse metadata
  const parsedMetadata
    = typeof trx.metaData === 'string' ? JSON.parse(trx.metaData) : trx.metaData;

  const newTrx = { ...trx, metaData: parsedMetadata };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const defaultTheme = {
    key: '#9CDCFE', // Keep field names (keys) the same light blue
    string: '#47d147', // Green for strings
    number: '#2563EB', // Dark blue for numbers
    boolean: '#FF6B6B', // Red for booleans
    null: '#569CD6', // Keep original blue for null
    undefined: '#569CD6', // Keep original blue for undefined
    function: '#DCDCAA', // Keep original for functions
    symbol: '#DCDCAA', // Keep original for symbols
    date: '#B5CEA8', // Keep original for dates
    punctuation: '#D4D4D4', //
    text: '#D4D4D4',
  };

  // eslint-disable-next-line react/no-nested-component-definitions
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
      if (value === null)
        return 'null';
      if (Array.isArray(value))
        return 'array';
      if (typeof value === 'object')
        return 'object';
      if (typeof value === 'number')
        return 'number';
      if (typeof value === 'boolean')
        return 'boolean';
      if (typeof value === 'function')
        return 'function';
      if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value))
          return 'date';
        if (/^0x[a-fA-F0-9]+$/.test(value))
          return 'hex';
      }
      return typeof value;
    };

    const renderValue = (value: any) => {
      const type = getValueType(value);

      switch (type) {
        case 'string':
          return (
            <span style={{ color: theme.string }}>{JSON.stringify(value)}</span>
          );
        case 'number':
          return <span style={{ color: theme.number }}>{value}</span>;
        case 'boolean':
          return (
            <span style={{ color: theme.boolean }}>{value.toString()}</span>
          );
        case 'null':
          return <span style={{ color: theme.null }}>null</span>;
        case 'date':
          return (
            <>
              <span style={{ color: theme.string }}>
                {JSON.stringify(value)}
              </span>
              <span style={{ color: theme.text, marginLeft: '8px' }}>
                (
                {new Date(value).toLocaleString()}
                )
              </span>
            </>
          );
        case 'hex':
          return (
            <span style={{ color: theme.string }}>
              {JSON.stringify(value)}
              <span style={{ color: theme.text, marginLeft: '8px' }}>
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

    if (typeof data !== 'object' || data === null) {
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
        <span style={{ color: theme.punctuation }}>{'{'}</span>
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
        <span style={{ color: theme.punctuation }}>{'}'}</span>
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Transaction Details</h1>
        <p className="text-muted-foreground my-3 sm:my-5 text-base sm:text-xl break-all">
          Off-Chain ID:
          {' '}
          {trx.id}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-2 rounded-xl">
          <TabsTrigger className="rounded-xl text-center text-xs sm:text-sm flex-1 sm:flex-initial" value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger className="rounded-xl text-center text-xs sm:text-sm flex-1 sm:flex-initial" value="raw">
            Raw Data
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Transaction Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={trx.trx_status ? 'success' : 'warning'}
                  className="text-xs sm:text-sm"
                >
                  {trx.trx_status ? 'Confirmed' : 'Pending'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm sm:text-base break-words">
                  <span className="font-medium">Created At:</span>
                  {' '}
                  {formatDate(trx.created_at)}
                </p>
                <p className="text-sm sm:text-base break-words">
                  <span className="font-medium">Updated At:</span>
                  {' '}
                  {formatDate(trx.updated_at)}
                </p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {trx.source === 'alchemy'
                  ? (
                      <Badge
                        variant="outline"
                        className="border-2 border-blue-400 text-white text-xs sm:text-sm"
                      >
                        Alchemy
                      </Badge>
                    )
                  : trx.source === 'graph'
                    ? (
                        <Badge
                          variant="outline"
                          className="border-2 border-purple-400 text-white text-xs sm:text-sm"
                        >
                          The Graph
                        </Badge>
                      )
                    : trx.source === 'infura'
                      ? (
                          <Badge variant="outline" className="border-2 border-gray-400 text-xs sm:text-sm">
                            Infura
                          </Badge>
                        )
                      : (
                          trx.source === 'manual' && (
                            <Badge
                              variant="outline"
                              className="border-2 border-yellow-400 text-xs sm:text-sm"
                            >
                              Manual
                            </Badge>
                          )
                        )}
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg min-w-0">Transaction Hash</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary flex-shrink-0"
                    onClick={() => {
                      copyToClipboard(trx.trx_hash);
                      setCopiedTrxHash(true);
                      setTimeout(() => setCopiedTrxHash(false), 2000);
                    }}
                  >
                    {copiedTrxHash
                      ? (
                          <>
                            <CheckIcon className="h-4 w-4 sm:mr-2 text-green-400" />
                            <span className="hidden sm:inline">Copied</span>
                          </>
                        )
                      : (
                          <>
                            <CopyIcon className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="min-w-0">
                <a
                  href={`${import.meta.env.VITE_TRX_EXPLORER}/${trx.trx_hash}`}
                  target="_blank"
                  className="text-xs sm:text-sm text-blue-400 hover:underline break-all"
                >
                  {trx.trx_hash}
                </a>
              </CardContent>
            </Card>
            {parsedMetadata !== null && (
              <Card className="col-span-full">
                <CardHeader>
                  <div className="flex justify-between items-center gap-2">
                    <CardTitle className="text-base sm:text-lg min-w-0">Metadata</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary flex-shrink-0"
                      onClick={() => {
                        copyToClipboard(
                          JSON.stringify(parsedMetadata.data, null, 2),
                        );
                        setCopiedMetadata(true);
                        setTimeout(() => setCopiedMetadata(false), 2000);
                      }}
                    >
                      {copiedMetadata
                        ? (
                            <>
                              <CheckIcon className="h-4 w-4 sm:mr-2 text-green-400" />
                              <span className="hidden sm:inline">Copied</span>
                            </>
                          )
                        : (
                            <>
                              <CopyIcon className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Copy</span>
                            </>
                          )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="min-w-0">
                  <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-auto max-w-full">
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
              <div className="flex justify-between items-center gap-2">
                <CardTitle className="text-base sm:text-lg min-w-0">Raw Transaction Data</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary flex-shrink-0"
                  onClick={() => {
                    copyToClipboard(JSON.stringify(newTrx, null, 2));
                    setCopiedRawData(true);
                    setTimeout(() => setCopiedRawData(false), 2000);
                  }}
                >
                  {copiedRawData
                    ? (
                        <>
                          <CheckIcon className="h-4 w-4 sm:mr-2 text-green-400" />
                          <span className="hidden sm:inline">Copied</span>
                        </>
                      )
                    : (
                        <>
                          <CopyIcon className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="min-w-0">
              <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-auto max-w-full">
                <JsonRenderer data={newTrx} />
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TrxDetails;
