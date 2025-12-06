# demo-gas

Minimal Hardhat demo focused on measuring and comparing gas usage between two Solidity contracts:

- `contracts/DemoGas.sol` — baseline implementation
- `contracts/DemoGasOptimized.sol` — optimized implementation

This repository contains simple contracts, tests, and build artifacts so you can reproduce gas measurements and see how small Solidity changes affect gas costs.

## What you'll find here

- Solidity contracts: `contracts/`
- Tests: `test/` (TypeScript tests using Hardhat)
- Artifacts and build-info: `artifacts/`, `cache/`
- Coverage output (if generated): `coverage/`

## Prerequisites

- Node.js (18+ recommended)
- npm (or pnpm/yarn if you prefer; commands below use npm)
- npx (ships with npm)

This project uses Hardhat (dev dependency) for compilation and testing.

## Install

Install dependencies:

```bash
npm install
```

## Common commands

- Compile contracts:

```bash
npx hardhat compile
```

- Run tests:

```bash
npx hardhat test
```

Tests are TypeScript (`test/*.ts`). If you prefer running tests through npm scripts you can add a `test` script to `package.json` like:

```json
"scripts": {
	"test": "npx hardhat test"
}
```

## Running a single test file

```bash
npx hardhat test test/DemoGas.test.ts
```

## Notes about gas measurement

- This repository is organized to let you compare the baseline and optimized contract implementations. The tests verify behavior; you can add logging or measurement helpers in tests to print gas used by transactions.
- Hardhat's `--verbose` output and transaction receipts returned by ethers/providers include gas used. Consider adding a small test helper that prints `receipt.gasUsed` for specific calls.

## Project layout

- `contracts/` — solidity sources
- `test/` — tests (TypeScript)
- `artifacts/` — compilation artifacts (auto-generated)
- `cache/` — Hardhat compile cache
- `hardhat.config.ts` — Hardhat configuration

## Troubleshooting

- If tests fail due to missing dependencies, run `npm install` again.
- If TypeScript test compilation errors occur, ensure your Node version and installed `typescript` match the repo expectations.

## Contributing

Contributions are welcome. Open issues or PRs for improvements, especially if you add a new optimization or gas measurement helper.

## License

MIT

