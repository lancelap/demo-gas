import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DemoGasModule", (m) => {
  const demo = m.contract("DemoGas");

  return { demo };
});
