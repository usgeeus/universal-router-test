import { CurrencyAmount, Ether, Percent, Price, sqrt, Token, TradeType, WETH9, Fraction } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import { FeeAmount, TICK_SPACINGS } from '@uniswap/v3-sdk'
import { encodeSqrtRatioX96 } from '@uniswap/v3-sdk'
import { nearestUsableTick } from '@uniswap/v3-sdk'
import { TickMath } from '@uniswap/v3-sdk'
import { Pool } from '@uniswap/v3-sdk'
import { Route } from '@uniswap/v3-sdk'
import { Trade } from '@uniswap/v3-sdk'
import { expect } from 'chai'

describe('Trade#', () => {
  const token0 = new Token(1, '0x0000000000000000000000000000000000000001', 18, 't0', 'token0')
  const token1 = new Token(1, '0x0000000000000000000000000000000000000002', 18, 't1', 'token1')
  const token2 = new Token(1, '0x0000000000000000000000000000000000000003', 18, 't2', 'token2')
  const token3 = new Token(1, '0x0000000000000000000000000000000000000004', 18, 't3', 'token3')
  function v2StylePool(
    reserve0: CurrencyAmount<Token>,
    reserve1: CurrencyAmount<Token>,
    feeAmount: FeeAmount = FeeAmount.MEDIUM
  ) {
    const sqrtRatioX96 = encodeSqrtRatioX96(reserve1.quotient, reserve0.quotient)
    const liquidity = sqrt(JSBI.multiply(reserve0.quotient, reserve1.quotient))
    return new Pool(
        reserve0.currency,
        reserve1.currency,
        feeAmount,
        sqrtRatioX96,
        liquidity,
        TickMath.getTickAtSqrtRatio(sqrtRatioX96),
        [
            {
                index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]),
                liquidityNet: liquidity,
                liquidityGross: liquidity
            },
            {
                index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]),
                liquidityNet: JSBI.multiply(liquidity, JSBI.BigInt(-1)),
                liquidityGross: liquidity
            }
        ]
    )
  }
  const pool_0_1 = v2StylePool(
    CurrencyAmount.fromRawAmount(token0, 100000),
    CurrencyAmount.fromRawAmount(token1, 100000)
  )
  const pool_0_2 = v2StylePool(
    CurrencyAmount.fromRawAmount(token0, 100000),
    CurrencyAmount.fromRawAmount(token2, 110000)
  )
  const pool_0_3 = v2StylePool(
    CurrencyAmount.fromRawAmount(token0, 100000),
    CurrencyAmount.fromRawAmount(token3, 90000)
  )
  const pool_1_2 = v2StylePool(
    CurrencyAmount.fromRawAmount(token1, 120000),
    CurrencyAmount.fromRawAmount(token2, 100000)
  )
  const pool_1_3 = v2StylePool(
    CurrencyAmount.fromRawAmount(token1, 120000),
    CurrencyAmount.fromRawAmount(token3, 130000)
  )
  describe('#priceImpact', () => {
    describe('tradeType = EXACT_INPUT', ()=>{
        const exactIn = Trade.createUncheckedTradeWithMultipleRoutes({
            routes: [
                {
                  route: new Route([pool_0_1, pool_1_2], token0, token2),
                  inputAmount: CurrencyAmount.fromRawAmount(token0, 100),
                  outputAmount: CurrencyAmount.fromRawAmount(token2, 69)
                }
              ],
              tradeType: TradeType.EXACT_INPUT
        })
        const exactInMultipleRoutes = Trade.createUncheckedTradeWithMultipleRoutes({
            routes: [
              {
                route: new Route([pool_0_1, pool_1_2], token0, token2),
                inputAmount: CurrencyAmount.fromRawAmount(token0, 90),
                outputAmount: CurrencyAmount.fromRawAmount(token2, 62)
              },
              {
                route: new Route([pool_0_2], token0, token2),
                inputAmount: CurrencyAmount.fromRawAmount(token0, 10),
                outputAmount: CurrencyAmount.fromRawAmount(token2, 7)
              }
            ],
            tradeType: TradeType.EXACT_INPUT
          })
        console.log(pool_1_2)
        console.log(pool_1_2.sqrtRatioX96.toString())
        console.log(pool_1_2.liquidity.toString())
        it('is correct', () => {
            //expect(exactIn.priceImpact.toSignificant(3)).toEqual('17.2')
            console.log(exactIn.priceImpact.toSignificant(3));
        })
        it('is correct with multiple routes', async () => {
            //expect(exactInMultipleRoutes.priceImpact.toSignificant(3)).toEqual('19.8')
            console.log(exactInMultipleRoutes.priceImpact.toSignificant(3));
        })
    })
  })
})