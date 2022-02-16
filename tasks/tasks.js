require("@nomiclabs/hardhat-web3");
let {INFURA_API_KEY, RINKEBY_CONTRACT_ADDRESS} = require?.("./../keys.js");
let Web3 = require("web3");
let myContractArtifact = require("./../artifacts/contracts/my_contract.sol/MyContract.json");
let contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let currentProvider = new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${INFURA_API_KEY}`)
let web3js = new Web3(currentProvider);
let myContract = new web3js.eth.Contract(myContractArtifact["abi"], RINKEBY_CONTRACT_ADDRESS);

async function getAccountBalance(address){
return ethers.utils.formatEther(await ethers.provider.getBalance(address));
}

task("getOwner", "get owner of myContract").setAction(async ()=>{
  let a = await myContract.methods.owner();
  console.log(a._parent._address);
})

task("getContributors", "get Contributors of myContract").setAction(async()=>{
  console.log(await myContract.methods.getContributors())
})

task("benefit", "send benefits to myContract").addParam("address", "your addres").addParam("value", "value of wei").setAction(async(taskArgs)=>{
  await myContract.methods.sendABenefits().send({from:taskArgs.address, value:web3js.utils.toEther("value", "wei")});
})

task("balance", "Prints an account's balance",async function (taskArguments, hre, runSuper) {
    console.log("Hello, World!");
  })
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);
    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
  });

task("send", "send some ether to MyContract").addParam("address1", "The account's address").addParam("value", "Sent value").setAction(async (taskargs, hre)=>{
  let [owner] = await hre.ethers.getSigners();
  let {address1, value} = taskargs;
  let signer = await hre.ethers.getSigner(address1);
  let MyContract = await hre.ethers.getContractFactory("MyContract");
  let myContract = await MyContract.connect(owner).deploy();
  await myContract.deployed();
  let before = await getAccountBalance(myContract.address);
  console.log("MyContract's balance before transaction: ", before, " ethers");
  await myContract.connect(signer).benefit({value:ethers.utils.parseEther(value)});
  let after = await getAccountBalance(myContract.address);
  console.log("MyContract's balance after transaction: ", after, " ethers");
});

task("get_contributors", "get contributors").setAction(async ()=>{
  console.log("contributors)))");
})

  module.exports = {

  };
