package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "56065298366781156898452324742065301480020898113283231169133634067492047724212",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}