package org.example

import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class PriceQuantityPair(
    val price: Double,
    val quantity: Double,
)

// L2 data snapshot
@Serializable
data class OrderBookDTO(
    val epochTimestamp: Long,
    val bids: List<PriceQuantityPair>, // Sorted best first
    val asks: List<PriceQuantityPair>, // Sorted best first
//    val tradeEvents: List<Double>, // prices
)