require("@nomiclabs/hardhat-web3");
//модуль для доступа к переменным окружения .env
require("dotenv").config();
//Модуль библиотки web3js для взаимодействия с контрактом в сети бч
let Web3 = require("web3");
//Подключаю модуль с артефактом моего контракта
let myContractArtifact = require("./../artifacts/contracts/my_contract.sol/MyContract.json");
//Переменные окружения
let {INFURA_API_KEY, RINKEBY_CONTRACT_ADDRESS, META_MASK_PROVIDER_URL, PUBLIC_KEY, PRIVATE_KEY} = process.env;
//Создаю экземпляр класса Web3.providers.HttpProvider куда прокидываю адрес для доступа к удаленному узлу сети rinkeby
let currentProvider = new Web3.providers.HttpProvider(`${META_MASK_PROVIDER_URL}`);
//Создаю экземпляр класса Web3 который можно использовать для создания интерфейсо взаимодействия с контрактами в сети rinkeby
let web3js = new Web3(currentProvider);
//Создаю интерфейс взаимодействия с моим контрактом, для этого в конструктор передаю ABI контракта и его адрес в сети использующей технологию эфириума rinkeby, который я получил после деплоя
let myContract = new web3js.eth.Contract(myContractArtifact["abi"], RINKEBY_CONTRACT_ADDRESS);

//Вынес логику создания подписи для транзакций, что бы не загромождать код
async function getSign(obj){
  //Создаю объект необходимый для подписи транзакций
  return await web3js.eth.accounts.signTransaction({
    to:obj.to,//Адрес контракта, к которому нужно обратиться
    value: web3js.utils.toWei(obj.value || "0", "wei") || null,//Велечина эфира, которую вы хотите отправить на контракт
    gasLimit: Number(obj.gasLimit),//Лимит газа, максимально допустимый газ, который вы допускаете использовать при выполнении транзакции.Чем больше лимит газа, тем более сложные операции можно провести при выполнении транзакции
    data: obj.data//Бинарный код транзакции, которую вы хотите выполнить
  }, obj.privateKey)
}

//Функция для получения баланса на контракте (в при случае в сети rinkeby, так как при создании web3js был указан провайдер ведущий на rinkeby)
async function getContractBalance(address){
  return await web3js.eth.getBalance(address);
}

//Получает адресс (публичный ключ) владельца контракта
task("getOwner", "get owner of myContract").setAction(async (args, hre)=>{
  try{
    //Данная транзакция не требует подписи, так как не вносит изменинй в состояние контракта а следовательно и не изменяет бч. Так же не требует платы за газ
    await myContract.methods.owner().call().then(console.log);
  }catch(e){
    //При возникновении ошибки в консоле появится сообщение
    console.log(e.message)
  }
})

//Получить всех тех, кто когда либо отправил эфир на котракт
task("getContributors", "get Contributors of myContract").setAction(async(args, hre)=>{
  try{
     //Запрашиваем жертвователей и выводим их в консоль
     console.log(await myContract.methods.getContributors().call());
  }catch(e){
     console.log(e.message)
  }
})

//Введя публичный ключ кошелька, вы можете получить величину его пожертвований за все время
task("getDonations", "get donation value of any contributor").addParam("address", "Contributor's address").setAction(async(taskArgs)=>{
  try{
    //Получаем величину эфира, которую прислали с этого адреса в wei
    console.log(await myContract.methods.getDonationsByContributor(taskArgs.address).call());
  }catch(e){
    console.log(e.message)
  }
})


//Отправить эфир. Для подписи транзакции нужно ввести ваш приватный ключ а также лимит газа и величину эфира в wei
task("benefit", "send benefits to myContract").addParam("privatekey", "Enter your privat key to sign the transaction").addParam("value", "value of wei").addParam("gaslimit", "Enter gas limit value, it has to be more than 21064").setAction(async(taskArgs, hre)=>{
  try{
    //На данный момент для проведения транзакции минимальный лимит газа 21064
    if(Number(taskArgs.gas_limit) < 21064){throw new Error("Not enought gas")};
    //Вызываем функцию benefit и получаем ее бинарный код
    let data = await myContract.methods.benefit().encodeABI();
    //Подписываем транзакцию. Для отправки транзакции, которая изменяет состояние контракта следовательно и бч, требует подписи. Данные транзакции требуют плату за газ, которая зависит от сложности вычислений при выполнении транзакции. Простой перевод эфира также требует газ.
    let sign = await getSign({data,privateKey:taskArgs.privatekey, gasLimit:taskArgs.gaslimit, value:taskArgs.value, to:RINKEBY_CONTRACT_ADDRESS});
    //Отправлем подписанную транзакцию
    let createreceipt = await web3js.eth.sendSignedTransaction(sign.rawTransaction);
    console.log(`${taskArgs.value} wei has been sended to contract (${RINKEBY_CONTRACT_ADDRESS}) from your address(${taskArgs.privatekey})`);
  }catch(e){
    console.log(e.message)
  }
})

//test address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266


//Отправляется эфир с адреса контракта на адрес кошелька
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

//Отправить весь эфир с контракта на определенный адрес
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
