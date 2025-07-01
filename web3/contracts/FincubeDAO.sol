// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title FinCubeDAO
 * @notice This contract implements a decentralized autonomous organization (DAO) for managing a community of members and proposals.

 * This contract is a hybrid of EIP-4824 which is considered as Common Interfaces for DAOs (Ref: https://eips.ethereum.org/EIPS/eip-4824) 
 * and OpenZeppelin's Governance (Ref: https://docs.openzeppelin.com/contracts/4.x/api/governance). Though we didn't inherit the OpenZeppelin's 
 * contract to avoid the unnecessary functions. This is a simpler implementation of DAO with the principal functionalities of Governance.
 * @author Sampad Sikder, Mashiat Amin Farin, Md. Antonin Islam, Md. Ariful Islam
 */

contract FinCubeDAO is UUPSUpgradeable, OwnableUpgradeable {
    event MemberRegistered(address indexed _newMember, string _memberURI);

    event ProposalAdded(
        ProposalType indexed proposalType,
        uint256 indexed proposalId,
        bytes data
    );

    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        address[] targets,
        uint256[] values,
        string[] signatures,
        bytes[] calldatas,
        uint256 voteStart,
        uint256 voteEnd,
        string description
    );

    event VoteCast(
        address indexed voter,
        uint256 proposalId,
        uint8 support,
        uint256 weight,
        string reason
    );

    /**
     * @notice Initializes the contract with the owner as the first member.
     * @param _ownerURI The URI that identifies the owner member.
     */

    function initialize(
        string memory _daoURI,
        string memory _ownerURI
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        Member memory member;
        member.memberURI = _ownerURI;
        member.status = true;
        members[msg.sender] = member;
        memberCount = 1;
        daoURI = _daoURI;
    }

    /**
     * @notice Authorize upgrade of new implementation.
     */

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    event MemberApproved(address indexed member);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    uint256 public memberCount;
    uint256 public proposalCount;
    string public daoURI;
    address[] private memberList; /*This function is only added for testing*/

    /** @dev Represents a member of the DAO.
     * @param memberURI The URI that identifies the member.
     * @param status Whether the member is approved or not.
     */
    struct Member {
        bool status;
        string memberURI;
    }
    /**
     * @dev Represents the different types of proposals that can be created.
     */
    enum ProposalType {
        NewMemberProposal,
        GeneralProposal
    }

    /**
     * @dev Represents a proposal within the DAO. We are using single call data to avoid technical complexity
     * and to maintain the core functionality of the DAO understandable for the beginners.
     * @param proposer The address of the member who created the proposal.
     * @param voteStart The timestamp when the voting period starts.
     * @param voteDuration The duration of the voting period in seconds.
     * @param executed Whether the proposal has been executed or not.
     * @param canceled Whether the proposal has been canceled or not.
     * @param data The data associated with the proposal (e.g., new member address, token address).
     * @param yesvotes The number of "yes" votes for the proposal.
     * @param novotes The number of "no" votes for the proposal.
     * @param proposalURI In our case we are considering Proposal URI as proposal description.
     */
    struct Proposal {
        bool executed;
        bool canceled;
        address proposer;
        bytes data;
        address target;
        uint48 voteStart;
        uint48 voteDuration;
        uint256 yesvotes;
        uint256 novotes;
        string proposalURI;
        uint256 proposalId;
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
    uint256 public votingDelay;
    uint256 public votingPeriod;

    /**
     * @notice Sets the delay before voting starts
     * @dev This function can only be called by the owner
     * @param _votingDelay The new delay (in seconds) before voting starts
     */
    function setVotingDelay(uint256 _votingDelay) public onlyOwner {
        votingDelay = _votingDelay;
    }

    /**
     * @notice Sets the duration for which voting is open. Ref: https://www.geeksforgeeks.org/time-units-in-solidity/
     * @dev This function can only be called by the owner
     * @param _votingPeriod The new duration (in seconds) for which voting will be open
     */
    function setVotingPeriod(uint256 _votingPeriod) public onlyOwner {
        votingPeriod = _votingPeriod;
    }

    /**
     * @notice Modifier to ensure that the voting delay has been set.
     * Ref: https://www.geeksforgeeks.org/time-units-in-solidity/
     */
    modifier isVotingDelaySet() {
        require(votingDelay > 0, "Voting delay is not set");
        _;
    }

    /**
     * @notice Modifier to ensure that the voting period has been set.
     */
    modifier isVotingPeriodSet() {
        require(votingPeriod > 0, "Voting period is not set");
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
     * @notice Modifier to ensure that the provided address is already a member.
     * @param _address The address to be checked.
     */
    modifier isExistingMember(address _address) {
        require(
            bytes(members[_address].memberURI).length > 0,
            "Not an existing member"
        );
        _;
    }

    /**
     * @notice Returns the proposal threshold, which is the minimum number of "yes" votes required for a proposal to be executed.
     * @dev The proposal threshold is calculated as (memberCount + 1) / 2.
     * @return threshold The proposal threshold.
     */
    function proposalThreshold() public view returns (uint256 threshold) {
        threshold = (memberCount + 1) / 2;
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
    ) external {
        require(
            !(bytes(members[_newMember].memberURI).length > 0),
            "Already a member"
        );
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
     * @param description In our case we are considering Proposal URI as proposal description.
     */
    function newMemberApprovalProposal(
        address _newMember,
        string memory description
    )
        external
        onlyMember(msg.sender)
        isExistingMember(_newMember)
        isVotingDelaySet
        isVotingPeriodSet
    {
        uint48 currentTime = uint48(block.timestamp);
        uint48 start = currentTime + uint48(votingDelay);
        uint48 end = start + uint48(votingPeriod);
        bytes memory _data = toBytes(_newMember);
        proposals[proposalCount] = Proposal({
            proposer: msg.sender,
            voteStart: start,
            voteDuration: end,
            executed: false,
            canceled: false,
            data: _data,
            target: address(0xdead),
            yesvotes: 0,
            novotes: 0,
            proposalURI: description,
            proposalId: proposalCount
        });
        proposalType[proposalCount] = ProposalType.NewMemberProposal;
        emit ProposalAdded(
            ProposalType.NewMemberProposal,
            proposalCount,
            _data
        );
        unchecked {
            proposalCount++;
        }
    }

    /**
     * @notice Creates a new proposal. This is a generalized proposal which can invoke any public function of any contract using calldata.
     * @dev This function can only be called by an existing member.
     * @param calldatas the calldata of function to be invoked.
     * @param targets the address of contract having the functions
     * @param values in wei, that should be sent with the transaction. In our case this will be 0 as all of our voters are equal. If required Ether can be deposited before-end or passed along when executing the transaction
     * @param description In our case we are considering Proposal URI as proposal description.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    )
        external
        onlyMember(msg.sender)
        isVotingDelaySet
        isVotingPeriodSet
        returns (uint256 proposalId)
    {
        uint48 currentTime = uint48(block.timestamp);
        uint48 start = currentTime + uint48(votingDelay);
        uint48 end = start + uint48(votingPeriod);
        proposalId = proposalCount;
        proposals[proposalCount] = Proposal({
            proposer: msg.sender,
            voteStart: start,
            voteDuration: end,
            executed: false,
            canceled: false,
            data: calldatas[0],
            target: targets[0],
            yesvotes: 0,
            novotes: 0,
            proposalURI: description,
            proposalId: proposalCount
        });
        proposalType[proposalCount] = ProposalType.GeneralProposal;
        emit ProposalAdded(
            ProposalType.GeneralProposal,
            proposalCount,
            calldatas[0]
        );
        string[] memory tempSignatures; // This will be removed after EIP712 is integrated
        emit ProposalCreated(
            proposalCount,
            msg.sender,
            targets,
            values,
            tempSignatures,
            calldatas,
            start,
            end,
            description
        );
        unchecked {
            proposalCount++;
        }
        return proposalId;
    }

    /**
     * @notice Casts a vote for a proposal.
     * @dev This function can only be called by an existing member. It also checks if the voting period is active and if the member has not already voted for this proposal.
     * @param proposalId The ID of the proposal to vote for.
     * @param support Whether the vote is a "yes" vote (true) or a "no" vote (false).
     */

    function castVote(
        uint256 proposalId,
        bool support
    ) external onlyMember(msg.sender) {
        ProposalVotes storage votes = proposalVotes[proposalId];
        Proposal storage proposal = proposals[proposalId];

        require(
            block.timestamp > proposal.voteStart &&
                block.timestamp < proposal.voteDuration,
            "Voting is not allowed at this time"
        );
        require(
            !votes.isYesVote[msg.sender] && !votes.isNoVote[msg.sender],
            "Already voted for this proposal"
        );

        if (support) {
            unchecked {
                proposal.yesvotes++;
            }
            votes.isYesVote[msg.sender] = true;
        } else {
            unchecked {
                proposal.novotes++;
            }
            votes.isNoVote[msg.sender] = true;
        }
        emit VoteCast(
            msg.sender,
            proposalId,
            support ? 1 : 0,
            0,
            proposal.proposalURI
        );
    }

    /**
     * @notice Executes a proposal if it meets the requirements.
     * @dev This function checks if the voting period has ended, if the proposal has not been executed or canceled, and if the proposal has received enough "yes" votes to meet the proposal threshold. It then executes the proposal based on its type (approving a new member or setting a token address).
     * @param proposalId The ID of the proposal to be executed.
     */
    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(
            !(block.timestamp > proposal.voteStart &&
                block.timestamp < proposal.voteDuration),
            "Voting still going on"
        );
        require(
            !proposal.executed && !proposal.canceled,
            "Proposal already executed or canceled"
        );
        require(
            proposal.yesvotes > proposalThreshold() - 1,
            "Proposal doesn't have majority vote"
        );
        if (proposalType[proposalId] == ProposalType.NewMemberProposal) {
            approveMember(bytesToAddress(proposal.data));
            proposal.executed = true;
            emit ProposalExecuted(proposalId);
        } else if (proposalType[proposalId] == ProposalType.GeneralProposal) {
            (bool success, ) = proposal.target.call(proposal.data);
            if (!success) {
                revert("Proposal execution failed");
            }
            proposal.executed = true;
            emit ProposalExecuted(proposalId);
        }
    }

    /**
     * @notice Retrieves a specific proposal by its ID.
     * @param proposalId The ID of the proposal to retrieve.
     * @return proposal The Proposal struct corresponding to the given ID.
     * @dev Will revert if the proposal ID is invalid.
     */
    function getProposalsById(
        uint256 proposalId
    ) public view returns (Proposal memory proposal) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        return proposals[proposalId];
    }

    /**
     * @notice Returns an array of ongoing proposals.
     * @dev This function first calls `getOngoingProposalsCount` to get the count of ongoing proposals, then iterates through the proposals mapping and populates an array with the ongoing proposals.
     * @return An array of ongoing proposals.
     */

    function getOngoingProposals() public view returns (Proposal[] memory) {
        uint256 ongoingCount = proposalCount;
        Proposal[] memory ongoingProposals = new Proposal[](ongoingCount);
        uint256 currentTimestamp = block.timestamp; // Cache block.timestamp
        uint256 index = 0;
        for (uint256 i; i < proposalCount; ) {
            if (
                !proposals[i].executed &&
                !proposals[i].canceled &&
                currentTimestamp > proposals[i].voteStart &&
                currentTimestamp < proposals[i].voteDuration
            ) {
                ongoingProposals[index] = proposals[i];
                unchecked {
                    index++;
                }
            }
            unchecked {
                ++i;
            }
        }

        return ongoingProposals;
    }

    /**
     * @notice Retrieves a paginated list of proposals
     * @param cursor The starting index for pagination
     * @param howMany The number of proposals to retrieve
     * @return paginateProposals An array of Proposal structs
     * @return newCursor The updated cursor position for the next page
     * @dev This function allows for efficient pagination of proposals
     */

    function getProposalsByPage(
        uint256 cursor,
        uint256 howMany
    )
        public
        view
        returns (Proposal[] memory paginateProposals, uint256 newCursor)
    {
        paginateProposals = new Proposal[](howMany);

        uint256 length = howMany;
        if (length > paginateProposals.length - cursor) {
            length = paginateProposals.length - cursor;
        }

        for (uint256 i; i < length; ) {
            // Map to array
            paginateProposals[i] = proposals[cursor + i];
            unchecked {
                ++i;
            }
        }

        return (paginateProposals, cursor + length);
    }

    /**
     * @notice Retrieves proposals by their type
     * @dev This function can only be called by an approved member
     * @param proposalTypeFilter The type of proposals to filter (0 for NewMemberProposal, 1 for GeneralProposal)
     * @return proposalsByType An array of Proposal structs filtered by the specified type
     */

    function getProposalsByType(
        ProposalType proposalTypeFilter
    )
        public
        view
        onlyMember(msg.sender)
        returns (Proposal[] memory proposalsByType)
    {
        uint256 count;

        for (uint256 i = 0; i < proposalCount; i++) {
            if (proposalType[i] == proposalTypeFilter) {
                count++;
            }
        }
        proposalsByType = new Proposal[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < proposalCount; i++) {
            if (proposalType[i] == proposalTypeFilter) {
                proposalsByType[index] = proposals[i];
                index++;
            }
        }
    }

    /**
     * @notice Cancels a proposal that has not been executed or canceled yet.
     * @param proposalId The ID of the proposal to be canceled.
     * @dev Only the proposer of the proposal can call this function.
     * @dev The proposal must not have been executed or canceled before.
     */
    function cancelProposal(uint256 proposalId) public onlyMember(msg.sender) {
        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.proposer == msg.sender,
            "No permission to cancel proposal"
        );
        require(
            !proposal.executed && !proposal.canceled,
            "Proposal already executed or canceled"
        );
        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }

    /**
     * @notice Approves a new member.
     * @dev This function is marked as `private` because it should only be called internally by the `executeProposal` function.
     * @param newMember The address of the new member to be approved.
     */
    function approveMember(address newMember) private {
        require(!members[newMember].status, "Member already approved");
        members[newMember].status = true;
        unchecked {
            memberCount++;
        }
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

    /**
     * @notice Delete all members except the contract owner
     * @dev This function can only be called by the contract owner
     * @notice This function deletes all user data except the owner
     * @notice This function is only for testing
     */
    function resetMembers() external onlyOwner {
        uint256 tempMemberCount = memberList.length;
        for (uint256 i = tempMemberCount; i > 0; i--) {
            address memberAddress = memberList[i - 1];
            if (memberAddress != owner()) {
                members[memberAddress].status = false;
                delete members[memberAddress];
                memberList.pop();
            }
        }
        memberCount = 1;
    }
}
