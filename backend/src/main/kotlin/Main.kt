package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "22738604660557321780761578420118016749027563268201595763789441772230090847247",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}