import type { ChangeEvent, FormEvent } from "react";
import type { ProposalCreatePayload } from "@/core/services/proposal/types";
import { useMutation } from "@tanstack/react-query";
import { simulateContract, writeContract } from "@wagmi/core";
import { AlertCircle, CheckCircle, Info, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAccount, useChainId } from "wagmi";
import { config } from "@/core/config";
import contractABI from "@/core/contract/contract-abi.json";
import { env } from "@/core/env";
import { proposalApis } from "@/core/services/proposal";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { shortenAddress } from "@/shared/utils";

export default function GeneralProposal() {
  const [targets, setTargets] = useState("");
  const [values, setValues] = useState("");
  const [calldatas, setCalldatas] = useState("");
  const [description, setDescription] = useState("");
  const { address } = useAccount();
  const chainId = useChainId();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trxHash, setTrxHash] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!targets.trim()) {
      newErrors.targets = "Target addresses are required";
    } else if (!targets.match(/^0x[a-fA-F0-9]{40}(,\s*0x[a-fA-F0-9]{40})*$/)) {
      newErrors.targets =
        "Please enter valid Ethereum addresses separated by commas";
    }

    if (!values.trim()) {
      newErrors.values = "Values are required";
    } else if (!values.match(/^\d+(,\s*\d+)*$/)) {
      newErrors.values = "Please enter valid numbers separated by commas";
    }

    if (!calldatas.trim()) {
      newErrors.calldatas = "Calldata is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    if (!address) {
      newErrors.wallet = "Please connect your wallet";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createProposal = useMutation({
    mutationFn: proposalApis.createProposal,
    onSuccess: () => {
      toast.warning("Proposal is pending");
      setDialogOpen(true);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(`Error creating proposal: ${error.message}`);
    },
  });

  const handleTargetsChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTargets(e.target.value);
  };

  const handleValuesChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues(e.target.value);
  };

  const handleCalldatasChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCalldatas(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const propose = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setLoadingStatus(true);
    setErrors({});

    const data = {
      targets: targets.split(",").map((addr) => addr.trim()),
      values: values.split(",").map((val) => Number(val.trim())),
      calldatas: calldatas.split(",").map((data) => data.trim()),
      description,
    };

    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "propose",
        args: [data.targets, data.values, data.calldatas, data.description],
      });

      const hash = await writeContract(config, request);

      // Create context object and stringify it
      const contextData = {
        __typename: "ProposalAdded",
        description: data.description,
        proposalType: "general",
      };

      const backendData: ProposalCreatePayload = {
        proposal_type: "general",
        onChainData: {
          transactionHash: hash,
          signedBy: address || "",
          signedWith: "metamask",
          chainId: chainId.toString(),
          context: contextData,
        },
      };
      createProposal.mutate(backendData);
      setTrxHash(hash);
    } catch (e: any) {
      let errorMessage = e.message;

      if (errorMessage.includes("reverted with the following reason:")) {
        const match = errorMessage.match(
          /reverted with the following reason:\s*(.*)/
        );
        if (match) {
          errorMessage = match[1];
        }
      }
      console.error(e);
      toast.error(errorMessage);
    }
    setLoadingStatus(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">General Proposal</h1>
      </div>

      {errors.wallet && (
        <Alert className="mb-6 border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">
            {errors.wallet}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Send className="h-6 w-6 text-blue-500" />
              Proposal Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={propose} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="targets" className="text-white font-medium">
                  Target Addresses
                  <Badge variant="secondary" className="ml-2">
                    Required
                  </Badge>
                </Label>
                <Input
                  id="targets"
                  value={targets}
                  onChange={handleTargetsChange}
                  placeholder="0xAbc123...0001, 0xDef456...0002"
                  className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.targets
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.targets && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.targets}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="values" className="text-white font-medium">
                  Values (in Wei)
                  <Badge variant="secondary" className="ml-2">
                    Required
                  </Badge>
                </Label>
                <Input
                  id="values"
                  value={values}
                  onChange={handleValuesChange}
                  placeholder="0, 0, 1000000000000000000"
                  className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.values
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.values && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.values}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="calldatas" className="text-white font-medium">
                  Call Data
                  <Badge variant="secondary" className="ml-2">
                    Required
                  </Badge>
                </Label>
                <textarea
                  id="calldatas"
                  value={calldatas}
                  onChange={handleCalldatasChange}
                  placeholder="0xe0a8f6f5000...0001, 0x..."
                  rows={3}
                  className={`w-full bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 resize-none rounded-md px-3 py-2 ${
                    errors.calldatas
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.calldatas && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.calldatas}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-medium">
                  Proposal Description
                  <Badge variant="secondary" className="ml-2">
                    Required
                  </Badge>
                </Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Provide a detailed explanation of your proposal, including the rationale and expected outcomes..."
                  rows={6}
                  className={`w-full bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 resize-none rounded-md px-3 py-2 ${
                    errors.description
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{description.length} characters</span>
                  <span>Minimum 10 characters</span>
                </div>
                {errors.description && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={loadingStatus}
                className="w-full"
                disabled={!address}
              >
                {loadingStatus ? "Placing Proposal..." : "Place Proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Info className="h-6 w-6 text-yellow-500" />
              How to Fill This Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Target Addresses
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  Smart contract addresses that will be called when the proposal
                  executes.
                </p>
                <code className="text-xs bg-gray-800 p-2 rounded block text-green-400">
                  0xA0b86a33E6441E1bf4f0a5dB8c8dc1B8C9F2AC2d
                </code>
              </div>

              <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Values (Wei)
                  <div className="group relative">
                    <Info size={14} className="text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 z-10">
                      Amount of ETH (in wei) to send with each transaction. Use
                      0 for most governance proposals.
                    </div>
                  </div>
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  Amount of ETH to send with transactions (usually 0 for
                  governance).
                </p>
                <code className="text-xs bg-gray-800 p-2 rounded block text-green-400">
                  0, 0, 1000000000000000000
                </code>
              </div>

              <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Call Data
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  Encoded function calls to execute on target contracts.
                </p>
                <code className="text-xs bg-gray-800 p-2 rounded block text-yellow-400 break-all">
                  0xa9059cbb000000000000000000000000...
                </code>
              </div>

              <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-gray-300 text-sm">
                  Clear explanation of what this proposal does and why it should
                  be approved.
                </p>
              </div>
            </div>

            <Alert className="border-blue-500/20 bg-blue-500/10">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>Pro Tip:</strong> Test your proposal parameters on a
                testnet first to ensure they work as expected.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) navigate("/organization/dao/proposals");
        }}
      >
        <DialogContent className="border-gray-700 bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-400 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Proposal Submitted Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              Your general proposal has been successfully submitted to the
              blockchain and is now under review by DAO members.
            </p>
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Transaction Hash:</p>
              <div className="flex items-center gap-2">
                <code className="text-blue-400 text-sm bg-gray-900 p-2 rounded flex-1 break-all">
                  {shortenAddress(trxHash)}
                </code>
                <a
                  href={`${env.VITE_TRX_EXPLORER}/${trxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  >
                    View on Explorer
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => navigate("/organization/dao/proposals")}>
              View All Proposals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
