package org.example

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.client.plugins.websocket.sendSerialized
import io.ktor.client.plugins.websocket.webSocket
import io.ktor.serialization.kotlinx.KotlinxWebsocketSerializationConverter
import io.ktor.websocket.Frame
import io.ktor.websocket.readText
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.ReceiveChannel
import kotlinx.coroutines.channels.produce
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.decodeFromJsonElement
import org.slf4j.LoggerFactory
import kotlin.collections.map

class WebsocketClient {
    @OptIn(ExperimentalCoroutinesApi::class)
    fun runIn(scope: CoroutineScope): ReceiveChannel<PolymarketEvent> = scope.produce(Dispatchers.IO) {
        val logger = LoggerFactory.getLogger("Client")
        HttpClient(CIO) {
            install(Logging)
            install(WebSockets) {
                contentConverter = KotlinxWebsocketSerializationConverter(Json)
            }
        }.use { client ->
//    val response = client.get("https://gamma-api.polymarket.com/events?slug=us-x-iran-ceasefire-by")
            val json = Json {
                classDiscriminator = "event_type"
                ignoreUnknownKeys = true
            }

            client.webSocket("wss://ws-subscriptions-clob.polymarket.com/ws/market") {
                sendSerialized(MarketRequest("market", tokens))
                logger.info("Connected to websocket")

                while (isActive) {
                    val incomingMsg = (incoming.receive() as Frame.Text).readText()
                    logger.debug("Received msg from Polymarket: $incomingMsg")

                    val jsonArray = when (val jsonElement = Json.parseToJsonElement(incomingMsg)) {
                        is JsonArray -> jsonElement
                        is JsonObject -> JsonArray(listOf(jsonElement))
                        else -> {
                            logger.error("Received unexpected json content: $incomingMsg")
                            JsonArray(emptyList())
                        }
                    }

                    val events = jsonArray.map { json.decodeFromJsonElement<PolymarketEvent>(it) }
                    events.forEach { this@produce.send(it) }
                }
            }
        }
    }
}

@Serializable
data class MarketRequest(
    val type: String,
    @SerialName("assets_ids")
    val assetsIds: List<String>,
    @SerialName("custom_feature_enabled")
    val customFeatureEnabled: Boolean = true,
)

@Serializable
data class AssetsOperation(
    @SerialName("assets_ids")
    val assetsIds: List<String>,
    val operation: String
)
