pragma solidity ^0.8.0;


contract MyContract{

   address public owner;

   address[] internal contributors;

   mapping (address => uint) internal contributorToDonation;

   constructor() {
      owner = msg.sender;
   }

   modifier requireOwner() {
      require(msg.sender == owner, "You are not owner!");
      _;
   }

   function benefit() payable external{
      require(msg.value > 0 ether);
      if(contributorToDonation[msg.sender] != 0){
         contributors.push(msg.sender);
      }
      contributorToDonation[msg.sender] += msg.value;
   }

   function sendABenefits(address payable _to, uint _value) external requireOwner {
      require(_value > 0, "Please send a value > 0");
      require(address(this).balance >= _value);
      _to.transfer(_value);
   }

  function sendAllBenefits(address payable _to) external requireOwner {
     _to.transfer(address(this).balance);
  }

   function getContributors() view external returns(address[] memory) {
      return contributors;
   }

   function getDonationsByContributor(address _contributor) external view returns(uint){
      require(contributorToDonation[_contributor] != 0, "We have no donations sent by this account!");
      return contributorToDonation[_contributor];
   }

}
