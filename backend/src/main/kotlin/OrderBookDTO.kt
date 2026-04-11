package org.example

import java.time.Instant

data class OrderBookDTO(
    val timestamp: Instant,
    val bids: List<Pair<Double, Double>>, // price to quantity, ordered - best first
    val asks: List<Pair<Double, Double>>, // price to quantity, ordered - best first
    val tradeEvents: List<Double>, // prices
)