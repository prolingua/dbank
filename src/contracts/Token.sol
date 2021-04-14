// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title An ERC20 token minted by dBank as interest
/// @author Iwan Effendi
/// @dev inherit ERC20; all functions and event have been unit tested
contract Token is ERC20 {
  address public minter;

  event MinterChanged(address indexed from, address to);

  /// @notice set the minter to the deployer
  /// @dev the deployer then can pass the mint role to dBank  
  constructor() public payable ERC20("Decentralized Bank Currency", "DBC") {
    minter = msg.sender;
  }

  /// @notice transfer the mint role to dBank
  /// @dev should be called once during the deployment only
  /// @param dBank the address of dBank contract
  /// @return success indicating that the mint role passing is successful
  function passMinterRole(address dBank) external returns (bool success) {
    require(msg.sender == minter, 'Error, only owner can change pass minter role');
    minter = dBank;

    emit MinterChanged(msg.sender, dBank);
    return true;
  }

  /// @notice mint tokens for an account
  /// @dev this function can only be called by dBank contract
  /// @param account the account address which the token is minted for as the interest
  /// @param amount the amount of the tokens minted in gwei

  function mint(address account, uint256 amount) external {
    require(msg.sender == minter, 'Error, msg.sender does not have minter role');
		_mint(account, amount);
	}
}