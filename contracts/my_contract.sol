pragma solidity ^0.8.0;


contract MyContract{

address owner;

constructor(address _owner) {
owner = _owner;
}

address[] internal contributors;

mapping (address => uint) internal contributorToDonation;

function benefit() payable external{
   require(msg.value > 0);
   if(contributorToDonation[msg.sender] != 0){
   contributors.push(msg.sender);
   }
   contributorToDonation[msg.sender] += msg.value;
}

function sendABenefits(address payable _to, uint _value) external {
   require(msg.sender == owner);
   require(_value > 0);
   require(address(this).balance >= _value);
   _to.transfer(_value);
}

function getContributors() view external returns(address[] memory) {
   return contributors;
}

function getDonationsByContributor(address _contributor) external view returns(uint){
   require(contributorToDonation[_contributor] != 0, "We have no donations sent by this account!");
   return contributorToDonation[_contributor];
}

}
