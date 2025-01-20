import { ChangeEvent, FormEvent, useState } from "react";
import contractABI from "../contractABI/contractABI.json";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { useCreateProposalMutation } from "@redux/services/proposal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { useAccount } from "wagmi";
import { Info } from "lucide-react";
import { Card } from "@components/ui/card";

const GeneralProposal = () => {
  const [targets, setTargets] = useState("");
  const [values, setValues] = useState("");
  const [calldatas, setCalldatas] = useState("");
  const [description, setDescription] = useState("");
  const { address } = useAccount();
  const [createProposal] = useCreateProposalMutation();

  const handleTargetsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTargets(e.target.value);
  };

  const dummyData = {
    targets: ["0xAbc123...0001", "0xDef456...0002"],
    values: [100, 200],
    calldatas:
      "0xe0a8f6f50000000000000000000000000000000000000000000000000000000000000001",
    description: "This is a sample transaction description",
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

    const data = {
      targets: [targets],
      values: values.split(",").map(Number),
      calldatas: calldatas.split(",").map(String),
      description,
    };

    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
        functionName: "propose",
        args: [data.targets, data.values, data.calldatas, data.description],
      });

      const hash = await writeContract(config, request);

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

      // check for transaction status

      // backend proposal service call
      await createProposal(backendData);

      await waitForTransactionReceipt(config, { hash });

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
  };

  return (
    <div className="mt-20">
      <Card className="pt-10 pb-20 mx-60">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          General Proposal
        </h1>
        <div className="flex justify-around">
          <form
            onSubmit={propose}
            className="space-y-6 border border-gray-600 p-6 rounded w-1/3"
          >
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    title="view sample data"
                  >
                    <Info />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sample Input Data</DialogTitle>
                    <DialogDescription>
                      Hover to see the sample transaction details below.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Container with controlled overflow */}
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <pre className="text-xs whitespace-pre-wrap break-words">
                      {JSON.stringify(dummyData, null, 2)}
                    </pre>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
              <Button type="submit">Propose</Button>
            </div>
          </form>
          <div className="sample-data bg-slate-900 border rounded-xl p-20 w-1/2 font-sans">
            <h1 className="text-3xl text-white font-semibold italic mb-10">
              Example Data:
            </h1>
            <div className="data space-y-3">
              <p className="text-xl text-blue-500 font-bold italic">
                Targets:{" "}
                <span className="text-white">
                  0xAbc123...0001, 0xDef456...0002 etc.
                </span>
              </p>
              <p className="text-xl text-green-500 font-bold italic">
                Values: <span className="text-white">0, 1, 2</span>
              </p>
              <p className="text-xl text-yellow-500 font-mono italic">
                Calldata: 0xe0a8f6f5000...0001
              </p>
              <p className="text-gray-400 italic text-xl font-bold">
                Description: Explaining the reason behind placing your proposal
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GeneralProposal;
