package org.example

import io.ktor.serialization.kotlinx.KotlinxWebsocketSerializationConverter
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.sendSerialized
import io.ktor.server.websocket.webSocket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.ReceiveChannel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.consumeAsFlow
import kotlinx.coroutines.flow.shareIn
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory

class WebsocketServer {
    fun runIn(scope: CoroutineScope, l2Data: ReceiveChannel<OrderBookDTO>) = scope.launch(Dispatchers.IO) {
        val logger = LoggerFactory.getLogger("Server")
        val sharedFlow = l2Data.consumeAsFlow().shareIn(
            scope = scope,
            started = SharingStarted.Lazily,
            replay = 300, // TODO? :)
        )
        embeddedServer(Netty, port = 8080) {
            install(WebSockets) {
                contentConverter = KotlinxWebsocketSerializationConverter(Json)
            }
            routing {
                webSocket("/l2") {
                    logger.info("L2 session started")
                    sharedFlow.collect { sendSerialized(it) }
                }
            }
        }.start(wait = true)
    }
}