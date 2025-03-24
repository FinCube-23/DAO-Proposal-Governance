import { useLazyGetMFSQuery } from "@redux/services/mfs";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router";
import { CheckIcon, CopyIcon } from "lucide-react";

const defaultTheme = {
  key: "#9CDCFE",
  string: "#CE9178",
  number: "#B5CEA8",
  boolean: "#569CD6",
  null: "#569CD6",
  undefined: "#569CD6",
  function: "#DCDCAA",
  symbol: "#DCDCAA",
  date: "#B5CEA8",
  punctuation: "#D4D4D4",
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
        return <span style={{ color: theme.boolean }}>{value.toString()}</span>;
      case "null":
        return <span style={{ color: theme.null }}>null</span>;
      case "date":
        return (
          <>
            <span style={{ color: theme.string }}>{JSON.stringify(value)}</span>
            <span style={{ color: theme.text, marginLeft: "8px" }}>
              ({new Date(value).toLocaleString()})
            </span>
          </>
        );
      case "hex":
        return (
          <span style={{ color: theme.string }}>
            {JSON.stringify(value)}
            <span style={{ color: theme.text, marginLeft: "8px" }}>(hex)</span>
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

const MFSDetails = () => {
  const { id } = useParams();
  const [getMFS, { data: mfs, isFetching, error }] = useLazyGetMFSQuery();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMFS = async () => {
      try {
        await getMFS(Number(id));
      } catch (e) {
        console.error(e);
      }
    };
    fetchMFS();
  }, [id, getMFS]);

  if (isFetching) return <div>Loading...</div>;
  if (error) return <div>Error loading MFS details</div>;
  if (!mfs) return <div>MFS not found</div>;

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

  // Parse context
  const parseContext = () => {
    try {
      return typeof mfs.context === "string"
        ? JSON.parse(mfs.context)
        : mfs.context;
    } catch (e) {
      return { error: "Invalid JSON format" };
    }
  };

  const contextData = parseContext();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        Back
      </Button>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{mfs.name}</h1>
              <p className="text-gray-500">
                {mfs.type} • {mfs.location}
              </p>
            </div>
            <Badge variant={mfs.is_approved ? "success" : "warning"}>
              {mfs.is_approved ? "Approved" : "Pending"}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="font-bold">General Information</Label>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">ID:</span> {mfs.id}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {mfs.email}
                  </p>
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-bold">Context:</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => {
                          copyToClipboard(JSON.stringify(contextData, null, 2));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? (
                          <CheckIcon className="h-4 w-4 text-green-400" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                      {contextData.error ? (
                        <span className="text-red-500">{mfs.context}</span>
                      ) : (
                        <JsonRenderer data={contextData} />
                      )}
                    </pre>
                  </Card>
                  <p>
                    <span className="font-medium">Native Currency:</span>{" "}
                    {mfs.native_currency}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="font-bold">Wallet Details</Label>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Wallet Address:</span>{" "}
                    {mfs.wallet_address}
                  </p>
                  <p>
                    <span className="font-medium">Transaction Hash:</span>{" "}
                    <a
                      className="hover:underline text-blue-300"
                      target="_blank"
                      href={`${import.meta.env.VITE_TRX_EXPLORER}${
                        mfs.trx_hash
                      }`}
                    >
                      {mfs.trx_hash}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-bold">On-chain Status</Label>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Membership Status:</span>{" "}
                    <Badge variant="secondary">
                      {mfs.membership_onchain_status}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Proposal ID:</span>{" "}
                    {mfs.proposal_onchain_id || "N/A"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Created At:</span>{" "}
                    {formatDate(mfs.created_at)}
                  </p>
                  <p>
                    <span className="font-medium">Updated At:</span>{" "}
                    {formatDate(mfs.updated_at)}
                  </p>
                </div>
              </div>
              <Separator />
              <Card className="p-5">
                <div>
                  <Label className="font-bold">Associated User</Label>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">User ID:</span>{" "}
                      {mfs.user.id}
                    </p>
                    <p>
                      <span className="font-medium">User Name:</span>{" "}
                      {mfs.user.name}
                    </p>
                    <p>
                      <span className="font-medium">User Email:</span>{" "}
                      {mfs.user.email}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {mfs.certificate && (
            <div className="mt-4">
              <a
                href={mfs.certificate}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Certificate
              </a>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MFSDetails;
