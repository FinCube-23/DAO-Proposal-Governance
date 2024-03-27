// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;
import "@openzeppelin/contracts/access/Ownable.sol";

contract FincubeDAO is Ownable {
    event MemberRegistered(address indexed _newMember, string _memberURI);
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed newMember
    );
    event MemberApproved(address indexed member);
    event ProposalExecuted(uint256 indexed proposalId);
    uint256 private memberCount;

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
        address target;
        bytes calldatas;
        uint256 votes;
    }

    mapping(address => Member) private members;
    mapping(uint256 => Proposal) private proposals;
    uint256 private proposalCount;

    constructor(string memory _ownerURI) Ownable(msg.sender) {
        Member memory member;
        member.memberURI = _ownerURI;
        member.status = true;
        members[msg.sender] = member;
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
    function newProposal(
        address _target,
        bytes memory _calldata
    ) external onlyMember(msg.sender) {
        uint48 currentTime = uint48(block.timestamp);
        uint48 start = currentTime + uint48(votingDelay());
        uint48 end = start + uint48(votingPeriod());

        proposals[proposalCount] = Proposal({
            proposer: msg.sender,
            voteStart: start,
            voteDuration: end,
            executed: false,
            canceled: false,
            target: _target,
            calldatas: _calldata,
            votes: 0
        });

        emit ProposalCreated(proposalCount, msg.sender);
        proposalCount++;
    }

    // @notice: a member can cast any number of votes, this has to be fixed
    function castVote(uint256 _proposalId) external onlyMember(msg.sender) {
        Proposal storage proposal = proposals[_proposalId];

        require(
            block.timestamp >= proposal.voteStart &&
                block.timestamp <= proposal.voteDuration,
            "Voting is not allowed at this time"
        );

        proposal.votes++;
    }

    // @dev: Voting functionality, after voting is over, onlyOwner calls this function to execute the proposal
    function executeProposal(uint256 proposalId) public onlyOwner {
        Proposal storage proposal = proposals[proposalId];
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
            proposal.votes >= proposalThreshold(),
            "Proposal doesn't have majority vote"
        );

        (bool success, ) = proposal.target.call(proposal.calldatas);
        require(success, "Execution failed");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function approveMember(address newMember) public onlyOwner {
        require(!members[newMember].status, "Member already approved");
        members[newMember].status = true;
        memberCount++;
        emit MemberApproved(newMember);
    }

    //@warning: function only defined for testing purposes
    function checkIsMemberApproved(
        address _member
    ) public view onlyOwner returns (bool) {
        return members[_member].status;
    }

    //@warning: function only defined for testing purposes

    function getCallData() public view returns (bytes memory) {
        return abi.encodeWithSignature("approveMember(address)", msg.sender);
    }
}
