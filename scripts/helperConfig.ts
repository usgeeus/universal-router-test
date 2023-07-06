import { ERC20, ERC20__factory } from '../typechain'
import { Currency, Token, WETH9 } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber, constants } from 'ethers'
import hre from 'hardhat'
import { MethodParameters } from '@uniswap/v3-sdk'
const { ethers } = hre
const chainId = hre.network.config.chainId

export const getTokensAndAddresses = () => {
    const { chainId, universalRouter, permit2, ton, tos, weth, usdc, usdt } = getAddresses();
    const WETH = new Token(chainId, weth, 18, 'WETH', 'Wrapped Ether');
    const TON = new Token(chainId, ton, 18, 'TON', 'Tokamak Network');
    const TOS = new Token(chainId, tos, 18, 'TOS', 'TonStarter');
    const USDC = new Token(chainId, usdc, 6, 'USDC', 'USD Coin');
    const USDT = new Token(chainId, usdt, 6, 'USDT', 'Tether USD');
    return {
        WETH, TON, TOS, USDC, USDT, universalRouter, permit2
    }
}

export const getAddresses = () => {
  if (chainId == 5050) {
    return {
        chainId: 5050,
        universalRouter:'0xC4cDD44DA6824582A4Fd819B5Ab7b7924a8834Ef',
        permit2:'0x66d2011D1C9a11a37c816180886f9aE975e7fE5F',
        ton:'0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa',
        tos:'0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC',
        weth:'0x4200000000000000000000000000000000000006',
        usdc:'0x9c53338c48181035D96884946C34ea81818F743C',
        usdt:'0xd1e405F1154BE88aC84f748C1BcE22442B12309F',
    }
  } else if(chainId == 55004) {
    return {
        chainId: 55004,
        universalRouter:'0xC4cDD44DA6824582A4Fd819B5Ab7b7924a8834Ef',
        permit2:'0x66d2011D1C9a11a37c816180886f9aE975e7fE5F',
        ton:'0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2',
        tos:'0xD08a2917653d4E460893203471f0000826fb4034',
        weth:'0x4200000000000000000000000000000000000006',
        usdc:'0x46BbbC5f20093cB53952127c84F1Fbc9503bD6D9',
        usdt:'0x2aCC8EFEd68f07DEAaD37f57A189677fB5655B46',
    }
  } else{
    return {
        chainId: 5050,
        universalRouter:'0xC4cDD44DA6824582A4Fd819B5Ab7b7924a8834Ef',
        permit2:'0x66d2011D1C9a11a37c816180886f9aE975e7fE5F',
        ton:'0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa',
        tos:'0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC',
        weth:'0x4200000000000000000000000000000000000006',
        usdc:'0x9c53338c48181035D96884946C34ea81818F743C',
        usdt:'0xd1e405F1154BE88aC84f748C1BcE22442B12309F',
    }
  }
}
