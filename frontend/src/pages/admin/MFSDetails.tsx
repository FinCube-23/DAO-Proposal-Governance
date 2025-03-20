import { useLazyGetMFSQuery } from "@redux/services/mfs";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router";

const MFSDetails = () => {
  const { id } = useParams();
  const [getMFS, { data: mfs, isFetching, error }] = useLazyGetMFSQuery();
  const navigate = useNavigate();

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
                  <Card className="px-1 py-5">
                    <p>
                      <span className="font-medium">Context:</span>{" "}
                      {mfs.context}
                    </p>
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
