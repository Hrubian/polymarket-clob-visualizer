package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "6197343592574316655793727388081514493240050911571720414410708366966291048172",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}