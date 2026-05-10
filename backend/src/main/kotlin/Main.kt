package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "75845920741796858670183364159540464375486880005358999101126589340494255300090",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}