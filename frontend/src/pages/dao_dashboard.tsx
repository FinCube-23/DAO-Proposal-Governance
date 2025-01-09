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
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import contractABI from "../contractABI/contractABI.json";
import { useAccount } from "wagmi";
import { config } from "@layouts/RootLayout";
import { toast } from "sonner";
import WalletAuth from "@components/auth/WalletAuth";

export interface Proposal {
  executed: boolean;
  canceled: boolean;
  proposer: string;
  data: string;
  target: string;
  voteStart: number;
  voteDuration: number;
  yesvotes: number;
  novotes: number;
  proposalURI: string;
}

export default function DaoDashboard() {
  const [registrationData, setRegistrationData] = useState({
    _newMember: "",
    _memberURI: "",
  });
  const [proposalsByPage, setProposalsByPage] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const account = useAccount();

  const handleRegistrationInput = (e: ChangeEvent<HTMLInputElement>) => {
    const form = e.target;
    const name = form.name;
    const value = form.value;
    setRegistrationData({
      ...registrationData,
      _newMember: `${account.address}`,
      [name]: value,
    });
  };

  const getProposalsByPage = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
        functionName: "getProposalsByPage",
        args: [0, 10],
      });

      const result = response[0];

      setProposalsByPage(result as []);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
        functionName: "registerMember",
        args: [registrationData._newMember, registrationData._memberURI],
      });

      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      toast.success("Registration sucessful!");
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

  useEffect(() => {
    getProposalsByPage();
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <WalletAuth></WalletAuth>
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
            Welcome to FinCube DAO! You are a registered member. Through this
            dashboard, you can submit proposals and participate in voting.
            Empower your voice and help shape the future of our decentralized
            community!
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
                <p>
                  {loading
                    ? "Loading proposals..."
                    : `${proposalsByPage.length} Proposal(s) created`}
                </p>
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
          {loading ? (
            <p>Loading proposals...</p>
          ) : (
            proposalsByPage.map((proposal, idx) => {
              const proposer = proposal.proposer;
              if (proposer !== "0x0000000000000000000000000000000000000000") {
                return (
                  <ProposalCard
                    key={idx}
                    proposal={proposal}
                    proposalId={proposal.proposer}
                  />
                );
              }
            })
          )}
        </div>
        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Coins className="text-green-500" />
                </div>
                <div className="flex flex-col">
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
                          <p className="mr-3">Member URI: </p>
                          <input
                            onChange={handleRegistrationInput}
                            type="text"
                            name="_memberURI"
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
