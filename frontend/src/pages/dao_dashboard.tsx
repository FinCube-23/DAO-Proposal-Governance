import ProposalCard from "@components/dao/ProposalCard";
import { Button } from "@components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@components/ui/card";
import { Proposal } from "@services/proposal/types";
import { Box, Coins, Flag, Vote, WalletCards } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@layouts/MfsLayout";
import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const proposals: Proposal[] = [
  {
    title: "Renovation Project",
    description: "Renovating the community center",
    status: "ongoing",
    address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
  },
  {
    title: "Education Program",
    description: "Funding educational workshops",
    status: "executed",
    address: "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
  },
  {
    title: "Park Cleanup",
    description: "Organizing a community park cleanup event",
    status: "canceled",
    address: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4",
  },
];

export default function DaoDashboard() {
  const [data, setData] = useState({ address: "", uri: "" });
  const navigate = useNavigate();

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const form = e.target;
    const name = form.name;
    const value = form.value;
    setData({
      ...data,
      [name]: value,
    });
  };

  // registerMember()
  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // try {
    //   const { request } = await simulateContract(config, {
    //     abi: [], // Fill
    //     address: "0x", // Fill
    //     functionName: "registerMember",
    //     args: [""], // pass arguments
    //   });

    //   const hash = await writeContract(config, request);

    //   await waitForTransactionReceipt(config, { hash });

    //   alert("Registration successful");
    // } catch (e) {
    //   console.log(e);
    // }
    console.log(data);
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">DAO Title Dashboard</CardTitle>
          <CardDescription>
            <a
              href="#"
              className="text-sm text-green-500 cursor-pointer hover:underline"
            ></a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Fugiat,
            corrupti fuga! Laudantium vero libero ipsa possimus quos a provident
            sunt cupiditate neque, ipsam totam facere temporibus nihil.
            Sapiente, praesentium magni!
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex gap-3 text-sm">
            <div className="flex gap-1">
              <Flag className="text-green-500" /> December 2023
            </div>
            <div className="flex gap-1">
              <Box className="text-green-500" />
              Polygon
            </div>
            <div className="flex gap-1">
              <WalletCards className="text-green-500" />
              Wallet-based
            </div>
          </div>
        </CardFooter>
      </Card>
      <div className="flex flex-col-reverse md:grid md:grid-cols-12 gap-5">
        <div className="md:col-span-7 flex flex-col gap-5">
          <Card>
            <div className="flex justify-between items-center p-3">
              <div className="flex items-center gap-3">
                <Vote className="text-green-500" />
                <p>12 Proposal(s) created</p>{" "}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>New Proposal</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Proposal Type
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center">
                    <Button
                      onClick={() => navigate("/general-proposal")}
                      className="my-2 w-60 hover:bg-green-400"
                    >
                      General Proposal
                    </Button>
                    <Button
                      onClick={() => navigate("/approval-proposal")}
                      className="my-2 w-60 hover:bg-orange-400"
                    >
                      New Member Approval Proposal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
          {/* Proposal List */}
          {proposals.map((proposal: Proposal, idx: number) => (
            <ProposalCard key={idx} proposal={proposal} />
          ))}
        </div>
        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Coins className="text-green-500" />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>New Member</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Register Member
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={register}>
                      <div className="flex items-center my-3">
                        <p className="mr-3">Address: </p>
                        <input
                          onChange={handleInput}
                          type="text"
                          name="address"
                          className="px-2 py-1 rounded bg-black border border-white"
                          placeholder="wallet address"
                        />
                      </div>
                      <div className="flex items-center my-3">
                        <p className="mr-3">Member URI: </p>
                        <input
                          onChange={handleInput}
                          type="text"
                          name="uri"
                          className="px-2 py-1 rounded bg-black border border-white"
                          placeholder="URI"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Register</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">$10,000</div>
              <div className="text-muted-foreground">Treasury value</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
