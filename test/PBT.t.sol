// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../contract/PBTMock.sol";
import "openzeppelin/interfaces/IERC721.sol";

contract PBTTest is Test {
    event PBTMint(uint256 indexed tokenId, address indexed chipAddress);
    event PBTChipRemapping(
        uint256 indexed tokenId,
        address indexed oldChipAddress,
        address indexed newChipAddress
    );
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    PBTMock public pbt;
    uint256 public blockNumber = 10;
    address public user1 = vm.addr(1);
    address public user2 = vm.addr(1);
    uint256 public chip1 = 101;
    address public chipAddress1 = vm.addr(chip1);
    uint256 public chip2 = 102;
    address public chipAddress2 = vm.addr(chip2);
    uint256 public chip3 = 103;
    address public chipAddress3 = vm.addr(chip3);

    modifier seedInitialChip() {
        address[] memory chipAddresses = new address[](1);
        chipAddresses[0] = chipAddress1;
        pbt.seedChipAddresses(chipAddresses);
        _;
    }

    function setUp() public {
        pbt = new PBTMock();
    }

    function _createSignature(
        bytes memory payload,
        uint256 chipAddrNum
    ) private pure returns (bytes memory signature) {
        bytes32 payloadHash = keccak256(abi.encodePacked(payload));
        bytes32 signedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", payloadHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(chipAddrNum, signedHash);
        signature = abi.encodePacked(r, s, v);
    }

    function _createSignature(
        bytes32 payload,
        uint256 chipAddrNum
    ) private pure returns (bytes memory signature) {
        return _createSignature(abi.encodePacked(payload), chipAddrNum);
    }

    function test_seedChipAddresses_RevertWhen_ChipHasBeenMinted() public {
        address[] memory chipAddresses = new address[](3);
        chipAddresses[0] = chipAddress1;
        chipAddresses[1] = chipAddress2;
        chipAddresses[2] = chipAddress3;
        pbt.seedChipAddresses(chipAddresses);

        address[] memory seededChipAddresses = new address[](3);
        for (uint256 i = 0; i < chipAddresses.length; ++i) {
            seededChipAddresses[i] = pbt
                .getTokenChip(chipAddresses[i])
                .chipAddress;
        }

        assertEq(chipAddresses, seededChipAddresses);

        vm.roll(blockNumber + 10);

        vm.startPrank(user1);
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(1, user1);
        pbt.mintChip(signature, blockNumber);
        PBT.TokenChip memory tokenChip = pbt.getTokenChip(chipAddress1);
        assertEq(tokenChip.tokenId, 1);

        chipAddresses = new address[](1);
        chipAddresses[0] = chipAddress1;
        vm.expectRevert(ChipHasBeenMinted.selector);
        pbt.seedChipAddresses(chipAddresses);
    }

    function test_seedChipAddresses() public {
        address[] memory chipAddresses = new address[](3);
        chipAddresses[0] = chipAddress1;
        chipAddresses[1] = chipAddress2;
        chipAddresses[2] = chipAddress3;
        pbt.seedChipAddresses(chipAddresses);

        address[] memory seededChipAddresses = new address[](3);
        for (uint256 i = 0; i < chipAddresses.length; ++i) {
            seededChipAddresses[i] = pbt
                .getTokenChip(chipAddresses[i])
                .chipAddress;
        }

        assertEq(chipAddresses, seededChipAddresses);
    }

    function test_updateChipAddresses_RevertWhen_MismatchArrayLength() public {
        address[] memory oldChipAddresses = new address[](3);
        oldChipAddresses[0] = chipAddress1;
        oldChipAddresses[1] = chipAddress2;
        oldChipAddresses[2] = chipAddress3;

        address[] memory newChipAddresses = new address[](2);
        newChipAddresses[0] = vm.addr(1001);
        newChipAddresses[1] = vm.addr(1002);

        vm.expectRevert(MismatchArrayLength.selector);
        pbt.updateChipAddresses(oldChipAddresses, newChipAddresses);
    }

    function test_updateChipAddresses_RevertWhen_ChipHasNotBeenMinted() public {
        address[] memory oldChipAddresses = new address[](3);
        oldChipAddresses[0] = chipAddress1;
        oldChipAddresses[1] = chipAddress2;
        oldChipAddresses[2] = chipAddress3;

        address[] memory newChipAddresses = new address[](3);
        newChipAddresses[0] = vm.addr(1001);
        newChipAddresses[1] = vm.addr(1002);
        newChipAddresses[2] = vm.addr(1003);

        vm.expectRevert(UpdatingChipForUnsetChipMapping.selector);
        pbt.updateChipAddresses(oldChipAddresses, newChipAddresses);
    }

    function test_updateChipAddresses() public {
        vm.roll(blockNumber + 10);
        address[] memory oldChipAddresses = new address[](3);
        oldChipAddresses[0] = chipAddress1;
        oldChipAddresses[1] = chipAddress2;
        oldChipAddresses[2] = chipAddress3;

        address[] memory newChipAddresses = new address[](3);
        newChipAddresses[0] = vm.addr(1001);
        newChipAddresses[1] = vm.addr(1002);
        newChipAddresses[2] = vm.addr(1003);

        pbt.seedChipAddresses(oldChipAddresses);

        vm.startPrank(user1);
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(1, user1);
        pbt.mintChip(signature, blockNumber);
        PBT.TokenChip memory tokenChip = pbt.getTokenChip(chipAddress1);
        assertEq(tokenChip.tokenId, 1);

        payload = abi.encodePacked(user1, blockhash(blockNumber));
        signature = _createSignature(payload, chip2);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(2, user1);
        pbt.mintChip(signature, blockNumber);
        tokenChip = pbt.getTokenChip(chipAddress2);
        assertEq(tokenChip.tokenId, 2);

        payload = abi.encodePacked(user1, blockhash(blockNumber));
        signature = _createSignature(payload, chip3);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(3, user1);
        pbt.mintChip(signature, blockNumber);
        tokenChip = pbt.getTokenChip(chipAddress3);
        assertEq(tokenChip.tokenId, 3);
        vm.stopPrank();

        vm.expectEmit(true, true, true, true);
        emit PBTChipRemapping(1, oldChipAddresses[0], newChipAddresses[0]);
        vm.expectEmit(true, true, true, true);
        emit PBTChipRemapping(2, oldChipAddresses[1], newChipAddresses[1]);
        vm.expectEmit(true, true, true, true);
        emit PBTChipRemapping(3, oldChipAddresses[2], newChipAddresses[2]);
        pbt.updateChipAddresses(oldChipAddresses, newChipAddresses);

        tokenChip = pbt.getTokenChip(oldChipAddresses[0]);
        assertEq(tokenChip.tokenId, 0);
        assertEq(tokenChip.chipAddress, address(0));

        tokenChip = pbt.getTokenChip(oldChipAddresses[1]);
        assertEq(tokenChip.tokenId, 0);
        assertEq(tokenChip.chipAddress, address(0));

        tokenChip = pbt.getTokenChip(oldChipAddresses[2]);
        assertEq(tokenChip.tokenId, 0);
        assertEq(tokenChip.chipAddress, address(0));

        tokenChip = pbt.getTokenChip(newChipAddresses[0]);
        assertEq(tokenChip.tokenId, 1);
        assertEq(tokenChip.chipAddress, newChipAddresses[0]);

        tokenChip = pbt.getTokenChip(newChipAddresses[1]);
        assertEq(tokenChip.tokenId, 2);
        assertEq(tokenChip.chipAddress, newChipAddresses[1]);

        tokenChip = pbt.getTokenChip(newChipAddresses[2]);
        assertEq(tokenChip.tokenId, 3);
        assertEq(tokenChip.chipAddress, newChipAddresses[2]);
    }

    function test_mintChip_RevertWhen_ChipHasNotBeenSeeded() public {
        uint256 addedBlockNumber = blockNumber + 10;
        vm.roll(addedBlockNumber);

        bytes memory payload = abi.encodePacked(
            user1,
            blockhash(addedBlockNumber)
        );
        bytes memory signature = _createSignature(payload, chip1);

        vm.expectRevert(UnauthorizedToMint.selector);
        pbt.mintChip(signature, blockNumber);
    }

    function test_mintChip_RevertWhen_ChipHasBeenMinted()
        public
        seedInitialChip
    {
        vm.roll(blockNumber + 10);

        // mint the first chip as user1
        vm.startPrank(user1);
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(1, user1);
        pbt.mintChip(signature, blockNumber);
        PBT.TokenChip memory tokenChip = pbt.getTokenChip(chipAddress1);
        assertEq(tokenChip.tokenId, 1);

        // increase the block number, attempt to mint the same chip
        vm.roll(blockNumber + 20);
        bytes memory secondMintPayload = abi.encodePacked(
            user1,
            blockhash(blockNumber + 10)
        );
        bytes memory secondMintSignature = _createSignature(
            secondMintPayload,
            chip1
        );
        vm.expectRevert(ChipHasBeenMinted.selector);
        pbt.mintChip(secondMintSignature, blockNumber + 10);
    }

    function test_mintChip() public seedInitialChip {
        vm.roll(blockNumber + 10);

        // mint the first chip as user1
        vm.startPrank(user1);
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(1, user1);
        pbt.mintChip(signature, blockNumber);
        PBT.TokenChip memory tokenChip = pbt.getTokenChip(chipAddress1);
        assertEq(tokenChip.tokenId, 1);
        vm.stopPrank();

        address[] memory chipAddresses = new address[](1);
        chipAddresses[0] = chipAddress2;
        pbt.seedChipAddresses(chipAddresses);

        // increase the block number, attempt to mint the second chip
        vm.roll(blockNumber + 20);
        vm.startPrank(user1);
        payload = abi.encodePacked(user1, blockhash(blockNumber + 10));
        signature = _createSignature(payload, chip2);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(2, user1);
        pbt.mintChip(signature, blockNumber + 10);
        tokenChip = pbt.getTokenChip(chipAddress2);
        assertEq(tokenChip.tokenId, 2);
    }

    function test_transferTokenWithChip(
        bool useSafeTransferFrom
    ) public seedInitialChip {
        vm.roll(blockNumber + 10);

        vm.startPrank(user1);
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(1, user1);
        pbt.mintChip(signature, blockNumber);
        PBT.TokenChip memory tokenChip = pbt.getTokenChip(chipAddress1);
        assertEq(tokenChip.tokenId, 1);
        vm.stopPrank();

        vm.roll(blockNumber + 200); // let's say that the transfer happened after the maximum block window
        payload = abi.encodePacked(user1, blockhash(blockNumber + 150)); // arbitrary number less than maximum block window
        signature = _createSignature(payload, chip1);
        vm.prank(user2);
        vm.expectEmit(true, true, true, true);
        emit Transfer(user1, user2, 1);
        pbt.transferTokenWithChip(
            signature,
            blockNumber + 150,
            useSafeTransferFrom
        );
        assertEq(pbt.ownerOf(1), user2);
    }

    function test_tokenIdFor_RevertWhen_ChipHasNotBeenMinted() public {
        vm.expectRevert(NoMintedTokenId.selector);
        pbt.tokenIdFor(chipAddress1);
    }

    function test_tokenIdFor() public seedInitialChip {
        vm.roll(blockNumber + 10);

        vm.startPrank(user1);
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(1, user1);
        pbt.mintChip(signature, blockNumber);
        PBT.TokenChip memory tokenChip = pbt.getTokenChip(chipAddress1);
        assertEq(tokenChip.tokenId, 1);
        vm.stopPrank();

        uint256 tokenId = pbt.tokenIdFor(chipAddress1);
        assertEq(tokenId, 1);
    }

    function test_isChipSignatureForToken_RevertWhen_ChipHasNotBeenMinted()
        public
    {
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        vm.expectRevert(NoMintedTokenId.selector);
        pbt.isChipSignatureForToken(1, payload, signature); // arbitrary number
    }

    function test_isChipSignatureForToken() public seedInitialChip {
        vm.roll(blockNumber + 10);

        vm.startPrank(user1);
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        vm.expectEmit(true, true, true, true);
        emit PBTMint(1, user1);
        pbt.mintChip(signature, blockNumber);

        bool isChipSignatureForToken = pbt.isChipSignatureForToken(
            1,
            payload,
            signature
        );

        assertEq(isChipSignatureForToken, true);
    }

    function test_supportsInterface() public {
        assertEq(pbt.supportsInterface(type(IPBT).interfaceId), true);
        assertEq(pbt.supportsInterface(type(IERC721).interfaceId), true);
    }
}
