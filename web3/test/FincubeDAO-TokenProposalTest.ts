import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { expect } from "chai";
import { Typed, AddressLike } from "ethers";
import hre from "hardhat";
const { ethers } = require("hardhat");
const {ethers: utilEthers} = require("ethers");
/**
 * Converts any value to a hexadecimal representation.
 * @param {string|number|BigInt|Uint8Array|boolean} value - The value to convert to a hexadecimal string.
 * @returns {string} The hexadecimal representation of the input value.
 */
function hexlify(value:any) {
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
    const finCubeDAO = await FinCubeDAO.deploy("Owner URI");
    return { finCubeDAO, owner, addr1, addr2 };
  }

    describe("New Token Address Proposal", function () {
      let tokenAddressContract: { interface: { encodeFunctionData: (arg0: string, arg1: string[]) => any; }; runner: { address: Typed | AddressLike; }; getToken: () => any; };
      beforeEach(async function(){
        const TokenAddressContract = await ethers.getContractFactory("TokenAddressContract");
        tokenAddressContract = await TokenAddressContract.deploy();
       
      });
      it("should create a new proposal for setting a token address", async function () {
        
        const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);
          
        const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
        // Encode the function call data
        const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));
        
        // Create a new proposal for setting a token address
        await finCubeDAO.connect(owner).newProposal(calldata, tokenAddressContract.runner.address);
        await new Promise(resolve => setTimeout(resolve, 6000));
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
        await finCubeDAO.connect(owner).newProposal(calldata, tokenAddressContract.runner.address);
        await new Promise(resolve => setTimeout(resolve, 6000));
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
        await finCubeDAO.connect(owner).newProposal(calldata, tokenAddressContract.runner.address);
        await new Promise(resolve => setTimeout(resolve, 6000));
        // Cast a 'yes' vote on the proposal
        await finCubeDAO.connect(owner).castVote(0, false);
    
        // Check if the 'yes' vote was recorded by verifying the number of 'yes' votes for the proposal
        const ongoingProposals = await finCubeDAO.getOngoingProposals();
        expect(ongoingProposals[0].novotes).to.equal(1);
      });
 
      it("should create a new proposal for setting a token address and not allow to vote twice", async function () {
        
        const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);
          
        const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
        // Encode the function call data
        const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));
        
        // Create a new proposal for setting a token address
        await finCubeDAO.connect(owner).newProposal(calldata, tokenAddressContract.runner.address);
        await new Promise(resolve => setTimeout(resolve, 6000));
        // Cast a 'yes' vote on the proposal
        await finCubeDAO.connect(owner).castVote(0, false);
        await expect(finCubeDAO.connect(owner).castVote(0, false)).to.be.revertedWith("Already voted for this proposal");
    
      });
      it("should create a new proposal for setting a token address and not allow non members to vote ", async function () {
        
        const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);
          
        const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
        // Encode the function call data
        const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));
        
        // Create a new proposal for setting a token address
        await finCubeDAO.connect(owner).newProposal(calldata, tokenAddressContract.runner.address);
        await new Promise(resolve => setTimeout(resolve, 6000));
        // Cast a 'yes' vote on the proposal
        await expect(finCubeDAO.connect(addr1).castVote(0, true)).to.be.revertedWith("Not a member");
      });
 
      it("should create a new proposal for setting a token address and not allow voting outside time period ", async function () {
        this.timeout(90000);
        const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);
          
        const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
        // Encode the function call data
        const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));
        
        // Create a new proposal for setting a token address
        await finCubeDAO.connect(owner).newProposal(calldata, tokenAddressContract.runner.address);
        await new Promise(resolve => setTimeout(resolve, 70000));
        // Cast a 'yes' vote on the proposal
        await expect(finCubeDAO.connect(owner).castVote(0, true)).to.be.revertedWith("Voting is not allowed at this time");
      });
 
      it("should create a new proposal for setting a token address and not allow voting before time ", async function () {
        
        const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);
          
        const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
        // Encode the function call data
        const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));
        
        // Create a new proposal for setting a token address
        await finCubeDAO.connect(owner).newProposal(calldata, tokenAddressContract.runner.address);
        // Cast a 'yes' vote on the proposal
        await expect(finCubeDAO.connect(owner).castVote(0, true)).to.be.revertedWith("Voting is not allowed at this time");
      });
      it("should create a new proposal for setting a token address and not allow executing while voting is going on ", async function () {
        
        const { finCubeDAO, owner, addr1 } = await loadFixture(deployFinCubeDAOFixture);
          
        const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
        // Encode the function call data
        const calldata = hexlify(tokenAddressContract.interface.encodeFunctionData("set", [token]));
        
        // Create a new proposal for setting a token address
        await finCubeDAO.connect(owner).newProposal(calldata, tokenAddressContract.runner.address);
        // Cast a 'yes' vote on the proposal
        await new Promise(resolve => setTimeout(resolve, 6000));
        // Cast a 'yes' vote on the proposal
        await finCubeDAO.connect(owner).castVote(0, true);
 
        await expect(finCubeDAO.executeProposal(0)).to.be.revertedWith("Voting still going on");
      });

      it("should create a new proposal for setting a token address and execute it after voting", async function () {
        this.timeout(90000);
        const { finCubeDAO, owner } = await loadFixture(deployFinCubeDAOFixture);
        
        
        const token = "0x1234567890123456789012345678901234567890"; // Replace with actual token address
        
        
        // Encode the function call data
        const calldata = tokenAddressContract.interface.encodeFunctionData("set", [token]);
        // const calldata = '0x2801617e0000000000000000000000001234567890123456789012345678901234567890'; // taken from remix and doesnt work either
        
        // Create a new proposal for setting a token address
        await finCubeDAO.connect(owner).newProposal(calldata, tokenAddressContract.runner.address);
       // console.log(tokenAddressContract);
        // Vote on the proposal
        await new Promise(resolve => setTimeout(resolve, 6000));
        // Cast a 'yes' vote on the proposal
        await finCubeDAO.connect(owner).castVote(0, true);
        
        // Execute the proposal
        await new Promise(resolve => setTimeout(resolve, 65000));

        // Check that the token address was set correctly
        // const tokenAddress = await (tokenAddressContract.getToken());
        // console.log(tokenAddress, token);
        await expect(finCubeDAO.connect(owner).executeProposal(0))
        .to.emit(finCubeDAO, "ProposalExecuted")
        .withArgs(0);
      //  expect(tokenAddress).to.equal(token);
      });    

    });
  });

