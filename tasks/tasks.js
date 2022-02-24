require("@nomiclabs/hardhat-web3");
require("dotenv").config();
let Web3 = require("web3");
let myContractArtifact = require("./../artifacts/contracts/my_contract.sol/MyContract.json");
let {INFURA_API_KEY, RINKEBY_CONTRACT_ADDRESS, META_MASK_PROVIDER_URL, PUBLIC_KEY, PRIVATE_KEY} = process.env;
let currentProvider = new Web3.providers.HttpProvider(`${META_MASK_PROVIDER_URL}`);
let web3js = new Web3(currentProvider);
let myContract = new web3js.eth.Contract(myContractArtifact["abi"], RINKEBY_CONTRACT_ADDRESS);

async function getSign(obj){
  return await web3js.eth.accounts.signTransaction({
    to:obj.to,
    value: web3js.utils.toWei(obj.value || "0", "wei") || null,
    gasLimit: Number(obj.gasLimit),
    data: obj.data
  }, obj.privateKey)
}

async function getContractBalance(address){
  return await web3js.eth.getBalance(address);
}

task("getOwner", "get owner of myContract").setAction(async (args, hre)=>{
  try{
    await myContract.methods.owner().call().then(console.log);
  }catch(e){
    console.log(e.message)
  }
})

task("getContributors", "get Contributors of myContract").setAction(async(args, hre)=>{
  try{
     console.log(await myContract.methods.getContributors().call());
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

task("benefit", "send benefits to myContract").addParam("privatekey", "Enter your privat key to sign the transaction").addParam("value", "value of wei").addParam("gaslimit", "Enter gas limit value, it has to be more than 21064").setAction(async(taskArgs, hre)=>{
  try{
    if(Number(taskArgs.gas_limit) < 21064){throw new Error("Not enought gas")};
    let data = await myContract.methods.benefit().encodeABI();
    let sign = await getSign({data,privateKey:taskArgs.privatekey, gasLimit:taskArgs.gaslimit, value:taskArgs.value, to:RINKEBY_CONTRACT_ADDRESS});
    let createreceipt = await web3js.eth.sendSignedTransaction(sign.rawTransaction);
    console.log(`${taskArgs.value} wei has been sended to contract (${RINKEBY_CONTRACT_ADDRESS}) from your address(${taskArgs.privatekey})`);
  }catch(e){
    console.log(e.message)
  }
})

//test address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

task("sendEthers", "send some ethers to any address").addParam("address", "receiver").addParam("gaslimit", "Enter gas limit value, it has to be more than 21064").addParam("value", "value of wei").addParam("privatekey", "Contract owner's private key").setAction(async(taskArgs)=>{
  try{
    if(taskArgs.privatekey != PRIVATE_KEY){throw new Error(`${taskArgs.privatekey} is not myContract owner's private key! Enter a owner's private key if you want this transaction successful!`)};
    let {gaslimit, address, value, privatekey} = taskArgs;
    let data = await myContract.methods.sendABenefits(address, value).encodeABI();
    let sign = await getSign({data, privateKey:privatekey, gasLimit:gaslimit, to:RINKEBY_CONTRACT_ADDRESS});
    let signedTrans = await web3js.eth.sendSignedTransaction(sign.rawTransaction);
    console.log(`${taskArgs.value} wei has been sended to ${taskArgs.address}. Transaction hash: ${signedTrans.transactionHash}`)
  }catch(e){
    console.log(e.message)
  }
})

task("sendAllBenefits", "send all benefits to any address").addParam("address", "receiver").addParam("privatekey", "Contract owner's private key").addParam("gaslimit", "Enter gas limit value, it has to be more than 21064").setAction(async(taskArgs)=>{
   try{
     if(taskArgs.privatekey != PRIVATE_KEY){throw new Error(`${taskArgs.privatekey} is not myContract owner's private key! Enter a owner's private key if you want this transaction successful!`)};
     let {privatekey, gaslimit, address} = taskArgs;
     let data = await myContract.methods.sendAllBenefits(address).encodeABI();
     let sign = await getSign({privateKey: privatekey, data, gasLimit: gaslimit, to:RINKEBY_CONTRACT_ADDRESS});
     console.log(sign.rawTransaction);
     let signedTrans = await web3js.eth.sendSignedTransaction(sign.rawTransaction);
     console.log(`All ethers from contract (${RINKEBY_CONTRACT_ADDRESS}) has been sended to address ${address}`)
   }catch(e){
     console.log(e.message)
   }
})

module.exports = {

};
