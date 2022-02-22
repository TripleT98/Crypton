pragma solidity ^0.8.0;


contract MyContract{

   address public owner;
   uint pay = 3 ether;
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
      require(msg.value > 0 ether, "Please send a value > 0");
      if(contributorToDonation[msg.sender] == 0){
         contributors.push(msg.sender);
      }
      contributorToDonation[msg.sender] += msg.value;
   }

   function sendABenefits(address payable _to, uint _value) external requireOwner returns(uint) {
      require(_value > 0, "Please send a value > 0");
      require(address(this).balance >= _value, "Not enough ethers to send");
      _to.transfer(_value);
      return _value;
   }

  function sendAllBenefits(address payable _to) external requireOwner {
     _to.transfer(address(this).balance);
  }

   function getContributors() view external returns(address[] memory) {
      return contributors;
   }

   function getDonationsByContributor(address _contributor) external view returns(uint){
      return contributorToDonation[_contributor];
   }

}
