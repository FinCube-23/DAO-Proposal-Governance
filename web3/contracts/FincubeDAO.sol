// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FinCubeDAO
 * @notice This contract implements a decentralized autonomous organization (DAO) for managing a community of members and proposals.
 */

contract FinCubeDAO is Ownable {
    event MemberRegistered(address indexed _newMember, string _memberURI);
    event ProposalCreated(
        uint256 indexed proposalId,
        ProposalType indexed proposalType,
        bytes data
    );

    event MemberApproved(address indexed member);
    event ProposalExecuted(uint256 indexed proposalId);
    uint256 private memberCount;
    uint256 private proposalCount;
    /**
     * @dev Represents a member of the DAO.
     * @param memberURI The URI that identifies the member.
     * @param status Whether the member is approved or not.
     */
    struct Member {
        string memberURI;
        bool status;
    }
    /**
     * @dev Represents the different types of proposals that can be created.
     */
    enum ProposalType {
        NewMemberProposal,
        TokenAddressProposal,
        RoyaltyProposal
    }

    /**
     * @dev Represents a proposal within the DAO.
     * @param proposer The address of the member who created the proposal.
     * @param voteStart The timestamp when the voting period starts.
     * @param voteDuration The duration of the voting period in seconds.
     * @param executed Whether the proposal has been executed or not.
     * @param canceled Whether the proposal has been canceled or not.
     * @param data The data associated with the proposal (e.g., new member address, token address).
     * @param yesvotes The number of "yes" votes for the proposal.
     * @param novotes The number of "no" votes for the proposal.
     */
    struct Proposal {
        address proposer;
        uint48 voteStart;
        uint48 voteDuration;
        bool executed;
        bool canceled;
        bytes data;
        uint256 yesvotes;
        uint256 novotes;
    }

    /**
     * @dev Stores the vote information for a proposal.
     * @param isYesVote Mapping of addresses to whether they voted "yes" or not.
     * @param isNoVote Mapping of addresses to whether they voted "no" or not.
     */
    struct ProposalVotes {
        mapping(address => bool) isYesVote;
        mapping(address => bool) isNoVote;
    }
    mapping(address => Member) private members;
    mapping(uint256 => Proposal) private proposals;
    mapping(uint256 => ProposalVotes) private proposalVotes;
    mapping(uint256 => ProposalType) private proposalType;
    address public tokenAddress;

    /**
     * @notice Initializes the contract with the owner as the first member.
     * @param _ownerURI The URI that identifies the owner member.
     */
    constructor(string memory _ownerURI) Ownable(msg.sender) {
        Member memory member;
        member.memberURI = _ownerURI;
        member.status = true;
        members[msg.sender] = member;
        memberCount = 1;
    }

    /**
     * @notice Returns the voting delay period in seconds.
     * @dev This function is marked as `pure` because it does not read or modify the contract's state.
     * @return The voting delay period in seconds (currently 5 seconds).
     */
    function votingDelay() public pure returns (uint256) {
        return 5; // 5 seconds
    }

    /**
     * @notice Returns the voting period duration in seconds.
     * @dev This function is marked as `pure` because it does not read or modify the contract's state.
     * @return The voting period duration in seconds (currently 60 seconds).
     */
    function votingPeriod() public pure returns (uint256) {
        return 60; // 1 minute
    }

    /**
     * @notice Returns the proposal threshold, which is the minimum number of "yes" votes required for a proposal to be executed.
     * @dev The proposal threshold is calculated as (memberCount + 1) / 2.
     * @return The proposal threshold.
     */
    function proposalThreshold() public view returns (uint256) {
        return (memberCount + 1) / 2;
    }
    /**
     * @notice Modifier to ensure that the provided address is not already a member.
     * @param _address The address to be checked.
     */
    modifier isNotExistingMember(address _address) {
        require(
            !(bytes(members[_address].memberURI).length > 0),
            "Already a member"
        );
        _;
    }
    /**
     * @notice Modifier to ensure that the provided address is a valid and approved member.
     * @param _address The address to be checked.
     */
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
    function registerMember(
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
     * @notice Creates a new proposal for approving a new member.
     * @dev This function can only be called by an existing member.
     * @param _newMember The address of the new member to be approved.
     */
    function newMemberApprovalProposal(
        address _newMember
    ) external onlyMember(msg.sender) {
        uint48 currentTime = uint48(block.timestamp);
        uint48 start = currentTime + uint48(votingDelay());
        uint48 end = start + uint48(votingPeriod());
        bytes memory _data = toBytes(_newMember);
        proposals[proposalCount] = Proposal({
            proposer: msg.sender,
            voteStart: start,
            voteDuration: end,
            executed: false,
            canceled: false,
            data: _data,
            yesvotes: 0,
            novotes: 0
        });
        proposalType[proposalCount] = ProposalType.NewMemberProposal;
        emit ProposalCreated(
            proposalCount,
            ProposalType.NewMemberProposal,
            _data
        );
        proposalCount++;
    }
    /**
     * @notice Creates a new proposal for setting a token address.
     * @dev This function can only be called by an existing member.
     * @param _tokenAddress The address of the token to be set.
     */
    function newTokenAddressProposal(
        address _tokenAddress
    ) external onlyMember(msg.sender) {
        uint48 currentTime = uint48(block.timestamp);
        uint48 start = currentTime + uint48(votingDelay());
        uint48 end = start + uint48(votingPeriod());
        bytes memory _data = toBytes(_tokenAddress);
        proposals[proposalCount] = Proposal({
            proposer: msg.sender,
            voteStart: start,
            voteDuration: end,
            executed: false,
            canceled: false,
            data: _data,
            yesvotes: 0,
            novotes: 0
        });
        proposalType[proposalCount] = ProposalType.TokenAddressProposal;
        emit ProposalCreated(
            proposalCount,
            ProposalType.TokenAddressProposal,
            _data
        );
        proposalCount++;
    }

    /**
     * @notice Casts a vote for a proposal.
     * @dev This function can only be called by an existing member. It also checks if the voting period is active and if the member has not already voted for this proposal.
     * @param _proposalId The ID of the proposal to vote for.
     * @param _isYesVote Whether the vote is a "yes" vote (true) or a "no" vote (false).
     */
    function castVote(
        uint256 _proposalId,
        bool _isYesVote
    ) external onlyMember(msg.sender) {
        ProposalVotes storage votes = proposalVotes[_proposalId];
        Proposal storage proposal = proposals[_proposalId];

        require(
            block.timestamp >= proposal.voteStart &&
                block.timestamp <= proposal.voteDuration,
            "Voting is not allowed at this time"
        );
        require(
            !votes.isYesVote[msg.sender] && !votes.isNoVote[msg.sender],
            "Already voted for this proposal"
        );

        if (_isYesVote) {
            proposal.yesvotes++;
            votes.isYesVote[msg.sender] = true;
        } else {
            proposal.novotes++;
            votes.isNoVote[msg.sender] = true;
        }
    }

    /**
     * @notice Executes a proposal if it meets the requirements.
     * @dev This function checks if the voting period has ended, if the proposal has not been executed or canceled, and if the proposal has received enough "yes" votes to meet the proposal threshold. It then executes the proposal based on its type (approving a new member or setting a token address).
     * @param proposalId The ID of the proposal to be executed.
     */
    function executeProposal(uint256 proposalId) public {
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
            proposal.yesvotes >= proposalThreshold(),
            "Proposal doesn't have majority vote"
        );
        if (proposalType[proposalId] == ProposalType.NewMemberProposal) {
            approveMember(bytesToAddress(proposal.data));
            proposal.executed = true;
            emit ProposalExecuted(proposalId);
        } else if (
            proposalType[proposalId] == ProposalType.TokenAddressProposal
        ) {
            setTokenAddress(bytesToAddress(proposal.data));
            proposal.executed = true;
            emit ProposalExecuted(proposalId);
        }
    }

    /**
     * @notice Returns the count of ongoing proposals.
     * @dev This function iterates through the proposals mapping and counts the proposals that have not been executed or canceled and are within the voting period.
     * @return The count of ongoing proposals.
     */

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

    /**
     * @notice Returns an array of ongoing proposals.
     * @dev This function first calls `getOngoingProposalsCount` to get the count of ongoing proposals, then iterates through the proposals mapping and populates an array with the ongoing proposals.
     * @return An array of ongoing proposals.
     */

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
    /**
     * @notice Sets the token address.
     * @dev This function is marked as `private` because it should only be called internally by the `executeProposal` function.
     * @param _tokenAddress The address of the token to be set.
     */

    function setTokenAddress(address _tokenAddress) private {
        tokenAddress = _tokenAddress;
    }
    /**
     * @notice Approves a new member.
     * @dev This function is marked as `private` because it should only be called internally by the `executeProposal` function.
     * @param newMember The address of the new member to be approved.
     */
    function approveMember(address newMember) private {
        require(!members[newMember].status, "Member already approved");
        members[newMember].status = true;
        memberCount++;
        emit MemberApproved(newMember);
    }

    /**
     * @notice Converts a byte array to an address.
     * @dev This function is marked as `private` and `pure` because it does not read or modify the contract's state and is only used internally.
     * @param bys The byte array to be converted.
     * @return addr The address converted from the byte array.
     */
    function bytesToAddress(
        bytes memory bys
    ) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 20))
        }
    }

    /**
     * @notice Converts an address to a byte array.
     * @dev This function is marked as `private` and `pure` because it does not read or modify the contract's state and is only used internally.
     * @param a The address to be converted.
     * @return The byte array representation of the address.
     */
    function toBytes(address a) private pure returns (bytes memory) {
        return abi.encodePacked(a);
    }

    //@warning: function only defined for testing purposes
    /**
     * @notice Checks if a member is approved.
     * @dev This function can only be called by an existing member.
     * @param _member The address of the member to be checked.
     * @return A boolean indicating whether the member is approved or not.
     */
    function checkIsMemberApproved(
        address _member
    ) public view onlyMember(msg.sender) returns (bool) {
        return members[_member].status;
    }
}
