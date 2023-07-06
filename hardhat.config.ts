import 'hardhat-typechain'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import dotenv from 'dotenv'
dotenv.config()

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.8.17',
  settings: {
    viaIR: true,
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

export default {
  paths: {
    sources: './contracts',
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      chainId: 31337,
      forking: {
        url: `https://goerli.optimism.tokamak.network`,
      },
    },
    localhost: {
      chainId: 31337,
      forking: {
        url: 'https://goerli.optimism.tokamak.network',
      },
      accounts: [`${process.env.PRIVATE_KEY1}`, `${process.env.PRIVATE_KEY2}`],
      // gas: 1
      // accounts: [`${process.env.PRIVATE_KEY}`,`${process.env.LOCAL_KEY}`,`${process.env.LOCAL_KEY2}`,`${process.env.LOCAL_KEY3}`,`${process.env.LOCAL_KEY4}`,`${process.env.LOCAL_KEY5}`,`${process.env.LOCAL_KEY6}`,`${process.env.LOCAL_KEY7}`]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    arbitrumRinkeby: {
      url: `https://rinkeby.arbitrum.io/rpc`,
    },
    arbitrum: {
      url: `https://arb1.arbitrum.io/rpc`,
    },
    optimismKovan: {
      url: `https://kovan.optimism.io`,
    },
    optimism: {
      url: `https://mainnet.optimism.io`,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    tokamakgoerli: {
      chainId: 5050,
      url: `https://goerli.optimism.tokamak.network`,
      timeout: 200000,
      accounts: [`${process.env.PRIVATE_KEY1}`],
    },
    titan: {
      url: 'https://rpc.titan.tokamak.network',
      accounts: [`${process.env.PRIVATE_KEY1}`],
      chainId: 55004,
      gasPrice: 1000000000,
      deploy: ['deploy_titan'],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: [
      {
        network: 'tokamakgoerli',
        chainId: 5050,
        urls: {
          apiURL: 'https://goerli.explorer.tokamak.network/api',
          browserURL: 'https://goerli.explorer.tokamak.network',
        },
      },
      {
        network: 'titan',
        chainId: 55004,
        urls: {
          apiURL: 'https://explorer.titan.tokamak.network/api',
          browserURL: 'https://explorer.titan.tokamak.network',
        },
      },
    ],
  },
  namedAccounts: {
    deployer: 0,
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
  },
  mocha: {
    timeout: 60000,
  },
}
