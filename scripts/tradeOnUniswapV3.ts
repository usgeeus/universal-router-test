import type { Contract } from '@ethersproject/contracts'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { FeeAmount } from '@uniswap/v3-sdk'
import { parseEvents, V3_EVENTS } from '../test/integration-tests/shared/parseEvents'
import { expect } from '../test/integration-tests/shared/expect'
import { encodePath } from '../test/integration-tests/shared/swapRouter02Helpers'
import { BigNumber, BigNumberish } from 'ethers'
import { Permit2, UniversalRouter } from '../typechain'
import { MAX_UINT } from '../test/integration-tests/shared/constants'
import { abi as TOKEN_ABI } from '../artifacts/solmate/src/tokens/ERC20.sol/ERC20.json'
import { abi as PERMIT2_ABI } from '../artifacts/permit2/src/Permit2.sol/Permit2.json'
import { abi as ROUTER_ABI } from '../artifacts/contracts/UniversalRouter.sol/UniversalRouter.json'
import { getTokensAndAddresses } from './helperConfig'
import { expandTo18DecimalsBN, expandTo6DecimalsBN } from '../test/integration-tests/shared/helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { RoutePlanner, CommandType } from '../test/integration-tests/shared/planner'
import hre from 'hardhat'
import {
  getPermitSignature,
  getPermitBatchSignature,
  PermitSingle,
} from '../test/integration-tests/shared/protocolHelpers/permit2'
const { ethers } = hre
const deadline = Math.floor(Date.now() / 1000) + 1000000
let signer: SignerWithAddress
let universalRouterContract: UniversalRouter
let permit2Contract: Permit2
let tonContract: Contract
let tosContract: Contract
let wethContract: Contract
let usdcContract: Contract
let usdtContract: Contract
let planner: RoutePlanner
const {
  WETH,
  TON,
  TOS,
  USDC,
  USDT,
  universalRouter: universalRouterAddress,
  permit2: permit2Address,
} = getTokensAndAddresses()

const set = async () => {
  signer = await ethers.getSigner()
  tonContract = new ethers.Contract(TON.address, TOKEN_ABI, signer)
  tosContract = new ethers.Contract(TOS.address, TOKEN_ABI, signer)
  wethContract = new ethers.Contract(WETH.address, TOKEN_ABI, signer)
  usdcContract = new ethers.Contract(USDC.address, TOKEN_ABI, signer)
  usdtContract = new ethers.Contract(USDT.address, TOKEN_ABI, signer)
  universalRouterContract = new ethers.Contract(universalRouterAddress, ROUTER_ABI, signer)
  permit2Contract = new ethers.Contract(permit2Address, PERMIT2_ABI, signer)
}
const approve = async () => {
  if ((await tonContract.allowance(signer.address, permit2Address)) < 1) {
    await tonContract.approve(permit2Address, MAX_UINT)
    await tosContract.approve(permit2Address, MAX_UINT)
    await usdcContract.approve(permit2Address, MAX_UINT)
    await usdtContract.approve(permit2Address, MAX_UINT)
  }
}
const permitAndExactAmountIn = async () => {
  planner = new RoutePlanner()
  let permit: PermitSingle
  const amountInTOS = expandTo18DecimalsBN(0.1)
  const minAmountOut = 0
  permit = {      
    details: {
      token: tosContract.address,
      amount: amountInTOS,
      expiration: 0, //0 is block.timestamp
      nonce: 0,
    },
    spender: universalRouterContract.address,
    sigDeadline: deadline,
  }
  const sig = await getPermitSignature(permit, signer, permit2Contract)
  const path = encodePathExactInput([tosContract.address, tonContract.address])
  planner.addCommand(CommandType.PERMIT2_PERMIT, [permit, sig])
  planner.addCommand(CommandType.V3_SWAP_EXACT_IN, [signer.address, amountInTOS, minAmountOut, path, true])
  // const { tosBalanceBefore, tosBalanceAfter, tonBalanceBefore, tonBalanceAfter } = await executeRouter(planner)
  // console.log('tos balance before & after:', tosBalanceBefore, tosBalanceAfter)
  // console.log('ton balance before & after:', tonBalanceBefore, tonBalanceAfter)
  // console.log(tosBalanceBefore.sub(tosBalanceAfter));
  // console.log(amountInTOS);
  // console.log(tosBalanceBefore.sub(tosBalanceAfter)== amountInTOS);
}

function encodePathExactInput(tokens: string[]) {
  return encodePath(tokens, new Array(tokens.length - 1).fill(FeeAmount.MEDIUM))
}

async function executeRouter(planner: RoutePlanner, value?: BigNumberish): Promise<ExecutionParams> {
  const ethBalanceBefore: BigNumber = await ethers.provider.getBalance(signer.address)
  const tonBalanceBefore: BigNumber = await tonContract.balanceOf(signer.address)
  const tosBalanceBefore: BigNumber = await tosContract.balanceOf(signer.address)
  const usdcBalanceBefore: BigNumber = await usdcContract.balanceOf(signer.address)
  const usdtBalanceBefore: BigNumber = await usdtContract.balanceOf(signer.address)
  const { commands, inputs } = planner
  const receipt = await (
    await universalRouterContract['execute(bytes,bytes[],uint256)'](commands, inputs, deadline, { value })
  ).wait()
  const gasSpent = receipt.gasUsed;
  const v3SwapEventArgs = parseEvents(V3_EVENTS, receipt)[0]?.args as unknown as V3SwapEventArgs
  const ethBalanceAfter: BigNumber = await ethers.provider.getBalance(signer.address)
  const tonBalanceAfter: BigNumber = await tonContract.balanceOf(signer.address)
  const tosBalanceAfter: BigNumber = await tosContract.balanceOf(signer.address)
  const usdcBalanceAfter: BigNumber = await usdcContract.balanceOf(signer.address)
  const usdtBalanceAfter: BigNumber = await usdtContract.balanceOf(signer.address)
  return {
    ethBalanceBefore,
    ethBalanceAfter,
    tonBalanceBefore,
    tonBalanceAfter,
    tosBalanceBefore,
    tosBalanceAfter,
    usdcBalanceBefore,
    usdcBalanceAfter,
    usdtBalanceBefore,
    usdtBalanceAfter,
    v3SwapEventArgs,
    receipt,
    gasSpent,
  }
}

async function main() {
  await set()
  await approve()
  //======== trade on Uniswap with Permit2, giving approval every time
  await permitAndExactAmountIn()
  //console.log("what");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
type V3SwapEventArgs = {
  amount0: BigNumber
  amount1: BigNumber
}

type ExecutionParams = {
  ethBalanceBefore: BigNumber
  ethBalanceAfter: BigNumber
  tonBalanceBefore: BigNumber
  tonBalanceAfter: BigNumber
  tosBalanceBefore: BigNumber
  tosBalanceAfter: BigNumber
  usdcBalanceBefore: BigNumber
  usdcBalanceAfter: BigNumber
  usdtBalanceBefore: BigNumber
  usdtBalanceAfter: BigNumber
  v3SwapEventArgs: V3SwapEventArgs | undefined
  receipt: TransactionReceipt
  gasSpent: BigNumber
}
