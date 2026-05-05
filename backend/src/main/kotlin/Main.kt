package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "92594293704298016092761818613265642930232342909385537127801515855670829987680",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}