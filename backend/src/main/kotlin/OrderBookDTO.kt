package org.example

import kotlinx.serialization.Serializable
import java.time.Instant

// L2 data snapshot
@Serializable
data class OrderBookDTO(
    val epochTimestamp: Long,
    val bids: List<Pair<Double, Double>>, // price to quantity, ordered - best first
    val asks: List<Pair<Double, Double>>, // price to quantity, ordered - best first
//    val tradeEvents: List<Double>, // prices
)