import { ChangeEvent, FormEvent, useState } from "react";
import contractABI from "../contractABI/contractABI.json";
import { simulateContract, writeContract } from "@wagmi/core";
import { config } from "@layouts/RootLayout";
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

      // backend proposal service call
      const backendData = {
        proposal_onchain_id: 0,
        proposal_type: "membership",
        metadata: data.description,
        proposer_address: `${address}`,
        proposal_executed_by: `${address}`,
        external_proposal: false,
        proposal_status: "pending",
        trx_hash: hash,
        trx_status: 0,
      };

      await createProposal(backendData);
      setTrxHash(hash);

      setDialogOpen(true);
      toast.warning("Proposal is pending");
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
    <div className="mt-5">
      <Card className="pt-5 pb-5 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mt-5 mb-12 text-center">
          General Proposal
        </h1>
        <div className="flex justify-around">
          <form
            onSubmit={propose}
            className="space-y-6 border border-gray-600 p-6 rounded-xl w-1/3 pt-16"
          >
            <div>
              <label className="block text-sm font-medium text-white">
                Targets:
              </label>
              <input
                required
                className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="text"
                value={targets}
                onChange={handleTargetsChange}
                placeholder="Enter target addresses"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Values:
              </label>
              <input
                required
                className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="text"
                value={values}
                onChange={handleValuesChange}
                placeholder="Enter values"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Calldatas:
              </label>
              <input
                required
                className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="text"
                value={calldatas}
                onChange={handleCalldatasChange}
                placeholder="Enter calldata"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Description:
              </label>
              <textarea
                required
                className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter proposal description"
                rows={5} // Adjust rows for the
              />
            </div>
            <div className="text-center">
              <Button type="submit" isLoading={loadingStatus}>
                Place Proposal
              </Button>
            </div>
          </form>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) navigate("/mfs/dao/fincube");
            }}
          >
            <DialogContent>
              <DialogHeader>
                <h2 className="text-lg font-bold text-green-400">
                  Proposal Submitted
                </h2>
              </DialogHeader>
              <p className="text-yellow-400">
                Your proposal has been successfully submitted and is under
                review. To check the transaction status,{" "}
                <a
                  target="_"
                  href={`${import.meta.env.VITE_TRX_EXPLORER}${trxHash}`}
                  className="text-blue-400 underline"
                >
                  click here
                </a>
              </p>
              <DialogFooter>
                <Button
                  className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
                  onClick={() => navigate("/mfs/dao/fincube")}
                >
                  Back to Dashboard
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="sample-data bg-slate-900 border rounded-xl p-20 w-1/2 font-sans shadow-[0_0_15px_4px_rgba(104,0,255,0.8)] h-full mt-20">
            <h1 className="text-2xl text-white font-semibold italic">
              Example Data:
            </h1>
            <div className="border-2 border-gray-600 p-5 rounded-xl shadow-2xl mt-10">
              <div className="data space-y-3">
                <p className="text-blue-500 font-bold italic">
                  Targets:{" "}
                  <span className="text-white">
                    0xAbc123...0001, 0xDef456...0002 etc.
                  </span>
                </p>
                <div className="text-green-500 font-bold italic flex items-center">
                  <div className="group relative mr-1">
                    <Info size={15} className="text-white cursor-pointer" />
                    <span className="pointer-events-none absolute -bottom-2 left-1/2 w-[200px] -translate-x-1/2 translate-y-full text-sm text-white bg-black p-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Values in wei, that should be sent with the transaction.
                      In our case, this will be 0 as all of our voters are
                      equal. If required, Ether can be deposited before-end or
                      passed along when executing the transaction.
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
    </div>
  );
};

export default GeneralProposal;
