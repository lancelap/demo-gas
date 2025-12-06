// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DemoGas {
    string public name;
    mapping(address => uint256) private balances;

    constructor(string memory _name) {
        name = _name;
    }

    function deposit(address to, uint256 amount) external payable {
        require(msg.value == amount, "Value mismatch");
        uint256 newBalance = balances[to] + amount;

        balances[to] = newBalance;

        emit Deposited(to, amount, balances[to]);
    }

    function withdraw(uint256 amount) external {        
        require(amount <= balances[msg.sender], "Not enough");

        balances[msg.sender] = balances[msg.sender] - amount;

        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Fail");

        emit Withdraw(msg.sender, amount);
    }

    function balanceOf(address account) view external returns(uint256) {
        return balances[account];
    }

    event Deposited(address indexed user, uint256 amount, uint256 totalBalance);
    event Withdraw(address indexed user, uint256 amount);
}
