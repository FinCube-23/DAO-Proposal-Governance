import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("FinCubeDAO", function () {
    async function deployFinCubeDAOFixture() {
        const [owner, addr1, addr2] = await hre.ethers.getSigners();

        const FinCubeDAO = await hre.ethers.getContractFactory("FinCubeDAO");
        const finCubeDAO = await FinCubeDAO.deploy("Owner URI");

        return { finCubeDAO, owner, addr1, addr2 };
    }

    describe("newTokenAddressProposal", function () {
        it("should create a new proposal for setting a token address and execute it after voting", async function () {
            const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

            // Create a new proposal for setting a token address
            const newTokenAddress = "0x1234567890123456789012345678901234567890";
            await finCubeDAO.connect(owner).newTokenAddressProposal(newTokenAddress);

            // Vote on the proposal
            const proposalId = 0;
            const votingDelay = await finCubeDAO.votingDelay();
            await hre.ethers.provider.send("evm_increaseTime", [Number(votingDelay) + 1]);
            await finCubeDAO.connect(owner).castVote(proposalId, true); // Owner votes "yes"

            // Execute the proposal

            const votingPeriod = await finCubeDAO.votingPeriod();
            await hre.ethers.provider.send("evm_increaseTime", [Number(votingDelay) + Number(votingPeriod) + 1]); // Fast-forward past the voting period
            await finCubeDAO.connect(owner).executeProposal(proposalId);

            // Check that the token address was set correctly
            const tokenAddress = await finCubeDAO.tokenAddress();
            expect(tokenAddress).to.equal(newTokenAddress);
        });
    });

});