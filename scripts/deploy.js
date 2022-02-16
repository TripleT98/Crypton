const hre = require("hardhat");
let settings = require("./sc_address");
const ethers = hre.ethers;

async function main(){
  let [owner] = await ethers.getSigners();
  const MyContract = await ethers.getContractFactory("MyContract", owner);
  const myContract = await MyContract.deploy();
  await myContract.deployed();
  settings.contract_address = myContract.address;
  console.log("Contract address: ", myContract.address);
  console.log("Owner address: ", owner.address);
}

main().then(()=>process.exit(0)).catch((er)=>{console.log(er);process.exit(1)});
