package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
    "3831916093347698404908399697805409750101040773837575625754640696569268558613",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l2Data = manager.runIn(this, events)
    server.runIn(this, l2Data)
}