const WebSocket = require("ws")

// matches
// ${coin-USD}: price view.
// ${coin-USD}: matches view.
// #{coin-USD} u: unsubscribe symbol.
// system: system status of subscribed coins atm
// system <number>: change refresh interval in milliseconds

const wss = new WebSocket.Server({ port: 8080 })

const supportedPairs = [
  "BTC-USD",
  "ETH-USD",
  "XRP-USD",
  "LTC-USD",
  "SYSTEM",
  "QUIT",
]

// const commandPairs = ["SYSTEM", "QUIT"]
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

const addSubbed = ticker => {
  if (subscriptions.includes(ticker)) {
    console.log(`${ticker} has been already subbed, please unsub first`)
    return
  } else {
    subscriptions.push(ticker)
    console.log(`${ticker} has successfully been subbed`)
  }
}

wss.on("connection", function connection(ws) {
  console.log("connected to localhost")
  ws.on("message", function incoming(message) {
    // read the message to get the data from client
    let readData = message.toString("utf8").toUpperCase()

    const [ticker, command] = readData.split(" ")

    if (!supportedPairs.includes(ticker)) {
      throw new Error(`${ticker} is not supported)`)
    }

    // if (!commandPairs.includes(ticker)) {
    //   throw new Error(`${ticker} is not supported)`)
    // }

    // create a WebSocket client and connect to the coinbase's api
    const cbWebSocket = new WebSocket("wss://ws-feed.exchange.coinbase.com")

    cbWebSocket.on("open", function open() {
      // subscribe
      if (
        ticker !== undefined &&
        supportedPairs.includes(ticker) &&
        command === undefined
      ) {
        let subMsg = JSON.stringify(subscribeMessage(ticker))
        // stopLogging = false
        console.log(subMsg)
        addSubbed(ticker)
        console.log(subscriptions)
        console.log("subscribed ran")
        cbWebSocket.send(subMsg)
        ws.send(`succesfully subscribed to ${ticker}`)
      }

      // unsubscribe
      if (
        command !== undefined &&
        command === "U" &&
        subscriptions.includes(ticker)
      ) {
        console.log(JSON.stringify(unsubscribeMessage(ticker)))
        let unsubMsg = JSON.stringify(unsubscribeMessage(ticker))
        // stopLogging = true
        cbWebSocket.send(unsubMsg)
        subscriptions = subscriptions.filter(item => item !== ticker)
        console.log("unsub ran")
        ws.send(`succesfully unsubbed from ${ticker}`)
      }

      if (ticker !== undefined && ticker === "SYSTEM") {
        let statusMsg = JSON.stringify(statusMessage())
        cbWebSocket.send(statusMsg)
        console.log("system ran")
      }

      if (ticker !== undefined && ticker === "QUIT") {
        cbWebSocket.close(1000, "Closing the connection")
        console.log("closing")
        wss.close()
        subscriptions = subscriptions.filter(item => item !== ticker)
        console.log("quit ran")
      }
    })

    cbWebSocket.on("message", function incoming(response) {
      let data = JSON.parse(response)
      if (stopLogging) {
      }

      if (data.type === "subscriptions") {
        console.log(data.channels)

        // ws.send(`Sucessfully unsubbed from ${}${data.type}`)
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

// wss.on("close", function () {
//   console.log("exiting")
//   process.exitCode = 1
// })
