import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Typed, AddressLike } from "ethers";
import hre from "hardhat";
const { ethers } = require("hardhat");
const { ethers: utilEthers } = require("ethers");
import { ethers, upgrades } from "hardhat";

/**
 * Converts any value to a hexadecimal representation.
 * @param {string|number|BigInt|Uint8Array|boolean} value - The value to convert to a hexadecimal string.
 * @returns {string} The hexadecimal representation of the input value.
 */
function hexlify(value: any) {
  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? '0x01' : '0x00';
  }

  // Handle numeric values
  if (typeof value === 'number' || typeof value === 'bigint') {
    const hexString = value.toString(16);
    return '0x' + hexString.padStart(hexString.length % 2 === 0 ? hexString.length : hexString.length + 1, '0');
  }

  // Handle string values
  if (typeof value === 'string') {
    let hexString = '';
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      hexString += charCode.toString(16).padStart(2, '0');
    }
    return '0x' + hexString;
  }

  // Handle Uint8Array values
  if (value instanceof Uint8Array) {
    let hexString = '';
    for (let i = 0; i < value.length; i++) {
      hexString += value[i].toString(16).padStart(2, '0');
    }
    return '0x' + hexString;
  }

  // Unsupported type
  throw new Error('Unsupported type for hexlify');
}

describe("FinCubeDAO", function () {
  async function deployFinCubeDAOFixture() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();

    const FinCubeDAO = await hre.ethers.getContractFactory("FinCubeDAO");
    const finCubeDAO = await upgrades.deployProxy(FinCubeDAO, ['DAO URI', 'Owner URI'], {
      initializer: 'initialize',
      kind: 'uups'
    });

    await finCubeDAO.setVotingDelay(1); // set delay to 1 second for testing
    await finCubeDAO.setVotingPeriod(30); // set period to 30 seconds for testing
    return { finCubeDAO, owner, addr1, addr2 };
  }

  describe("New Token Address Proposal", function () {
    let tokenAddressContract: { interface: { encodeFunctionData: (arg0: string, arg1: string[]) => any; }; runner: { address: Typed | AddressLike; }; getToken: () => any; };

    beforeEach(async function () {
      const TokenAddressContract = await ethers.getContractFactory("TokenAddressContract");
      tokenAddressContract = await TokenAddressContract.deploy();
    });

    it("should create a new proposal for setting a token address", async function () {
      const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

      const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
      // Encode the function call data
      const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));

      // Create a new proposal for setting a token address
      await finCubeDAO.connect(owner).propose([tokenAddressContract.runner.address], [0], [calldata], "Set token address proposal");
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Cast a 'yes' vote on the proposal
      await finCubeDAO.connect(owner).castVote(0, true);

      // Check if the 'yes' vote was recorded by verifying the number of 'yes' votes for the proposal
      const ongoingProposals = await finCubeDAO.getOngoingProposalsCount();
      expect(ongoingProposals).to.equal(1);
    });

    it("should create a new proposal for setting a token address and vote yes", async function () {
      const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

      const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
      // Encode the function call data
      const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));

      // Create a new proposal for setting a token address
      await finCubeDAO.connect(owner).propose([tokenAddressContract.runner.address], [0], [calldata], "Set token address proposal");
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Cast a 'yes' vote on the proposal
      await finCubeDAO.connect(owner).castVote(0, true);

      // Check if the 'yes' vote was recorded by verifying the number of 'yes' votes for the proposal
      const ongoingProposals = await finCubeDAO.getOngoingProposals();
      expect(ongoingProposals[0].yesvotes).to.equal(1);
    });

    it("should create a new proposal for setting a token address and vote no", async function () {
      const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

      const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
      // Encode the function call data
      const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));

      // Create a new proposal for setting a token address
      await finCubeDAO.connect(owner).propose([tokenAddressContract.runner.address], [0], [calldata], "Set token address proposal");
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Cast a 'no' vote on the proposal
      await finCubeDAO.connect(owner).castVote(0, false);

      // Check if the 'no' vote was recorded by verifying the number of 'no' votes for the proposal
      const ongoingProposals = await finCubeDAO.getOngoingProposals();
      expect(ongoingProposals[0].novotes).to.equal(1);
    });

    it("should create a new proposal for setting a token address and not allow to vote twice", async function () {
      const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

      const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
      // Encode the function call data
      const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));

      // Create a new proposal for setting a token address
      await finCubeDAO.connect(owner).propose([tokenAddressContract.runner.address], [0], [calldata], "Set token address proposal");
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Cast a 'no' vote on the proposal
      await finCubeDAO.connect(owner).castVote(0, false);
      await expect(finCubeDAO.connect(owner).castVote(0, false)).to.be.revertedWith("Already voted for this proposal");
    });

    it("should create a new proposal for setting a token address and not allow non-members to vote", async function () {
      const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);

      const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
      // Encode the function call data
      const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));

      // Create a new proposal for setting a token address
      await finCubeDAO.connect(owner).propose([tokenAddressContract.runner.address], [0], [calldata], "Set token address proposal");
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Attempt to cast a 'yes' vote on the proposal by a non-member
      await expect(finCubeDAO.connect(addr1).castVote(0, true)).to.be.revertedWith("Not a member");
    });

    it("should create a new proposal for setting a token address and not allow voting outside the time period", async function () {
      this.timeout(90000);
      const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

      const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
      // Encode the function call data
      const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));

      // Create a new proposal for setting a token address
      await finCubeDAO.connect(owner).propose([tokenAddressContract.runner.address], [0], [calldata], "Set token address proposal");
      await new Promise(resolve => setTimeout(resolve, 35000));
      // Attempt to cast a 'yes' vote on the proposal after the voting period
      await expect(finCubeDAO.connect(owner).castVote(0, true)).to.be.revertedWith("Voting is not allowed at this time");
    });

    it("should create a new proposal for setting a token address and not allow voting before the time period", async function () {
      const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

      const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
      // Encode the function call data
      const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));

      // Create a new proposal for setting a token address
      await finCubeDAO.connect(owner).propose([tokenAddressContract.runner.address], [0], [calldata], "Set token address proposal");
      // Attempt to cast a 'yes' vote on the proposal before the voting period
      await expect(finCubeDAO.connect(owner).castVote(0, true)).to.be.revertedWith("Voting is not allowed at this time");
    });

    it("should create a new proposal for setting a token address and not allow executing while voting is ongoing", async function () {
      const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

      const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
      // Encode the function call data
      const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));

      // Create a new proposal for setting a token address
      await finCubeDAO.connect(owner).propose([tokenAddressContract.runner.address], [0], [calldata], "Set token address proposal");
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Cast a 'yes' vote on the proposal
      await finCubeDAO.connect(owner).castVote(0, true);

      // Attempt to execute the proposal while voting is still ongoing
      await expect(finCubeDAO.executeProposal(0)).to.be.revertedWith("Voting still going on");
    });

    it("should create a new proposal for setting a token address and execute it after voting", async function () {
      this.timeout(90000);
      const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);

      const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
      // Encode the function call data
      const calldata = tokenAddressContract.interface.encodeFunctionData("set", [token]);

      // Create a new proposal for setting a token address
      await finCubeDAO.connect(owner).propose([tokenAddressContract.runner.address], [0], [calldata], "Set token address proposal");
      // Vote on the proposal
      await new Promise(resolve => setTimeout(resolve, 6000));
      // Cast a 'yes' vote on the proposal
      await finCubeDAO.connect(owner).castVote(0, true);

      // Execute the proposal after the voting period
      await new Promise(resolve => setTimeout(resolve, 35000));

      await expect(finCubeDAO.connect(owner).executeProposal(0))
        .to.emit(finCubeDAO, "ProposalExecuted")
        .withArgs(0);
    });
  });
});
