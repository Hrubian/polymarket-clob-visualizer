package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "102610274161280432668265351706992238584873110720411276571495067126108094866776",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}