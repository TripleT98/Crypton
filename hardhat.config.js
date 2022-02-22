/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-waffle");
require("./tasks/tasks.js");
require("dotenv").config();
require("solidity-coverage");

module.exports = {
  solidity: "0.8.0",
  settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  networks:{
     rinkeby:{
       url:process.env.INFURA_URL,
       accounts:[`0x${process.env.PRIVAT_KEY}`]
     }
  },
  plugins: ["solidity-coverage"]
};
