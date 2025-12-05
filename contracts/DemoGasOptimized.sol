// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DemoGasOptimized {
    mapping(address => uint256) private balances;

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
    

    /// @notice демо использования memory vs calldata
    function sumArray(uint256[] calldata arr) external pure returns(uint256) {
        // calldata -> memory (дорого, но иногда нужно в массивах/строках)
        uint256[] memory copy = arr;

        uint256 total = 0;
        uint256 len = copy.length; // cache length in stack

        for (uint256 i; i < len; ) {
            total += copy[i];
            unchecked { ++i; }
        }

        return total;
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

    event Deposited(address indexed user, uint256 amount, uint256 totalBalance);
    event Withdraw(address indexed user, uint256 amount);
}
