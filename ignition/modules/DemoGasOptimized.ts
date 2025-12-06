import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DemoGasOptimizedModule", (m) => {
  const demo = m.contract("DemoGasOptimized");

  return { demo };
});
