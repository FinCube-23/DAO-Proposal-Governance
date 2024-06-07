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
        await finCubeDAO.setVotingDelay(1); // set delay to 1 second for testing
        await finCubeDAO.setVotingPeriod(30); // set period to 30 seconds for testing

        return { finCubeDAO, owner, addr1, addr2 };
    }

    describe("Voting", function () {
        it("Should allow a member to cast a 'yes' vote on a proposal", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);

            // Check if the 'yes' vote was recorded by verifying the number of 'yes' votes for the proposal
            const ongoingProposals = await finCubeDAO.getOngoingProposals();
            expect(ongoingProposals[0].yesvotes).to.equal(1);
        });

        it("Should allow a member to cast a 'no' vote on a proposal", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Cast a 'no' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, false);

            // Check if the 'no' vote was recorded by verifying the number of 'no' votes for the proposal
            const ongoingProposals = await finCubeDAO.getOngoingProposals();
            expect(ongoingProposals[0].novotes).to.equal(1);
        });

        it("Should not allow a member to cast multiple votes on the same proposal", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(owner).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);

            // Try to cast another vote on the same proposal
            await expect(finCubeDAO.connect(owner).castVote(0, false)).to.be.revertedWith("Already voted for this proposal");
        });

        it("Should not allow voting from non-members", async function () {
            const { finCubeDAO, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Create a new member approval proposal
            await expect(finCubeDAO.connect(addr1).castVote(0, true)).to.be.revertedWith("Not a member");
        });

        it("Should not allow voting outside the voting period", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(owner).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);

            // Wait for the voting period to end
            await time.increase(35000); // Increase time beyond voting period

            // Try to cast a vote after the voting period
            await expect(finCubeDAO.connect(owner).castVote(0, true)).to.be.revertedWith("Voting is not allowed at this time");
        });

        it("Should not allow voting before the voting period", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(owner).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);

            // Try to cast a vote after the voting period
            await expect(finCubeDAO.connect(owner).castVote(0, true)).to.be.revertedWith("Voting is not allowed at this time");
        });

        it("Should not allow a user to execute proposal while voting is still going on", async function () {

            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);
            await new Promise(resolve => setTimeout(resolve, 6000));
            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);
            // Try to Execute the proposal
            await expect(finCubeDAO.executeProposal(0)).to.be.revertedWith("Voting still going on");

        });
        it("Should allow a user to be in the DAO as a new member", async function () {
            this.timeout(190000);
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            // Register addr1 as a new member
            await finCubeDAO.connect(addr1).registerMember(addr1.address, "Member URI");

            // Create a new member approval proposal
            await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address);
            await new Promise(resolve => setTimeout(resolve, 6000));
            // Cast a 'yes' vote on the proposal
            await finCubeDAO.connect(owner).castVote(0, true);
            // Execute the proposal
            await new Promise(resolve => setTimeout(resolve, 65000));
            await finCubeDAO.executeProposal(0);
            // Check if addr1 is now a member
            expect(await finCubeDAO.checkIsMemberApproved(addr1.address)).to.equal(true);
        });

    });
});