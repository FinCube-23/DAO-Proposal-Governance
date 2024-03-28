// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@openzeppelin/contracts/access/Ownable.sol";

contract FinCubeDAO is Ownable {
    event MemberRegistered(address indexed _newMember, string _memberURI);
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed newMember
    );
    event MemberApproved(address indexed member);
    event ProposalExecuted(uint256 indexed proposalId);
    uint256 private memberCount;
    uint256 private proposalCount;
    struct Member {
        string memberURI;
        bool status;
    }
    //@notice: This is own implementation of Proposal as per OpenZeppelin's governance function
    struct MemberApprovalProposal {
        address proposer;
        uint48 voteStart;
        uint48 voteDuration;
        bool executed;
        bool canceled;
        address newMember;
        uint256 votes;
    }
    struct ProposalVotes {
        mapping(address => bool) hasVoted;
    }
    mapping(address => Member) private members;
    mapping(uint256 => MemberApprovalProposal) private proposals;
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

    /**
     * @notice A new proposal is only made for adding members only, the call data encodes approveMember function.
     * @dev This function can only be called by an existing member.
     * @param _newMember The address of the new member to be approved.
     */
    function newMemberApprovalProposal(
        address _newMember
    ) external onlyMember(msg.sender) {
        uint48 currentTime = uint48(block.timestamp);
        uint48 start = currentTime + uint48(votingDelay());
        uint48 end = start + uint48(votingPeriod());
        proposals[proposalCount] = MemberApprovalProposal({
            proposer: msg.sender,
            voteStart: start,
            voteDuration: end,
            executed: false,
            canceled: false,
            newMember: _newMember,
            votes: 0
        });

        emit ProposalCreated(proposalCount, msg.sender);
        proposalCount++;
    }

    /**
     * @notice Cast vote to proposal. One member can cast one vote per proposal.
     * @dev This function can only be called by an existing member. It also checks if the voting period is active and if the member has not already voted for this proposal.
     * @param _proposalId The ID of the proposal to vote for.
     */
    function castVote(uint256 _proposalId) external onlyMember(msg.sender) {
        ProposalVotes storage votes = proposalVotes[_proposalId];
        MemberApprovalProposal storage proposal = proposals[_proposalId];
        require(
            block.timestamp >= proposal.voteStart &&
                block.timestamp <= proposal.voteDuration,
            "Voting is not allowed at this time"
        );
        require(!votes.hasVoted[msg.sender], "Already voted for this proposal");
        proposal.votes++;
        votes.hasVoted[msg.sender] = true;
    }

    /**
     * @notice Executes a member approval proposal.
     * @dev This function can only be called by the owner. It checks if the voting period is over, if the proposal has not been executed or canceled, and if the proposal has received majority votes. If all conditions are met, it approves the new member and marks the proposal as executed.
     * @param proposalId The ID of the proposal to be executed.
     */
    function executeMemberApprovalProposal(uint256 proposalId) public {
        MemberApprovalProposal memory proposal = proposals[proposalId];
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
        approveMember(proposal.newMember);
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function approveMember(address newMember) private {
        require(!members[newMember].status, "Member already approved");
        members[newMember].status = true;
        memberCount++;
        emit MemberApproved(newMember);
    }

    //@warning: function only defined for testing purposes
    function checkIsMemberApproved(
        address _member
    ) public view onlyMember(msg.sender) returns (bool) {
        return members[_member].status;
    }
}
