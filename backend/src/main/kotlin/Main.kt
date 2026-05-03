package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "104148857338957410048710628169824124473412050075804119012672719787902752931775",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}