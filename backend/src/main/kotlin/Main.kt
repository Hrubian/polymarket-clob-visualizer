package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "28028568436890576123984499838912545144607605070912308394628917172544760436862",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}