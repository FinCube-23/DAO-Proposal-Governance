import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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
        });

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
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address, "Proposal Description");
            await time.increase(5); // Fast forward time to after voting delay

            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);

            // Cancel the proposal
            await finCubeDAO.connect(owner).cancelProposal(0);

            // Verify if the proposal has been canceled successfully
            const ongoingProposalsCount = await finCubeDAO.getOngoingProposals();
            expect(ongoingProposalsCount.length).to.equal(1);

        });

        it("Should not allow non-proposer to cancel proposal", async function () {
            const { finCubeDAO, owner, addr1, addr2 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address, "Proposal Description");
            await time.increase(5); // Fast forward time to after voting delay

            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);

            // Attempt to cancel the proposal with addr2, which should fail
            await expect(
                finCubeDAO.connect(addr2).cancelProposal(0)
            ).to.be.reverted;

        });
    });

    describe("General Proposal", function () {
        it("Should create and execute a general proposal", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a general proposal
            const targets = ["0x3328358128832A260C76A4141e19E2A943CD4B6D"];
            const values = [0];
            const calldatas = ["0x12"]; //[finCubeDAO.interface.encodeFunctionData("registerMember", [addr1.address, "Member URI"])];
            await finCubeDAO.connect(owner).propose(targets, values, calldatas, "Proposal Description");
            // expect(finCubeDAO.getOngoingProposalsCount()).to.be.equal(1);
            await time.increase(5); // Fast forward time to after voting delay

            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);
            // Execute the proposal
            await time.increase(30); // Fast forward time to after voting period
            await expect(finCubeDAO.connect(owner).executeProposal(0)).to.emit(finCubeDAO, "ProposalExecuted");
        });
    });

    describe("Voting", function () {
        it("Should allow members to cast votes", async function () {
            const { finCubeDAO, owner, addr1, addr2 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 and addr2 as new members
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address, "Proposal Description");
            await time.increase(5); // Fast forward time to after voting delay
            await finCubeDAO.connect(owner).castVote(0, true);
            // Verify votes
            const proposal = await finCubeDAO.getOngoingProposals();
            expect(proposal[0].yesvotes).to.equal(1);
            expect(proposal[0].novotes).to.equal(0);
        });
    });
});
