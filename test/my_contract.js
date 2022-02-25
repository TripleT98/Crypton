const { expect } = require("chai");
const {ethers} = require("hardhat");

//Функция для получения баланса контракта размещенного в локальной сети бч
async function getContractBalance(address){
       return ethers.utils.formatEther(await ethers.provider.getBalance(address));
     }

describe("Testing MyContract", async ()=>{

    let MyContract, myContract, owner, address1, address2, address3, contract_address;
//Данна функция создает API для взоимодействия с контрактом, развертывает сам контракт в локальной сети, а также предосталяет данные некоторых кошельков для взаимодействия с контрактами в локальном бч
    async function modifier(){
      [owner, address1, address2, address3] = await ethers.getSigners();
      MyContract = await ethers.getContractFactory("MyContract");
      myContract = await MyContract.connect(owner).deploy();
      await myContract.deployed();
      contract_address = myContract.address;
    }

//Действительно ли является тот пользователь которого мы указали при развертывании контра, как owner, владельцем контракта?
it("Owner is owner", async function(){
      await modifier();
      expect(await myContract.owner()).to.equal(owner.address);
    })

//Проверяется возможность отправки валюты на счет контракта
   it("Checking transaction sending", async ()=>{
     await modifier();
     //Сколько эфира будет отправлено
     let donation = "1";
     //Получение балансо контракта до отправки эфира
     let before = await getContractBalance(contract_address);
     //Вызов функции benefit для отправки эфира на балланс контракта. Метод connect принимает объект с данными о кошельке некого пользователя, который инициирует транзакцию.
     await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation)});
     //Получение баланса контаркта после транзакции
     let after = await getContractBalance(contract_address);
     //Сравниваем before + value === after. Балланс на котракте после тарнзакции должен быть равен баллнсу до в сумме с той велечиной, которую мы отправили
     expect(Number(before) + Number(donation)).to.equal(Number(after));
   })

//Проверяем количесво эфира которое отпрвил пользователь
   it("Check contributor's donations", async ()=>{
     await modifier();
     let donation1 = "1.0", donation2 = "2.0", donation3 = "3.0";
     //Отправляю пожертвования на myContract с 3х разных адресов
     await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation1)});
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     //Проверяю функцию getDonationsByContributor, которая возвращает количество пожертвованой валюты, на основании переданного адреса. Результат вызова этой функции сравниваем с пожертвованиями, которые мы отправляли.
     expect(ethers.utils.formatEther(await myContract.getDonationsByContributor(address1.address))).to.equal(donation1);
     expect(ethers.utils.formatEther(await myContract.getDonationsByContributor(address2.address))).to.equal(donation2);
     expect(ethers.utils.formatEther(await myContract.getDonationsByContributor(address3.address))).to.equal(donation3);
   })

//Проверяем возможность владельца контракта отправлять эфир с контракта на адрес любого кошелька
   it("Owner can send all contract's benefits to any address", async ()=>{
     await modifier();
     let donation2 = "2", donation3 = "3";
     let summ = Number(donation2) + Number(donation3);
     //Отправляею пожертвования от лица 2го и 3го поьзователя
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     //Получаю количесво эфира на кашельке 1го пользователя ДО отправки на его счет эфира
     let before = ethers.utils.formatEther(await address1.getBalance());
     //Отправляем весь эфир с нашего контракта на счет 1го пользователя
     await myContract.connect(owner).sendAllBenefits(address1.address);
     //Проверяем количесво эфира на кашельке 1го пользователя ПОСЛЕ отправки на его счет эфира
     let after = ethers.utils.formatEther(await address1.getBalance());
     //Разница after и before должна давать summ (сумма donation1 и donation2)
     expect(Number(after) - Number(before)).to.equal(summ);
   })

//Проверяем возможность владельца контракта отправлять любое количество эфира (не больше, чем есть на счету контракта) с адреса контракта на любой адрес кошелька
   it("Owner can send any value of ether to any address", async ()=>{
     await modifier();
     //value я указал в wei, а donation1 и donation2 в ether, так как функция sendAllBenefits вторым аргументом принимает строку то, при отправки эфира, в коде самой функции при передачи в качестве аргумента этой строки в метод address.transfer она будет означать кол-во wei
     let donation2 = "2", donation3 = "3", value = "3000000000000000000";
     //Отправляем эфир на контракт с 2х адресов 2 и 3 эфира
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     //Получаем количесво эфира в данной сети у 1го пользователя до транзакции с переводом эфира на его счет. И приводим к виду, удобному для рачета
     let addr1_balance_before = Number(ethers.utils.formatEther(await address1.getBalance()));
     //Отправляем на 1му пользователю 3 эфира
     await myContract.connect(owner).sendABenefits(address1.address, value);
     //Получаем количесво эфира в данной сети у 1го пользователя после транзакции с переводом эфира на его счет
     let addr1_balance_after = Number(ethers.utils.formatEther(await address1.getBalance()));
     //Получаем кол-во эфира на контракте после всех транзакций
     let after = await getContractBalance(myContract.address)
     value = Number(ethers.utils.formatEther(value));
     //Расчитываем ожидаемое кол-во эфира на контракте в данный момент
     let substr = Number(donation2) + Number(donation3) - Number(value);
     //Ожидаем, что кол-во эфира после отправки ему эфира (84 строка) у 1го пользователя будет ранво кол-ву эфира на его же кошельке до транзакции плюс количество отправленного ему эфира со счета контракта
     expect(addr1_balance_before + value).to.equal(addr1_balance_after);
     //Так же ожидем, что после проведения всех транзакции на контракте будет лежать donation1+donation2-value эфира
     expect(Number(after)).to.equal(Number(substr));
   })

//Получаем всех, кто когда либо отправлял эфир на myContract
   it("Get all contributos", async ()=>{
     await modifier();
     let donation1 = "1.0", donation2 = "2.0", donation3 = "3.0";
     //Отправляем эфир на контракт с 3х счетов
     await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation1)});
     await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
     await myContract.connect(address3).benefit({value:ethers.utils.parseEther(donation3)});
     //Получаем всех тех, кто отправлял пожертвования
     let contributors = await myContract.getContributors();
     //Используем метод глубокого сравнения, что бы сравнить 2 ожидаемый массив адресов тех, кто отправил пожертвования и массив который вернула функция контракта
     expect(contributors).to.deep.equal([address1.address,address2.address,address3.address])
   })

//При исполнении функции benefit должа произойти ошибка, если владелец контракта пытается перевести на чей-то счет эфир в количестве, превышающем баланс контракта
 it("Should drop error message if owner tries to send more ether than smart contract has", async ()=>{
   await modifier();
   //Указываем, с каким сообщением должна прийти ошибка (err_mess)
   let donation1 = "1.0", donation2 = "2.0", value = "4000000000000000000", err_mess = "Not enough ethers to send";
   //Отправляем эфир с 2х счетов на контракт
   await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation1)});
   await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation2)});
   //Ожидаю, что произойдет транзакция выкинет ошибку с сообщением (err_mess)
   await expect(myContract.connect(owner).sendABenefits(address3.address, value)).to.be.revertedWith(err_mess);
 })

//При попытке кем-то, кроме владельца контракта вызвать функцию sendABenefits, должа вернуться ошибка.
it("Should drop error message if somebody except owner tryes to send some ethers from contract", async ()=>{
  await modifier();
  //Указываем сообщение, которое ожидаем получить при ошибке
  let err_mess = "You are not owner!";
  //Отправляю транзакцию от имени address1, который не является владельцем контракта и ожидаю получить ошибку
  await expect(myContract.connect(address1).sendABenefits(address3.address, "1")).to.be.revertedWith(err_mess);
})


//Ожидаю получить ошибку при попытке перевода 0 ether на любой адресс.
it("Should drop error message if owner tries to send 0 ether", async ()=>{
  await modifier();
  //Ожидаемое сообщение об ошибке
  let err_mess = "Please send a value > 0";
  //Пытаюсь отправить 0 wei, и надеюсь получить ошибку
  await expect(myContract.connect(owner).sendABenefits(address1.address, "0")).to.be.revertedWith(err_mess);
})


//Данный тест работает по аналогии с предыдущим, только теперь я пытаюсь перевести 0 ether на счет контракта
it("U cant benefit 0 or less ether", async ()=>{
  await modifier();
  let err_mess = "Please send a value > 0";
  await expect(myContract.connect(address1).benefit({value: ethers.utils.parseEther("0")})).to.be.revertedWith(err_mess);
})


//Функция benefit должна единожды заносить в  адресс отправителя в mapping contributorToDonation (только при первой отправке эфира)
it("One address can be added to the list only one time", async ()=>{
  await modifier();
  let donation1 = "1.0"
  //Путсой массив, куда будут добавлятся аддреса отправителей эфира
  let contributors = [];
  //Отправляем эфир на myContract с 2х адресов
  await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation1)});
  await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation1)});
  //Добавляю в массив contributors два address1.address и address2.address
  contributors.push(address1.address);
  contributors.push(address2.address);
  //Произвожу еще 2 транзакции с отправкой эфира
  await myContract.connect(address1).benefit({value:ethers.utils.parseEther(donation1)});
  await myContract.connect(address2).benefit({value:ethers.utils.parseEther(donation1)});
  //Ожидаю выполнения транзакции по получению отправителей
  let contracts_contributors = await myContract.getContributors();
  //Проверяю, что массив, жертвователей содержит теже адреса что и массив contributors. Так же, он не должениметь копии адресов отправителей
  expect(contributors).to.deep.equal(contracts_contributors);
  //Проверяю, что все пожертвования дошли на контракт
  expect(Number(await getContractBalance(contract_address))).to.equal(donation1*4)
})

});
