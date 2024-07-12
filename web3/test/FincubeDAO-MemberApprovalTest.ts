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

    describe("Contract Deployment", function () {
        it("Should set the owner as the first member", async function () {
            const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

            const isMemberApproved = await finCubeDAO.checkIsMemberApproved(owner.address);
            expect(isMemberApproved).to.be.true;
        });
    });

    describe("Register Member", function () {
        it("Should register a new member", async function () {
            const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            await finCubeDAO.connect(owner).registerMember(addr1.address, "Member URI");
            const isMemberApproved = await finCubeDAO.checkIsMemberApproved(addr1.address);
            expect(isMemberApproved).to.be.false;
        });

        it("Should not register an existing member", async function () {
            const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

            await expect(finCubeDAO.connect(owner).registerMember(owner.address, "Owner URI")).to.be.revertedWith("Already a member");
        });
    });

    describe("New Member Proposal", function () {
        it("Should create a new member proposal", async function () {
            const { finCubeDAO, owner, addr1, addr2 } = await loadFixture(deployFinCubeDAOFixture);

            await finCubeDAO.connect(owner).registerMember(addr1.address, "Member URI");
            await expect(finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address, "Member URI")).to.emit(finCubeDAO, "ProposalAdded");
        });

        it("Should not create a new member proposal if not a member", async function () {
            const { finCubeDAO, addr2, addr1 } = await loadFixture(deployFinCubeDAOFixture);

            await expect(finCubeDAO.connect(addr2).newMemberApprovalProposal(addr1.address, "Member URI")).to.be.reverted;
        });
    });

});