const { expect } = require("chai");
const {ethers} = require("hardhat");


describe("Testing MyContract", async ()=>{



    let MyContract, myContract, owner, address1, address2, address3, contract_address;

    async function modifier(){
      [owner, address1, address2, address3] = await ethers.getSigners();
      MyContract = await ethers.getContractFactory("MyContract");
      myContract = await MyContract.connect(owner).deploy();
      await myContract.deployed();
      contract_address = myContract.address;
    }

       async function getAccountBalance(address){
       return ethers.utils.formatEther(await ethers.provider.getBalance(address));
     }

    it("Owner is owner", async function(){
      await modifier();
      expect(await myContract.owner()).to.equal(owner.address);
    })

   it("Checking transaction sending", async ()=>{
     await modifier();
     let donation = "1";
     let before = await getAccountBalance(contract_address);
     await myContract.benefit({value:ethers.utils.parseEther(donation)});
     let after = await getAccountBalance(contract_address);
     expect(Number(before) + Number(donation)).to.equal(Number(after));
   })

   it("Check contributors donations", async ()=>{
     await modifier();
     let donation1 = "1.0", donation2 = "2.0", donation3 = "3.0";
     await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation1)});
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     expect(ethers.utils.formatEther(await myContract.getDonationsByContributor(address1.address))).to.equal(donation1);
     expect(ethers.utils.formatEther(await myContract.getDonationsByContributor(address2.address))).to.equal(donation2);
     expect(ethers.utils.formatEther(await myContract.getDonationsByContributor(address3.address))).to.equal(donation3);
   })

   it("Checking benefits sending function", async ()=>{
     await modifier();
     let donation2 = "2", donation3 = "3";
     let summ = Number(donation2) + Number(donation3);
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     let before = ethers.utils.formatEther(await address1.getBalance());
     await myContract.connect(owner).sendAllBenefits(address1.address);
     let after = ethers.utils.formatEther(await address1.getBalance());
     expect(Number(after) - Number(before)).to.equal(summ);
   })

   it("Owner could send any value of ether to any address", async ()=>{
     await modifier();
     let before = await getAccountBalance(contract_address);
     let donation2 = "2", donation3 = "3", value = "3000000000000000000";
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     let pay = await myContract.connect(owner).sendABenefits(address1.address, value);
     let after = await getAccountBalance(contract_address);
     let substr = Number(donation2) + Number(donation3) - Number(value.slice(0,1));
     expect(after).to.equal(substr + ".0");
   })

   it("Get all contributos", async ()=>{
     await modifier();
     let donation1 = "1.0", donation2 = "2.0", donation3 = "3.0";
     await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation1)});
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     let contributors = await myContract.getContributors();
     expect(contributors).to.deep.equal([address1.address,address2.address,address3.address])
   })

 it("Should drop error message if owner tries to send more ether than smart contract has", async ()=>{
   await modifier();
   let donation1 = "1.0", donation2 = "2.0", value = "4000000000000000000", err_mess = "Not enough ethers to send";
   await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation1)});
   await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
   await expect(myContract.connect(owner).sendABenefits(address3.address, value)).to.be.revertedWith(err_mess);
 })

it("Should drop error message if somebody except owner tryes to send some ethers from contract", async ()=>{
  await modifier();
  let err_mess = "You are not owner!";
  await expect(myContract.connect(address1).sendABenefits(address3.address, "1")).to.be.revertedWith(err_mess);
})

});
