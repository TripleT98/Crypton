const { expect } = require("chai");
const {ethers} = require("hardhat");


describe("Testing MyContract", async ()=>{



    let MyContract, myContract, owner, address1, address2, address3, contract_address;

    async function modifire(){
      [owner, address1, address2, address3] = await ethers.getSigners();
      MyContract = await ethers.getContractFactory("MyContract");
      myContract = await MyContract.connect(owner).deploy();
      await myContract.deployed();
      contract_address = myContract.address;
    }

    it("Owner is owner", async function(){
      await modifire();
      expect(await myContract.owner()).to.equal(owner.address);
    })

   it("Checking transaction sending", async ()=>{
     await modifire();
     let donation = "1";
     let before = ethers.utils.formatEther(await ethers.provider.getBalance(contract_address));
     await myContract.benefit({value:ethers.utils.parseEther(donation)});
     let after = ethers.utils.formatEther(await ethers.provider.getBalance(contract_address));
     expect(Number(before) + Number(donation)).to.equal(Number(after));
   })

   it("Check contributors donations", async ()=>{
     await modifire();
     let donation1 = "1.0", donation2 = "2.0", donation3 = "3.0";
     await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation1)});
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     expect(ethers.utils.formatEther(await myContract.getDonationsByContributor(address1.address))).to.equal(donation1);
     expect(ethers.utils.formatEther(await myContract.getDonationsByContributor(address2.address))).to.equal(donation2);
     expect(ethers.utils.formatEther(await myContract.getDonationsByContributor(address3.address))).to.equal(donation3);
   })

   it("Checking benefits sending function", async ()=>{
     await modifire();
     let donation2 = "2", donation3 = "3";
     let summ = Number(donation2) + Number(donation3);
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     let before = ethers.utils.formatEther(await address1.getBalance());
     await myContract.connect(owner).sendAllBenefits(address1.address);
     let after = ethers.utils.formatEther(await address1.getBalance());
     expect(Number(after) - Number(before)).to.equal(summ);
   })

});
