package org.example


enum class Side { Buy, Sell }

class CLOB {
    private val bids = sortedMapOf<Double, Double>() // price to quantity
    private val asks = sortedMapOf<Double, Double>()

    fun onInitBook(bids: Map<Double, Double>, asks: Map<Double, Double>) {
        this.bids.clear()
        this.asks.clear()
        this.bids.putAll(bids) // TODO check non-zero quantity
        this.asks.putAll(asks)
    }

    fun onPriceChange(price: Double, quantity: Double, side: Side) {
        val map = when (side) {
            Side.Buy -> bids
            Side.Sell -> asks
        }
        if (quantity == 0.0) { // TODO is the comparison ok?
            map.remove(price)
        } else {
            map[price] = quantity
        }
    }

    fun getBids(): List<PriceQuantityPair> = bids.toList().map { it.toPriceQuantity() }.reversed() // TODO will be faster if we keep it reversed in the sorted map
    fun getAsks(): List<PriceQuantityPair> = asks.toList().map { it.toPriceQuantity() }

    fun bestBid(): Double = bids.maxOfOrNull { it.key } ?: 1.0
    fun bestAsk(): Double = asks.minOfOrNull { it.key } ?: 0.0 // TODO constants for the prices

    private fun Pair<Double, Double>.toPriceQuantity(): PriceQuantityPair = PriceQuantityPair(this.first, this.second)
}