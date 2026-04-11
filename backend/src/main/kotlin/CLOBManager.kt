package org.example

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.ReceiveChannel
import kotlinx.coroutines.channels.produce
import kotlinx.serialization.Serializable
import kotlin.random.Random

@Serializable
data class L1(
    val bidPrice: Double,
    val askPrice: Double,
)

fun String.toSide() = when (this) {
    "BUY" -> Side.Buy
    "SELL" -> Side.Sell
    else -> error("Unrecognized side: $this")
}

class CLOBManager(val listenedId: String) {
    @OptIn(ExperimentalCoroutinesApi::class)
    fun runIn(scope: CoroutineScope, polymarketEvents: ReceiveChannel<PolymarketEvent>, ): ReceiveChannel<L1> = scope.produce {
        val clob = CLOB()
        var cachedBestBid = 0.5
        var cachedBestAsk = 0.5

        for (event in polymarketEvents) {
            when (event) {
                is BookEvent -> {
                    if (event.asset_id != listenedId)
                        continue

                    val bids = event.bids.associate { it.price.toDouble() to it.size.toDouble() }
                    val asks = event.asks.associate { it.price.toDouble() to it.size.toDouble() }
                    clob.onInitBook(
                        bids = bids,
                        asks = asks,
                    )
                    cachedBestAsk = clob.bestAsk()
                    cachedBestBid = clob.bestBid()
                    send(L1(cachedBestBid, cachedBestAsk))
                }
                is LastTradePriceEvent -> {}
                is PriceChangeEvent -> {
//                    event.price_changes.forEach { priceChange ->
//                        if (priceChange.asset_id == listenedId) {
//                            clob.onPriceChange(
//                                price = priceChange.price.toDouble(),
//                                quantity = priceChange.size.toDouble(),
//                                side = priceChange.side.toSide()
//                            )
//                        }
//                    }
                    clob.onPriceChange(
                        price = Random.nextDouble(),
                        quantity = Random.nextInt(2).toDouble(),
                        side = Side.Buy
                    )
                    clob.onPriceChange(
                        price = Random.nextDouble(clob.bestBid()),
                        quantity = Random.nextInt(2).toDouble(),
                        side = Side.Sell
                    )
                    val newBestBid = clob.bestBid()
                    val newBestAsk = clob.bestAsk()
                    if (newBestAsk != cachedBestAsk || newBestBid != cachedBestBid) {
                        println("Best changed!!!")
                        cachedBestBid = newBestBid
                        cachedBestAsk = newBestAsk
                        send(L1(cachedBestBid, cachedBestAsk))
                    }
                }
            }
        }
    }
}
