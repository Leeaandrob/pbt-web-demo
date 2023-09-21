/**
SPDX-License-Identifier: MIT
*/

pragma solidity ^0.8.20;

import "./PBT.sol";

contract PBTMock is PBT {
    function getTokenChip(
        address chipAddress
    ) public view returns (TokenChip memory) {
        return _tokenChips[chipAddress];
    }
}
