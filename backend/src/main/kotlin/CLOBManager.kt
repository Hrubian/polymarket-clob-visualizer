package org.example

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.ReceiveChannel
import kotlinx.coroutines.channels.produce
import java.time.Instant

fun String.toSide() = when (this) {
    "BUY" -> Side.Buy
    "SELL" -> Side.Sell
    else -> error("Unrecognized side: $this")
}

class CLOBManager(val listenedId: String) {
    @OptIn(ExperimentalCoroutinesApi::class)
    fun runIn(scope: CoroutineScope, polymarketEvents: ReceiveChannel<PolymarketEvent>): ReceiveChannel<OrderBookDTO> = scope.produce {
        val clob = CLOB()

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
                    send(OrderBookDTO(
                        epochTimestamp = Instant.now().toEpochMilli(),
                        bids = clob.getBids(),
                        asks = clob.getAsks(),
                    ))
                }
                is LastTradePriceEvent -> {}
                is PriceChangeEvent -> {
                    event.price_changes.forEach { priceChange ->
                        if (priceChange.asset_id == listenedId) {
                            clob.onPriceChange(
                                price = priceChange.price.toDouble(),
                                quantity = priceChange.size.toDouble(),
                                side = priceChange.side.toSide()
                            )
                        }
                    }
//                    clob.onPriceChange(
//                        price = Random.nextDouble(),
//                        quantity = Random.nextInt(2).toDouble(),
//                        side = Side.Buy
//                    )
//                    clob.onPriceChange(
//                        price = Random.nextDouble(clob.bestBid()),
//                        quantity = Random.nextInt(2).toDouble(),
//                        side = Side.Sell
//                    )
                    send(OrderBookDTO(
                        epochTimestamp = Instant.now().toEpochMilli(),
                        bids = clob.getBids(),
                        asks = clob.getAsks(),
                    ))
                }
            }
        }
    }
}
