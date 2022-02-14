const hre = require("hardhat");
const ethers = hre.ethers;

async function main(){
  let [owner] = await ethers.getSigners();
  const MyContract = await ethers.getContractFactory("MyContract", owner);
  const myContract = await MyContract.deploy();
  await myContract.deployed();
}

main().then(()=>process.exit(0)).catch((er)=>{console.log(er);process.exit(1)});
