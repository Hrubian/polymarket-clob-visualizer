package org.example

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonClassDiscriminator

@OptIn(ExperimentalSerializationApi::class)
@Serializable
@JsonClassDiscriminator("event_type")
sealed class PolymarketEvent {
    abstract val event_type: String
}

@Serializable
@SerialName("price_change")
data class PriceChangeEvent(
    val market: String,
    val price_changes: List<PriceChange>,
    val timestamp: String,
    override val event_type: String
) : PolymarketEvent()

@Serializable
@SerialName("last_trade_price")
data class LastTradePriceEvent(
    val market: String,
    val asset_id: String,
    val price: String,
    val size: String,
    val fee_rate_bps: String,
    val side: String,
    val timestamp: String,
    val transaction_hash: String,
    override val event_type: String
) : PolymarketEvent()

@Serializable
@SerialName("book")
data class BookEvent(
    val market: String,
    val asset_id: String,
    val timestamp: String,
    val hash: String,
    val bids: List<OrderLevel>,
    val asks: List<OrderLevel>,
    val tick_size: String? = null,
    val last_trade_price: String? = null,
    override val event_type: String
) : PolymarketEvent()

@Serializable
data class PriceChange(
    val asset_id: String,
    val price: String,
    val size: String,
    val side: String,
    val hash: String,
    val best_bid: String,
    val best_ask: String
)

@Serializable
data class OrderLevel(
    val price: String,
    val size: String
)