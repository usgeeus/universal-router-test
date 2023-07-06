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

describe('Traade2#', () => {
  const routeExample = [
    [
        {
            "type": "v3-pool",
            "address": "0x2C1C509942D4f55e2BfD2B670E52b7A16ec5e5C4",
            "tokenIn": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC",
                "symbol": "TOS"
            },
            "tokenOut": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa",
                "symbol": "TON"
            },
            "fee": "3000",
            "liquidity": "104880",
            "sqrtRatioX96": "83095197869223157896060286990",
            "tickCurrent": "953",
            "amountIn": "10",
            "amountOut": "7"
        }
    ],
    [
        {
            "type": "v3-pool",
            "address": "0xC29271E3a68A7647Fd1399298Ef18FeCA3879F59",
            "tokenIn": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC",
                "symbol": "TOS"
            },
            "tokenOut": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0x4200000000000000000000000000000000000006",
                "symbol": "WETH"
            },
            "fee": "3000",
            "liquidity": "100000",
            "sqrtRatioX96": "79228162514264337593543950336",
            "tickCurrent": "0",
            "amountIn": "90"
        },
        {
            "type": "v3-pool",
            "address": "0x2AD99c938471770DA0cD60E08eaf29EbfF67a92A",
            "tokenIn": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0x4200000000000000000000000000000000000006",
                "symbol": "WETH"
            },
            "tokenOut": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa",
                "symbol": "TON"
            },
            "fee": "3000",
            "liquidity": "109544",
            "sqrtRatioX96": "72325086331246324823858696437",
            "tickCurrent": "-1824",
            "amountOut": "62"
        }
    ]
  ];
  //===========create Tokens
  let tokens:any = {};
  for (let routes of routeExample){
    for (let route of routes){
      if(! tokens[`${route.tokenIn.symbol}`] ) {
        tokens[`${route.tokenIn.symbol}`] = new Token(route.tokenIn.chainId, route.tokenIn.address, parseInt(route.tokenIn.decimals));
      }
      if(! tokens[`${route.tokenOut.symbol}`] ) {
        tokens[`${route.tokenOut.symbol}`] = new Token(route.tokenOut.chainId, route.tokenOut.address, parseInt(route.tokenOut.decimals));
      }
    }
  }
  
  //=============create Trade parameters
  const tradeParams:any = {routes:[]};
  for (let routes of routeExample){
    let pools = [];
    for (let i =0; i < routes.length; i++ ){
      //===============create Pool
      let pool = new Pool(
        tokens[`${routes[i].tokenIn.symbol}`],
        tokens[`${routes[i].tokenOut.symbol}`],
        parseInt(routes[i].fee),
        routes[i].sqrtRatioX96,
        routes[i].liquidity,
        parseInt(routes[i].tickCurrent)
      )
      pools.push(pool);
    }
    let tokenIn = tokens[`${routes[0].tokenIn.symbol}`]
    let tokenOut = tokens[`${routes[routes.length-1].tokenOut.symbol}`];

    //=============create routes parameters
    tradeParams.routes.push(
      {
        route: new Route(pools,tokenIn , tokenOut),
        inputAmount: CurrencyAmount.fromRawAmount(tokenIn, JSBI.BigInt(routes[0].amountIn as string)),
        outputAmount: CurrencyAmount.fromRawAmount(tokenOut, JSBI.BigInt(routes[routes.length-1].amountOut as string))
      }
    )
  }
  
  describe('#priceImpact', () => {
    describe('tradeType = EXACT_INPUT', ()=>{
        const exactInMultipleRoutes = Trade.createUncheckedTradeWithMultipleRoutes(tradeParams)
        it('is correct with multiple routes', async () => {
            console.log(exactInMultipleRoutes.priceImpact.toSignificant(10));
        })
    })
  })
})