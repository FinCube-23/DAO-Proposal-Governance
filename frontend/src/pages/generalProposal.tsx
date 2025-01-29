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
import { useNavigate } from "react-router";

const GeneralProposal = () => {
  const [targets, setTargets] = useState("");
  const [values, setValues] = useState("");
  const [calldatas, setCalldatas] = useState("");
  const [description, setDescription] = useState("");
  const { address } = useAccount();
  const [createProposal] = useCreateProposalMutation();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const navigate = useNavigate();

  const handleTargetsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTargets(e.target.value);
  };

  const handleValuesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValues(e.target.value);
  };

  const handleCalldatasChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCalldatas(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const propose = async (e: FormEvent<HTMLFormElement>) => {
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

      const response = await createProposal(backendData);
      console.log("Backend response:", response);
      toast.success("General proposal placed successfully!");
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
    <div className="mt-20">
      <Card className="pt-5 pb-10 mx-60 shadow-2xl">
        <Button
          onClick={() => navigate("/mfs/dao/fincube")}
          className="mx-10 font-bold bg-green-400 hover:bg-green-600 text-white"
        >
          Go Back
        </Button>
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
              <input
                required
                className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="text"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter proposal description"
              />
            </div>
            <div className="text-center">
              <Button type="submit" isLoading={loadingStatus}>
                Propose
              </Button>
            </div>
          </form>
          <div className="sample-data bg-slate-900 border rounded-xl p-20 w-1/2 font-sans shadow-[0_0_15px_4px_rgba(104,0,255,0.8)]">
            <h1 className="text-2xl text-white font-semibold italic mb-10">
              Example Data:
            </h1>
            <div className="border-2 border-gray-600 p-5 rounded-xl shadow-2xl mt-16">
              <div className="data space-y-3">
                <p className=" text-blue-500 font-bold italic">
                  Targets:{" "}
                  <span className="text-white">
                    0xAbc123...0001, 0xDef456...0002 etc.
                  </span>
                </p>
                <p className="text-green-500 font-bold italic group relative hover:cursor-auto flex items-center">
                  <div className="mr-1 text-white">
                    <Info size={15}></Info>
                  </div>
                  Values: <span className="text-white">0</span>
                  <span className="tooltip-text absolute text-sm text-white bg-black p-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 w-1/2 left-0 transform translate-x-5 text-justify">
                    Values in wei, that should be sent with the transaction. In
                    our case, this will be 0 as all of our voters are equal. If
                    required, Ether can be deposited before-end or passed along
                    when executing the transaction.
                  </span>
                </p>

                <p className=" text-yellow-500 font-mono italic">
                  Calldata:{" "}
                  <span className="text-white">0xe0a8f6f5000...0001</span>
                </p>
                <p className="text-gray-400 italic  font-bold">
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
