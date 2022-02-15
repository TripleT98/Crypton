require("@nomiclabs/hardhat-web3");

async function getAccountBalance(address){
return ethers.utils.formatEther(await ethers.provider.getBalance(address));
}

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

  module.exports = {

  };
