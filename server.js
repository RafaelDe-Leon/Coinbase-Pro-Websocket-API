const WebSocket = require("ws")

// matches
// ${coin-USD}: price view.
// ${coin-USD}: matches view.
// #{coin-USD} u: unsubscribe symbol.
// system: system status of subscribed coins atm
// system <number>: change refresh interval in milliseconds

const wss = new WebSocket.Server({ port: 8080 })

const supportedPairs = ["BTC-USD", "ETH-USD", "XRP-USD", "LTC-USD"]

const commandPairs = ["SYSTEM", "QUIT"]
let subscriptions = []
let stopLogging = false

const subscribeMessage = ticker => {
  return {
    type: "subscribe",
    product_ids: [ticker],
    channels: [
      "level2",
      "heartbeat",
      {
        name: "ticker",
        product_ids: [ticker],
      },
    ],
  }
}

const unsubscribeMessage = ticker => {
  return {
    type: "unsubscribe",
    product_ids: [ticker],
    channels: [
      "level2",
      "heartbeat",
      {
        name: "ticker",
        product_ids: [ticker],
      },
    ],
  }
}

const statusMessage = () => {
  return {
    type: "subscriptions",
    product_ids: ["ETH-USD", "BTC-USD"],
    channels: [{ name: "status" }],
  }
}

wss.on("connection", function connection(ws) {
  console.log("connected to localhost")
  ws.on("message", function incoming(message) {
    // read the message to get the data from client
    let readData = message.toString("utf8").toUpperCase()

    console.log(readData)

    const [ticker, command] = readData.split(" ")

    if (!supportedPairs.includes(ticker)) {
      throw new Error(`${ticker} is not supported)`)
    }

    // if (!commandPairs.includes(ticker)) {
    //   throw new Error(`${ticker} is not supported)`)
    // }

    // create a WebSocket client and connect to the coinbase's api
    const client = new WebSocket("wss://ws-feed.exchange.coinbase.com")

    client.on("open", function open() {
      // send the parameters to the third-party
      // handleString(myArray[0], myArray[1])

      if (ticker !== undefined && supportedPairs.includes(ticker)) {
        let subMsg = JSON.stringify(subscribeMessage(ticker))
        // stopLogging = false
        console.log(subMsg)
        client.send(subMsg)
        subscriptions.push(ticker)
        console.log(subscriptions)
      }

      if (command !== undefined && command === "U") {
        console.log(JSON.stringify(unsubscribeMessage(ticker)))
        let unsubMsg = JSON.stringify(unsubscribeMessage(ticker))
        // stopLogging = true
        client.send(unsubMsg)
        subscriptions = subscriptions.filter(item => item !== ticker)
        console.log("this is unsub pop", subscriptions)
      }

      if (ticker !== undefined && ticker === "SYSTEM") {
        let statusMsg = JSON.stringify(statusMessage())
        client.send(statusMsg)
      }

      if (ticker !== undefined && ticker === "QUIT") {
        client.close(1000, "Closing the connection")
        console.log("closing")
        wss.close()
      }
    })
    client.on("message", function incoming(response) {
      let data = JSON.parse(response)
      // console.log(data)
      if (stopLogging) {
        if (data.type === "subscriptions") {
          console.log(data)
          // ws.send(`Sucessfully unsubbed from ${}${data.type}`)
        }
      }

      if (data.type === "status") {
        console.log(data)
      }

      if (stopLogging === false && data.type === "ticker") {
        console.log(`${data.product_id}  ${data.price}`)
        ws.send(`${data.product_id}  ${data.price}`)
      }
      // ws.send(data.product_id)
    })
  })
})

wss.on("close", function () {
  console.log("exiting")
  process.exitCode = 1
})

// {
//   "type":"ticker",
//  "sequence":40171035134,
//  "product_id":"ETH-USD",
//  "price":"1188.83",
//  "open_24h":"1209.59",
//  "volume_24h":"266418.56949554",
//  "low_24h":"1182.43",
//  "high_24h":"1221.6",
//  "volume_30d":"9015950.90516125",
//  "best_bid":"1188.80",
//  "best_bid_size":"0.25233945",
//  "best_ask":"1188.92",
//  "best_ask_size":"0.25234148",
//  "side":"sell",
//  "time":"2022-12-22T18:30:21.581204Z",
// "trade_id":402764609,
//  "last_size":"0.3"
// }
