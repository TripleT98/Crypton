/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-waffle");
let fs = require("fs");
let {INFURA_URL,PRIVAT_KEY} = require("./keys.js");

module.exports = {
  solidity: "0.8.0",
  networks:{
     rinkeby:{
       url:INFURA_URL,
       accounts:[`0x${PRIVAT_KEY}`]
     }
  }
};
