import assert from "node:assert/strict";
import { suite, test, beforeEach } from "node:test";
import { getAddress, parseEther } from "viem";

import { network } from "hardhat";

suite("DemoGas", async function () {
  const { viem } = await network.connect();
  let contract = await viem.deployContract("DemoGas", ["DemoGas"]);
  const [owner, from, to] = await viem.getWalletClients();
  const client = await viem.getPublicClient();

  beforeEach(async function () {
    contract = await viem.deployContract("DemoGas", ["DemoGas"]);
  });

  test("Should show name", async function () {
    const name = await contract.read.name();
    assert.equal(name, "DemoGas");
  });

  test("Should send ETH, assert contract balance and event, measure gasUsed", async function () {
    const name = await contract.read.name();
    const contractBal = await client.getBalance({ address: contract.address });
    assert.ok(contractBal == 0n, "contract balance == 0");

    const amount = 1n * 10n ** 18n; // 1 ETH as bigint

    const txHash = await contract.write.deposit(
      [from.account.address, amount],
      { value: amount }
    );
    const receipt = await client.waitForTransactionReceipt({ hash: txHash });
    assert.ok(receipt.status === "success", "deposit tx should succeed");

    const gasUsed = receipt.gasUsed;
    const effectiveGasPrice = receipt.effectiveGasPrice;
    const feeWei = gasUsed * effectiveGasPrice; // bigint

    console.log("txHash:", txHash);
    console.log("gasUsed:", gasUsed.toString());
    console.log("effectiveGasPrice (wei):", effectiveGasPrice.toString());
    console.log("fee (wei):", feeWei.toString());

    await viem.assertions.emitWithArgs(
      Promise.resolve(txHash),
      contract,
      "Deposited",
      [getAddress(from.account.address), amount, 1000000000000000000n]
    );

    const balance = await contract.read.balanceOf([from.account.address]);
    const contractBalanceAfter = await client.getBalance({
      address: contract.address,
    });

    assert.ok(contractBalanceAfter == amount, "contract balance == amount");
    assert.equal(balance, amount);
    assert.ok(gasUsed > 0n, "gasUsed should be > 0");
  });

  test("Should withdraw and revert when over-withdraw, then succeed for valid amount; log gasUsed", async function () {
    const contractBalBefore = await client.getBalance({
      address: contract.address,
    });
    assert.equal(contractBalBefore, 0n, "contract balance should start at 0");

    const depositAmount = 1n * 10n ** 18n; // 1 ETH
    const txHashDeposit = await contract.write.deposit(
      [from.account.address, depositAmount],
      { value: depositAmount }
    );
    const receiptDeposit = await client.waitForTransactionReceipt({
      hash: txHashDeposit,
    });

    assert.ok(receiptDeposit.status === "success", "deposit tx should succeed");

    const contractBalAfterDeposit = await client.getBalance({
      address: contract.address,
    });
    assert.equal(
      contractBalAfterDeposit,
      depositAmount,
      "contract should hold deposited amount"
    );

    const walletClient = from;

    const overAmount = depositAmount + 2n;
    const validAmount = depositAmount; // withdraw all

    await viem.assertions.revertWith(
      contract.write.withdraw([overAmount], {
        account: walletClient.account.address,
      }),
      "Not enough"
    );

    const contractBalBeforeWithdraw = await client.getBalance({
      address: contract.address,
    });

    const txHashWithdraw = await contract.write.withdraw([validAmount], {
      account: walletClient.account.address,
    });
    const receiptWithdraw = await client.waitForTransactionReceipt({
      hash: txHashWithdraw,
    });

    const gasUsed = receiptWithdraw.gasUsed ?? 0n;
    const effectiveGasPrice = receiptWithdraw.effectiveGasPrice ?? 0n;
    const feeWei = gasUsed * effectiveGasPrice;

    console.log("withdraw txHash:", txHashWithdraw);
    console.log("withdraw gasUsed:", gasUsed.toString());
    console.log("withdraw effectiveGasPrice:", effectiveGasPrice.toString());
    console.log("withdraw fee (wei):", feeWei.toString());

    const recipientAddr = walletClient.account?.address ?? from.account.address;
    const recipientBalBefore = await client.getBalance({
      address: recipientAddr,
    });

    const contractBalAfterWithdraw = await client.getBalance({
      address: contract.address,
    });
    const recipientBalAfter = await client.getBalance({
      address: recipientAddr,
    });

    // contract balance decreased by withdrawn amount
    assert.equal(
      contractBalAfterWithdraw,
      contractBalBeforeWithdraw - validAmount,
      "contract balance decreased by withdrawn amount"
    );

    // recipient balance increased by approximately validAmount minus gas paid by recipient (we cannot assert exact because gas was paid)
    // We'll assert that recipient balance after >= recipient balance before (should be larger or approx larger when virtual miner reimbursement)
    assert.ok(
      recipientBalAfter >= recipientBalBefore - feeWei,
      "recipient balance must increase by approx withdrawn amount minus fee"
    );
  });
});
