import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers, upgrades } from "hardhat";


describe("FinCubeDAO", function () {
    async function deployFinCubeDAOFixture() {

        const [owner, addr1, addr2] = await hre.ethers.getSigners();

        const FinCubeDAO = await hre.ethers.getContractFactory("FinCubeDAO");
        const finCubeDAO = await upgrades.deployProxy(FinCubeDAO, ['DAO URI', 'Owner URI'], {
            initializer: 'initialize',
            kind: 'uups'
        })

        // Set voting delay and voting period
        await finCubeDAO.setVotingDelay(1); // set delay to 1 second for testing
        await finCubeDAO.setVotingPeriod(30); // set period to 30 seconds for testing

        return { finCubeDAO, owner, addr1, addr2 };
    }
    describe("Cancel Proposal", function () {
        it("Should allow proposer to cancel proposal", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);

            await finCubeDAO.connect(owner).cancelProposal(0);

            // Verify if the proposal has been canceled successfully
            const ongoingProposals = await finCubeDAO.getOngoingProposalsCount();
            expect(ongoingProposals).to.equal(0);
        });
        it("Should not allow anyone else to cancel proposal", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);
            await expect(finCubeDAO.connect(addr1).cancelProposal(0)).to.be.reverted;

        });

        it("Should not allow to cancel proposal if already canceled", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);

            await finCubeDAO.connect(owner).cancelProposal(0);
            await expect(finCubeDAO.connect(owner).cancelProposal(0)).to.be.revertedWith("Proposal already executed or canceled");

        });


        it("Should not allow proposal to be cancelled if already executed", async function () {
            this.timeout(190000);
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);
            // Execute the proposal
            await new Promise(resolve => setTimeout(resolve, 35000));
            await finCubeDAO.executeProposal(0);
            // Check if addr1 is now a member
            await finCubeDAO.checkIsMemberApproved(addr1.address);
            await expect(finCubeDAO.connect(owner).cancelProposal(0)).to.be.revertedWith("Proposal already executed or canceled");

        });
    });
});