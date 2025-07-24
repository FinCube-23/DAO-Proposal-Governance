import { ChangeEvent, FormEvent, useState } from "react";
import contractABI from "../contractABI/contractABI.json";
import { simulateContract, writeContract } from "@wagmi/core";
import { config } from "../main";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { useCreateProposalMutation } from "@redux/services/proposal";
import { useAccount } from "wagmi";
import { Card } from "@components/ui/card";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@components/ui/dialog";
import { useNavigate } from "react-router";

const GeneralProposal = () => {
  const [targets, setTargets] = useState("");
  const [values, setValues] = useState("");
  const [calldatas, setCalldatas] = useState("");
  const [description, setDescription] = useState("");
  const { address } = useAccount();
  const [createProposal] = useCreateProposalMutation();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trxHash, setTrxHash] = useState("");
  const navigate = useNavigate();

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

  const propose = async (
    e: FormEvent<HTMLFormElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    setLoadingStatus(true);
    const data = {
      targets: [targets],
      values: values.split(",").map(Number),
      calldatas: calldatas.split(",").map(String),
      description,
    };

    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "propose",
        args: [data.targets, data.values, data.calldatas, data.description],
      });

      const hash = await writeContract(config, request);

      const backendData = {
        proposal_type: "general",
        metadata: data.description,
        proposer_address: `0x${address}`,
        trx_hash: hash,
      };

      await createProposal(backendData);
      setTrxHash(hash);

      setDialogOpen(true);
      toast.success("Proposal submitted! Approval is pending.");
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
      toast.error(errorMessage);
    }
    setLoadingStatus(false);
  };

  return (
    <div className="container mx-auto mt-16">
      <Card className="pt-8 pb-8 px-4 md:px-10 shadow-2xl bg-black/90 border border-gray-800 rounded-2xl">
        <h1 className="text-3xl font-bold text-white mb-10 text-center tracking-tight">
          General Proposal
        </h1>
        <div className="flex flex-col md:flex-row gap-10 justify-center">
          {/* Proposal Form */}
          <form
            onSubmit={propose}
            className="space-y-7 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 p-8 rounded-2xl shadow-lg w-full md:w-1/2"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Targets
              </label>
              <input
                required
                className="w-full p-3 bg-black border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                type="text"
                value={targets}
                onChange={handleTargetsChange}
                placeholder="Enter target addresses (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                Values
                <span className="group relative">
                  <Info size={16} className="text-blue-400 cursor-pointer" />
                  <span className="pointer-events-none absolute left-1/2 w-[220px] -translate-x-1/2 translate-y-2 text-xs text-white bg-black p-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    Values in wei, that should be sent with the transaction.
                    Usually 0 for voting proposals.
                  </span>
                </span>
              </label>
              <input
                required
                className="w-full p-3 bg-black border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                type="text"
                value={values}
                onChange={handleValuesChange}
                placeholder="Enter values (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Calldatas
              </label>
              <input
                required
                className="w-full p-3 bg-black border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                type="text"
                value={calldatas}
                onChange={handleCalldatasChange}
                placeholder="Enter calldata (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description
              </label>
              <textarea
                required
                className="w-full p-3 bg-black border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none transition"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter proposal description"
                rows={5}
              />
            </div>
            <div className="flex justify-center">
              <Button
                type="submit"
                isLoading={loadingStatus}
                className="w-full font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Place Proposal
              </Button>
            </div>
          </form>
          {/* Example Data Section */}
          <div className="sample-data bg-slate-900 border border-gray-700 rounded-2xl p-8 w-full md:w-1/2 font-sans shadow-[0_0_15px_4px_rgba(104,0,255,0.2)] h-fit mt-4 md:mt-0">
            <h2 className="text-2xl text-white font-semibold italic mb-4">
              Example Data
            </h2>
            <div className="border-2 border-gray-600 p-5 rounded-xl shadow-2xl mt-4">
              <div className="data space-y-3">
                <p className="text-blue-500 font-bold italic">
                  Targets:{" "}
                  <span className="text-white">
                    0xAbc123...0001, 0xDef456...0002
                  </span>
                </p>
                <div className="text-green-500 font-bold italic flex items-center">
                  <div className="group relative mr-1">
                    <Info size={15} className="text-white cursor-pointer" />
                    <span className="pointer-events-none absolute -bottom-2 left-1/2 w-[200px] -translate-x-1/2 translate-y-full text-sm text-white bg-black p-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Values in wei, that should be sent with the transaction.
                      In most cases, this will be 0.
                    </span>
                  </div>
                  Values: <span className="text-white ml-1">0</span>
                </div>
                <p className="text-yellow-500 font-mono italic">
                  Calldata:{" "}
                  <span className="text-white">0xe0a8f6f5000...0001</span>
                </p>
                <p className="text-gray-400 italic font-bold">
                  <span className="text-purple-400">Description:</span>{" "}
                  Explaining the reason behind placing your proposal
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      {/* Dialog for proposal submission */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) navigate("/organization/dao/fincube");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold text-green-400">
              Proposal Submitted
            </h2>
          </DialogHeader>
          <p className="text-yellow-400 mb-4">
            Your proposal has been successfully submitted and is under review.
            To check the transaction status,{" "}
            <a
              target="_blank"
              href={`${import.meta.env.VITE_TRX_EXPLORER}${trxHash}`}
              className="text-blue-400 underline"
              rel="noopener noreferrer"
            >
              click here
            </a>
          </p>
          <DialogFooter>
            <Button
              className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
              onClick={() => navigate("/organization/dao/fincube")}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneralProposal;
