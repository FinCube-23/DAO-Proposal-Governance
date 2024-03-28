// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@openzeppelin/contracts/access/Ownable.sol";
contract FinCubeDAO is Ownable {
 
   event MemberRegistered(address indexed _newMember, string _memberURI);
   event ProposalCreated(
       uint256 indexed proposalId,
       address indexed newMember
   );
   event TokenAddressProposalCreated(uint256 indexed proposalId, address indexed proposer, address tokenAddress);
   event MemberApproved(address indexed member);
   event ProposalExecuted(uint256 indexed proposalId);
   uint256 private memberCount;
   uint256 private proposalCount;
   struct Member {
       string memberURI;
       bool status;
   }
   //@notice: This is own implementation of Proposal as per OpenZeppelin's governance function
   struct Proposal {
       address proposer;
       uint48 voteStart;
       uint48 voteDuration;
       bool executed;
       bool canceled;
       address newMember;
       uint256 yesvotes;
       uint256 novotes;
   }
   struct ProposalVotes {
       mapping(address => bool) isYesVote;
       mapping(address => bool) isNoVote;
   }
   struct TokenAddressProposal {
    address proposer;
    uint48 voteStart;
    uint48 voteDuration;
    bool executed;
    bool canceled;
    address tokenAddress;
    uint256 yesvotes;
    uint256 novotes;
}
mapping(uint256 => TokenAddressProposal) private tokenAddressProposals;
   mapping(address => Member) private members;
   mapping(uint256 => Proposal) private proposals;
   mapping(uint256 => ProposalVotes) private proposalVotes;
 
 
   constructor(string memory _ownerURI) Ownable(msg.sender) {
       Member memory member;
       member.memberURI = _ownerURI;
       member.status = true;
       members[msg.sender] = member;
       memberCount = 1;
   }
   function votingDelay() public pure returns (uint256) {
       return 5; // 5 seconds
   }
   function votingPeriod() public pure returns (uint256) {
       return 60; // 1 minute
   }
   function proposalThreshold() public view returns (uint256) {
       return memberCount / 2;
   }
   modifier isNotExistingMember(address _address) {
       require(
           !(bytes(members[_address].memberURI).length > 0),
           "Already a member"
       );
       _;
   }
   modifier onlyMember(address _address) {
       require(
           (bytes(members[_address].memberURI).length > 0),
           "Not a member"
       );
       require(members[_address].status == true, "Member not approved");
       _;
   }
 
   /**
* @notice Register a new member.
* @dev This function can only be called by non-existing members.
* @param _newMember The address of the new member to be registered.
* @param _memberURI The URI of the new member.
*/
   function register(
       address _newMember,
       string memory _memberURI
   ) external isNotExistingMember(_newMember) {
       Member memory member;
       member.memberURI = _memberURI;
       member.status = false;
       members[_newMember] = member;
       emit MemberRegistered(_newMember, _memberURI);
   }
   //@notice: new proposal is only made for adding members only, the call data encodes approveMember function
   function newProposal(address _newMember) external onlyMember(msg.sender) {
       uint48 currentTime = uint48(block.timestamp);
       uint48 start = currentTime + uint48(votingDelay());
       uint48 end = start + uint48(votingPeriod());
       proposals[proposalCount] = Proposal({
           proposer: msg.sender,
           voteStart: start,
           voteDuration: end,
           executed: false,
           canceled: false,
           newMember: _newMember,
           yesvotes: 0,
           novotes: 0
       });
       
       emit ProposalCreated(proposalCount, msg.sender);
       proposalCount++;
   }
   // @notice: Cast vote to proposal. One member can cast one vote per proposal
   function castVote(uint256 _proposalId, bool _isYesVote) external onlyMember(msg.sender) {
       ProposalVotes storage votes = proposalVotes[_proposalId];
       Proposal storage proposal = proposals[_proposalId];
       
       require(block.timestamp >= proposal.voteStart && block.timestamp <= proposal.voteDuration, "Voting is not allowed at this time");
       require(!votes.isYesVote[msg.sender] && !votes.isNoVote[msg.sender], "Already voted for this proposal");
  
        if (_isYesVote) {
            proposal.yesvotes++;
            votes.isYesVote[msg.sender] = true;
        } else {
            proposal.novotes++;
            votes.isNoVote[msg.sender] = true;
        }
   }
   // @dev: Voting functionality, after voting is over, onlyOwner calls this function to execute the proposal
   function executeProposal(uint256 proposalId) public onlyOwner {
       Proposal memory proposal = proposals[proposalId];
       require(
           !(block.timestamp >= proposal.voteStart &&
               block.timestamp <= proposal.voteDuration),
           "Voting still going on"
       );
       require(
           !proposal.executed && !proposal.canceled,
           "Proposal already executed or canceled"
       );
       require(
           proposal.yesvotes <= proposalThreshold(),
           "Proposal doesn't have majority vote"
       );
       approveMember(proposal.newMember);
       proposal.executed = true;
       emit ProposalExecuted(proposalId);
   }
 
   
   function approveMember(address newMember) private  {
       require(!members[newMember].status, "Member already approved");
       members[newMember].status = true;
       memberCount++;
       emit MemberApproved(newMember);
   }


   function newTokenAddressProposal(address _tokenAddress) external onlyMember(msg.sender) {
    uint48 currentTime = uint48(block.timestamp);
    uint48 start = currentTime + uint48(votingDelay());
    uint48 end = start + uint48(votingPeriod());
    uint256 newProposalId = proposalCount;
    tokenAddressProposals[newProposalId] = TokenAddressProposal({
        proposer: msg.sender,
        voteStart: start,
        voteDuration: end,
        executed: false,
        canceled: false,
        tokenAddress: _tokenAddress,
        yesvotes: 0,
        novotes: 0
    });
    
    emit TokenAddressProposalCreated(newProposalId, msg.sender, _tokenAddress);
    proposalCount++;
}
function executeTokenAddressProposal(uint256 proposalId) public onlyOwner {
    TokenAddressProposal storage proposal = tokenAddressProposals[proposalId];
    require(
        !(block.timestamp >= proposal.voteStart &&
            block.timestamp <= proposal.voteDuration),
        "Voting still going on"
    );
    require(
        !proposal.executed && !proposal.canceled,
        "Proposal already executed or canceled"
    );
    require(
        proposal.yesvotes <= proposalThreshold(),
        "Proposal doesn't have majority vote"
    );
    setTokenAddress(proposal.tokenAddress);
    proposal.executed = true;
    emit ProposalExecuted(proposalId);
}
address public tokenAddress;

function setTokenAddress(address _tokenAddress) private {
    tokenAddress = _tokenAddress;
}

     function getOngoingProposalsCount() public view returns (uint256) {
    uint256 ongoingCount = 0;
    for (uint256 i = 0; i < proposalCount; i++) {
        if (
            !proposals[i].executed &&
            !proposals[i].canceled &&
            block.timestamp >= proposals[i].voteStart &&
            block.timestamp <= proposals[i].voteDuration
        ) {
            ongoingCount++;
        }
    }
    return ongoingCount;
}
 
    function getOngoingProposals() public view returns (Proposal[] memory) {
    uint256 ongoingCount = getOngoingProposalsCount();
    Proposal[] memory ongoingProposals = new Proposal[](ongoingCount);
 
    uint256 index = 0;
    for (uint256 i = 0; i < proposalCount; i++) {
        if (
            !proposals[i].executed &&
            !proposals[i].canceled &&
            block.timestamp >= proposals[i].voteStart &&
            block.timestamp <= proposals[i].voteDuration
        ) {
            ongoingProposals[index] = proposals[i];
            index++;
        }
    }
 
    return ongoingProposals;
}
 
   //@warning: function only defined for testing purposes
   function checkIsMemberApproved(
       address _member
   ) public view onlyMember(msg.sender) returns (bool) {
       return members[_member].status;
   }
 
}