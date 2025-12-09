// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MeuNovoNFT2 is ERC721URIStorage, Ownable {

    uint256 public nextTokenId = 1;

    constructor() ERC721("MeuNFT", "MNFT") Ownable(msg.sender) {}

    // Agora qualquer pessoa pode mintar
    function mint(address to, string memory metadataURI) public {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
    }
}
