// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PokemonNFT is ERC721, Ownable {
    uint256 public nextId = 1;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("PokemonNFT", "PKMN") Ownable(msg.sender) {}

    function mint(address to, string memory metadataURI) public onlyOwner {
        uint256 tokenId = nextId;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = metadataURI;
        nextId++;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
}
