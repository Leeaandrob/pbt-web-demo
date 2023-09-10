/**
SPDX-License-Identifier: MIT
*/

pragma solidity ^0.8.20;

import {Ownable} from "openzeppelin/access/Ownable.sol";
import {ECDSA} from "openzeppelin/utils/cryptography/ECDSA.sol";
import {ERC721A} from "erc721a/ERC721A.sol";
import {IPBT} from "pbt/IPBT.sol";

error NoMintedTokenId();
error InvalidBlockNumber();
error BlockNumberTooOld();
error ChipHasBeenMinted();
error UnauthorizedToMint();
error MismatchArrayLength();
error UpdatingChipForUnsetChipMapping();

contract PBT is ERC721A, IPBT, Ownable {
    using ECDSA for bytes32;

    struct TokenChip {
        address chipAddress;
        uint256 tokenId;
    }

    mapping(address => TokenChip) _tokenChips;

    constructor() ERC721A("PBT", "PBT") {}

    function tokenIdFor(
        address chipAddress
    ) external view override returns (uint256) {
        uint256 tokenId = _tokenChips[chipAddress].tokenId;
        if (tokenId == 0) revert NoMintedTokenId();

        return tokenId;
    }

    function isChipSignatureForToken(
        uint256 tokenId,
        bytes calldata payload,
        bytes calldata signature
    ) external view override returns (bool) {
        if (!_exists(tokenId)) revert NoMintedTokenId();

        bytes32 signedHash = keccak256(payload).toEthSignedMessageHash();
        address chipAddress = signedHash.recover(signature);

        return _tokenChips[chipAddress].tokenId == tokenId;
    }

    function transferTokenWithChip(
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig,
        bool useSafeTransferFrom
    ) public override {
        _transferTokenWithChip(
            signatureFromChip,
            blockNumberUsedInSig,
            useSafeTransferFrom
        );
    }

    function transferTokenWithChip(
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig
    ) external override {
        transferTokenWithChip(signatureFromChip, blockNumberUsedInSig, false);
    }

    function mintChip(
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig
    ) external {
        address chipAddress = _getChipAddress(
            signatureFromChip,
            blockNumberUsedInSig
        );
        TokenChip storage tokenChip = _tokenChips[chipAddress];

        if (tokenChip.tokenId == 0 && tokenChip.chipAddress == address(0))
            revert UnauthorizedToMint();
        if (tokenChip.tokenId != 0) revert ChipHasBeenMinted();

        _tokenChips[chipAddress].tokenId = _nextTokenId();
        _mint(msg.sender, 1);
        emit PBTMint(_nextTokenId() - 1, msg.sender);
    }

    function seedChipAddresses(
        address[] memory chipAddresses
    ) external onlyOwner {
        for (uint256 i = 0; i < chipAddresses.length; ) {
            address chipAddress = chipAddresses[i];
            _tokenChips[chipAddress] = TokenChip({
                chipAddress: chipAddress,
                tokenId: 0
            });

            unchecked {
                i++;
            }
        }
    }

    function updateChipAddresses(
        address[] memory oldChipAddresses,
        address[] memory newChipAddresses
    ) external onlyOwner {
        if (oldChipAddresses.length != newChipAddresses.length)
            revert MismatchArrayLength();

        for (uint256 i = 0; i < oldChipAddresses.length; ) {
            address oldChipAddress = oldChipAddresses[i];
            TokenChip memory tokenChip = _tokenChips[oldChipAddress];
            uint256 tokenId = tokenChip.tokenId;

            if (tokenId == 0) revert UpdatingChipForUnsetChipMapping();
            address newChipAddress = newChipAddresses[i];
            _tokenChips[newChipAddress] = TokenChip({
                chipAddress: newChipAddress,
                tokenId: tokenId
            });
            emit PBTChipRemapping(tokenId, oldChipAddress, newChipAddress);
            delete _tokenChips[oldChipAddress];

            unchecked {
                i++;
            }
        }
    }

    function _transferTokenWithChip(
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig,
        bool useSafeTransferFrom
    ) internal {
        address chipAddress = _getChipAddress(
            signatureFromChip,
            blockNumberUsedInSig
        );
        uint256 tokenId = _tokenChips[chipAddress].tokenId;

        if (tokenId == 0) revert NoMintedTokenId();

        if (useSafeTransferFrom) {
            safeTransferFrom(ownerOf(tokenId), msg.sender, tokenId);
        } else {
            transferFrom(ownerOf(tokenId), msg.sender, tokenId);
        }
    }

    function _getChipAddress(
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig
    ) internal view returns (address) {
        if (block.number <= blockNumberUsedInSig) {
            revert InvalidBlockNumber();
        }

        if (
            block.number - blockNumberUsedInSig > getMaxBlockhashValidWindow()
        ) {
            revert BlockNumberTooOld();
        }

        bytes32 blockHash = blockhash(blockNumberUsedInSig);
        bytes32 signedHash = keccak256(abi.encodePacked(msg.sender, blockHash))
            .toEthSignedMessageHash();

        return signedHash.recover(signatureFromChip);
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function getMaxBlockhashValidWindow()
        public
        pure
        virtual
        returns (uint256)
    {
        return 100;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721A) returns (bool) {
        return
            ERC721A.supportsInterface(interfaceId) ||
            interfaceId == type(IPBT).interfaceId;
    }
}
