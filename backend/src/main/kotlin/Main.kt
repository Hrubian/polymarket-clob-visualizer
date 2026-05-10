package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "103228450322319378884705269246459229371438439613877432951550603198142492904655",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}