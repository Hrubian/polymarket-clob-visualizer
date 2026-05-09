package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "9586779694216347096175051358708623441888553189856923555182084516297146433132",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}