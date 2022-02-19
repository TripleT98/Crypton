require("@nomiclabs/hardhat-web3");
require("dotenv").config();
let {INFURA_API_KEY, RINKEBY_CONTRACT_ADDRESS} = process.env;
console.log(INFURA_API_KEY, RINKEBY_CONTRACT_ADDRESS);
let Web3 = require("web3");
let myContractArtifact = require("./../artifacts/contracts/my_contract.sol/MyContract.json");
let contract_address = "0x7082C653E20B8e4C84bD323a671aAf2EFDCE3846";
let myPublicKey = "0xBc5D326a071AF5729e868F59040218174c3d12c3";
let currentProvider = new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${INFURA_API_KEY}`);
let web3js = new Web3(currentProvider);
let myContract = new web3js.eth.Contract(myContractArtifact["abi"], RINKEBY_CONTRACT_ADDRESS);

async function getAccountBalance(address){
return ethers.utils.formatEther(await ethers.provider.getBalance(address));
}

task("getOwner", "get owner of myContract").setAction(async ()=>{
  try{
    console.log(await myContract.methods.owner().call());
  }catch(e){
    console.log(e.message)
  }
})

task("getContributors", "get Contributors of myContract").setAction(async()=>{
  try{
    console.log(await myContract.methods.getContributors().call());
}catch(e){
  console.log(e.message)
}
})


task("benefit", "send benefits to myContract").addParam("address", "your addres").addParam("value", "value of wei").setAction(async(taskArgs)=>{
  try{
    await myContract.methods.benefit().send({from:taskArgs.address, value:taskArgs.value});
    console.log(`${taskArgs} has been sended to myContract`)
}catch(e){
  console.log(e.message)
}
})


task("getDonations", "get donation value of any contributor").addParam("address", "Contributor's address").setAction(async(taskArgs)=>{
  try{
    console.log(await myContract.methods.getDonationsByContributor(taskArgs.address).call());
}catch(e){
  console.log(e.message)
}
})

task("sendEthers", "send some ethers to any addres").addParam("address", "receiver").addParam("value", "value of wei").setAction(async(taskArgs)=>{
  try{
  await myContract.methods.sendABenefits(taskArgs.address, taskArgs.value).call({from:myPublicKey})
  console.log(`${taskArgs.value} wei has been sended to ${taskArgs.address}`)
}catch(e){
  console.log(e.message)
}
})



  module.exports = {

  };
