package org.example

import kotlinx.coroutines.coroutineScope

val tokens = listOf(
//    "16894424691858208925745474726543713759924126381815674402361002638388880101929",
    "17928724382258631631719579012359945400865032871287932503640701089143599914494",
)

suspend fun main(): Unit = coroutineScope {
    val client = WebsocketClient()
    val server = WebsocketServer()
    val manager = CLOBManager(tokens.last())

    val events = client.runIn(this)
    val l1Data = manager.runIn(this, events)
    server.runIn(this, l1Data)
}