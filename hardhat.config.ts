import "@nomicfoundation/hardhat-toolbox";
import "./scripts/tasks";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

function getChainConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url = `https://${network}.infura.io/v3/${process.env.infuraApiKey}`;
  return {
    accounts: {
      count: 10,
      mnemonic: process.env.DEPLOYER_MNEMONIC,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    url,
    gasMultiplier: 1.5,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: getChainConfig("goerli"),
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1,
      accounts: {
        count: 10,
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
      },
    },
  },
  etherscan: {},
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    gasPrice: 1,
    outputFile: "./test-report",
    noColors: true,
    rst: true,
    showTimeSpent: true,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
      {
        version: "0.4.18",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
    ],
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./tests",
  },
};

export default config;
