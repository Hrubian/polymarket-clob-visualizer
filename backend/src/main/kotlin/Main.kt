package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "48324193331580955728461656511772814080482770289623109553811707553852665312499",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}