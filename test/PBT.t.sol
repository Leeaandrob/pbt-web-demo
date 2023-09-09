// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/PBTMock.sol";

contract PBTTest is Test {
    event PBTMint(uint256 indexed tokenId, address indexed chipAddress);

    PBTMock public pbt;
    uint256 public blockNumber = 10;
    address public owner = vm.addr(999);
    address public user1 = vm.addr(1);
    uint256 public chip1 = 101;
    address public chipAddress1 = vm.addr(chip1);
    uint256 public chip2 = 102;
    address public chipAddress2 = vm.addr(chip2);
    uint256 public chip3 = 103;
    address public chipAddress3 = vm.addr(chip3);

    function setUp() public {
        pbt = new PBTMock();
        pbt.transferOwnership(owner);
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

    function test_seedChipAddresses() public {
        address[] memory chipAddresses = new address[](3);
        chipAddresses[0] = chipAddress1;
        chipAddresses[1] = chipAddress2;
        chipAddresses[2] = chipAddress3;
        vm.prank(owner);
        pbt.seedChipAddresses(chipAddresses);

        address[] memory seededChipAddresses = new address[](3);
        for (uint256 i = 0; i < chipAddresses.length; ++i) {
            seededChipAddresses[i] = pbt
                .getTokenChip(chipAddresses[i])
                .chipAddress;
        }

        assertEq(chipAddresses, seededChipAddresses);
    }

    function test_mintChip_RevertWhen_chipHasNotBeenSeeded() public {
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

    function test_mintChip_RevertWhen_chipHasBeenMinted() public {
        vm.roll(blockNumber + 10);

        address[] memory chipAddresses = new address[](1);
        chipAddresses[0] = chipAddress1;
        vm.prank(owner); // seed chip as the owner because there's an `onlyOwner` modifier
        pbt.seedChipAddresses(chipAddresses);

        // mint the first chip as user1
        vm.startPrank(user1);
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        pbt.mintChip(signature, blockNumber);

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

    function test_mintChip() public {
        vm.roll(blockNumber + 10);

        address[] memory chipAddresses = new address[](1);
        chipAddresses[0] = chipAddress1;
        vm.prank(owner); // seed chip as the owner because there's an `onlyOwner` modifier
        pbt.seedChipAddresses(chipAddresses);

        // mint the first chip as user1
        vm.startPrank(user1);
        bytes memory payload = abi.encodePacked(user1, blockhash(blockNumber));
        bytes memory signature = _createSignature(payload, chip1);
        pbt.mintChip(signature, blockNumber);
        vm.stopPrank();

        chipAddresses[0] = chipAddress2;
        vm.prank(owner); // seed chip as the owner because there's an `onlyOwner` modifier
        pbt.seedChipAddresses(chipAddresses);

        // increase the block number, attempt to mint the second chip
        vm.roll(blockNumber + 20);
        vm.startPrank(user1);
        bytes memory secondMintPayload = abi.encodePacked(
            user1,
            blockhash(blockNumber + 10)
        );
        bytes memory secondMintSignature = _createSignature(
            secondMintPayload,
            chip2
        );
        vm.expectEmit(true, true, true, true);
        emit PBTMint(2, user1);
        pbt.mintChip(secondMintSignature, blockNumber + 10);
    }
}
