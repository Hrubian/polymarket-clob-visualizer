package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "52594946934243307123328435251113916659658125138147059621019397766325991605639",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}