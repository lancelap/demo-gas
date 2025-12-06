// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DemoGasOptimized {
    string public name;
    mapping(address => uint256) private balances;

    constructor(string memory _name) {
        name = _name;
    }
    /// @notice calldata дешевле memory для входящих данных
    function deposit(address to, uint256 amount) external payable {
        require(msg.value == amount, "Value mismatch");

        // STORAGE: balances - хранится в storage
        // Кешируем storage в stack-переменную (оптимизация)
        uint256 prev = balances[to];
        uint256 newBalance = prev + amount;

        balances[to] = newBalance;

        emit Deposited(to, amount, newBalance);
    }
    

    /// @notice демо stack и storage оптимизации
    function withdraw(uint256 amount) external {
        uint256 balanceInMemory = balances[msg.sender]; // SLOAD only once
        
        require(amount <= balanceInMemory, "Not enough");

        balances[msg.sender] = balanceInMemory - amount; // SSTORE once

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
