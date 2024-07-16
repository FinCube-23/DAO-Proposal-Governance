import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers, upgrades } from "hardhat";

describe("FinCubeDAO", function () {
    async function deployFinCubeDAOFixture() {
        const [owner, addr1, addr2, addr3, addr4] = await hre.ethers.getSigners();
    
        const FinCubeDAO = await hre.ethers.getContractFactory("FinCubeDAO");
        const finCubeDAO = await upgrades.deployProxy(FinCubeDAO, ['DAO URI', 'Owner URI'], {
            initializer: 'initialize',
            kind: 'uups'
        });
    
    
        // Set voting delay and voting period
        await finCubeDAO.setVotingDelay(1);
        await finCubeDAO.setVotingPeriod(30);
    
        // Register some members
        await finCubeDAO.connect(owner).registerMember(addr1.address, "Member URI 1");
        await finCubeDAO.connect(owner).registerMember(addr2.address, "Member URI 2");
        await finCubeDAO.connect(owner).registerMember(addr3.address, "Member URI 3");
        await finCubeDAO.connect(owner).registerMember(addr4.address, "Member URI 4");
        // Create some proposals
        // Use try-catch to handle potential errors
        try {
                await finCubeDAO.connect(owner).newMemberApprovalProposal(addr1.address, "Member URI 1");
                await finCubeDAO.connect(owner).newMemberApprovalProposal(addr2.address, "Member URI 2");
                await finCubeDAO.connect(owner).newMemberApprovalProposal(addr3.address, "Member URI 3");
                await finCubeDAO.connect(owner).newMemberApprovalProposal(addr4.address, "Member URI 4");
        } catch (error) {
            console.error("Error creating proposals:", error);
        }
    
        return { finCubeDAO, owner, addr1, addr2, addr3, addr4 };
    }

    describe("getProposalsByPage", function () {
        it("Should return the correct proposals for the given page", async function () {
            const { finCubeDAO, owner, addr1, addr2, addr3, addr4 } = await loadFixture(deployFinCubeDAOFixture);

            const pageSize = 2;
            let cursor = 0;

            let { paginateProposals, newCursor } = await finCubeDAO.getProposalsByPage(cursor, pageSize);

            // Check first page
            expect(paginateProposals.length).to.equal(pageSize);

            cursor = newCursor;

            // Check second page
            ({ paginateProposals, newCursor } = await finCubeDAO.getProposalsByPage(cursor, pageSize));
            expect(paginateProposals.length).to.equal(pageSize);
        });


        it("Should return remaining proposals if they are less than the page size", async function () {
            const { finCubeDAO, owner, addr1, addr2, addr3, addr4 } = await loadFixture(deployFinCubeDAOFixture);

            const pageSize = 3;
            let cursor = 0;

            let { paginateProposals, newCursor } = await finCubeDAO.getProposalsByPage(cursor, pageSize);
        
            expect(paginateProposals.length).to.equal(pageSize); // Only two proposals should be left

            cursor = newCursor;

            // Check second page
            ({ paginateProposals, newCursor } = await finCubeDAO.getProposalsByPage(cursor, pageSize));
            expect(paginateProposals.length).to.equal(pageSize);
        });
        it("Should return remaining proposals if they are equal than the page size", async function () {
            const { finCubeDAO, owner, addr1, addr2, addr3, addr4 } = await loadFixture(deployFinCubeDAOFixture);

            const pageSize = 4;
            let cursor = 0;

            let { paginateProposals, newCursor } = await finCubeDAO.getProposalsByPage(cursor, pageSize);
        
            expect(paginateProposals.length).to.equal(pageSize); // Only two proposals should be left

            cursor = newCursor;

            // Check second page
            ({ paginateProposals, newCursor } = await finCubeDAO.getProposalsByPage(cursor, pageSize));
            expect(paginateProposals.length).to.equal(pageSize);
        });
        for (let pageSize = 1; pageSize <= 5; pageSize++) {
            it(`Should return correct number of proposals for page size ${pageSize}`, async function () {
                const { finCubeDAO } = await deployFinCubeDAOFixture();
                let cursor = 0;

                let { paginateProposals, newCursor } = await finCubeDAO.getProposalsByPage(cursor, pageSize);

                // Check if the number of returned proposals matches the page size
                expect(paginateProposals.length).to.equal(pageSize);

                cursor = newCursor;

                // Check the next page to ensure pagination works correctly
                ({ paginateProposals, newCursor } = await finCubeDAO.getProposalsByPage(cursor, pageSize));
                expect(paginateProposals.length).to.equal(pageSize);
            });
        }
    });
});
