/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-waffle");
require("./tasks/tasks.js");

let {INFURA_URL,PRIVAT_KEY} = require("./keys.js");



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
       url:INFURA_URL,
       accounts:[`0x${PRIVAT_KEY}`]
     }
  }
};
