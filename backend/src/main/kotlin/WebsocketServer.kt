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
    fun runIn(scope: CoroutineScope, prices: ReceiveChannel<L1>) = scope.launch(Dispatchers.IO) {
        val logger = LoggerFactory.getLogger("Server")
        val sharedFlow = prices.consumeAsFlow().shareIn(
            scope = scope,
            started = SharingStarted.Lazily,
            replay = 5, // TODO? :)
        )
        embeddedServer(Netty, port = 8080) {
            install(WebSockets) {
                contentConverter = KotlinxWebsocketSerializationConverter(Json)
            }
            routing {
                webSocket("/prices") {
                    logger.info("New session started")
                    sharedFlow.collect {
                        logger.debug("Sending new price to the client: {}", it)
                        sendSerialized(it)
                    }
                }
            }
        }.start(wait = true)
    }
}