// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DemoGas {
    mapping(address => uint256) private balances;

    function deposit(address to, uint256 amount) external payable {
        require(msg.value == amount, "Value mismatch");
        uint256 newBalance = balances[to] + amount;

        balances[to] = newBalance;

        emit Deposited(to, amount, balances[to] + amount);
    }

    function sumArray(uint256[] calldata arr) external pure returns(uint256) {
        uint256 total = 0;

        for (uint256 i; i < arr.length; ) {
            total += arr[i];
            unchecked { ++i; }
        }

        return total;
    }

    function withdraw(uint256 amount) external {        
        require(amount <= balances[msg.sender], "Not enough");

        balances[msg.sender] = balances[msg.sender] - amount;

        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Fail");

        emit Withdraw(msg.sender, amount);
    }

    event Deposited(address indexed user, uint256 amount, uint256 totalBalance);
    event Withdraw(address indexed user, uint256 amount);
}
