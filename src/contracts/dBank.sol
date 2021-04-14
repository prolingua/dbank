// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./Token.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract dBank {
  using SafeMath for uint256;

  Token private token;
  
  //add mappings
  mapping(address => uint) public etherBalanceOf;
  mapping(address => uint) public depositStart;
  
  mapping(address => bool) public isDeposited;

  //add events
  event Deposit(address indexed user, uint etherAmount, uint timeStart);
  event Withdraw(address indexed user, uint etherAmount, uint depositTime, uint interest);

  
  constructor(address _tokenAddress) public {
    token = Token(_tokenAddress);
  }

  function deposit() payable external {
    require(isDeposited[msg.sender] == false, 'Error, deposit already active');
    require(msg.value >= 1e16, 'Error, deposit must be >= 0.01 ETH');

    etherBalanceOf[msg.sender] = (etherBalanceOf[msg.sender]).add(msg.value);
    depositStart[msg.sender] =  block.timestamp;

    isDeposited[msg.sender] = true;
    emit Deposit(msg.sender, msg.value, block.timestamp);
    //emit Deposit event
  }

  function withdraw() external {
    require(isDeposited[msg.sender] == true, 'Error, no deposit yet');
    //assign msg.sender ether deposit balance to variable for event
    uint userBalance = etherBalanceOf[msg.sender];

    uint depositTime = (block.timestamp).sub(depositStart[msg.sender]);

    uint interestPerSecond = 31668017 * ((etherBalanceOf[msg.sender]).div(1e16));
    uint interest = interestPerSecond * depositTime;

    msg.sender.transfer(userBalance);
    token.mint(msg.sender, interest);

    depositStart[msg.sender] = 0;
    etherBalanceOf[msg.sender] = 0;
    isDeposited[msg.sender] = false;

    //emit event
    emit Withdraw(msg.sender, userBalance, depositTime, interest);
  }  
}