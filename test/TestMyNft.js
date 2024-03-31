const MyNFT = artifacts.require("MyNFT");

contract("MyNFT", accounts => {
  it("should mint an NFT to the first account", async () => {
    const instance = await MyNFT.deployed();
    const receipt = await instance.mintNFT(accounts[0], "https://mytokenlocation.com", 100, { from: accounts[0] });
    
    assert.equal(
      await instance.ownerOf(1),
      accounts[0],
      "The first account should own the minted NFT"
    );
  });

  // Add more tests here
});
