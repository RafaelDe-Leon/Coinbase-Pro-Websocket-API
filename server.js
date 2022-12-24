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

let subscriptions = []
let matchViewArray = []

let subscriptionLog = false
let systemLog = false
let matchesView = false

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

const emptyAndAdd = (arr, element) => {
  arr.length = 0
  arr.push(element)
}

wss.on("connection", function connection(ws) {
  console.log("connected to localhost")
  ws.send("Please input one of these symbols to start ETH-USD, BTC-USD")
  ws.on("message", function incoming(message) {
    // read the message to get the data from client
    let readData = message.toString("utf8").toUpperCase()

    const [ticker, command] = readData.split(" ")

    // only accept these pairs from the list
    if (!supportedPairs.includes(ticker)) {
      throw new Error(`${ticker} is not supported)`)
    }

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

        matchesView = false
        systemLog = false
        subscriptionLog = true
        emptyAndAdd(matchViewArray) // empties matchArray
        addSubbed(ticker)
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
        matchesView = false

        cbWebSocket.send(unsubMsg)
        subscriptions = subscriptions.filter(item => item !== ticker)

        ws.send(`succesfully unsubbed from ${ticker}`)
      }

      // matches view
      if (
        command !== undefined &&
        command === "M" &&
        subscriptions.includes(ticker)
      ) {
        // console.log(JSON.stringify(unsubscribeMessage(ticker)))
        // let unsubMsg = JSON.stringify(unsubscribeMessage(ticker))
        subscriptionLog = false
        systemLog = false
        matchesView = true

        // matchViewArray = []
        // matchViewArray.push(ticker)

        emptyAndAdd(matchViewArray, ticker)

        // cbWebSocket.send(unsubMsg)
        // subscriptions = subscriptions.filter(item => item !== ticker)

        // ws.send(`succesfully unsubbed from ${ticker}`)
      }

      if (ticker !== undefined && ticker === "SYSTEM") {
        let statusMsg = JSON.stringify(statusMessage())
        subscriptionLog = false
        systemLog = true

        cbWebSocket.send(statusMsg)
      }

      if (ticker !== undefined && ticker === "QUIT") {
        cbWebSocket.close(1000, "Closing the connection")
        console.log("closing")
        wss.close()
        subscriptions = []
        ws.send("Programmed Closed")
        ws.send(
          "To receive new data, Please input the pair you want to connect"
        )
      }
    })

    cbWebSocket.on("message", function incoming(response) {
      let data = JSON.parse(response)

      if (
        subscriptions.includes(ticker) &&
        subscriptionLog === true &&
        data.type === "ticker"
      ) {
        console.log(data.product_id, data.price)
        ws.send(`${data.product_id} ${data.price}`)
      }

      if (systemLog === true) {
        console.log(data)
        console.log(systemLog)
      }

      if (matchesView === true) {
        if (data.type === "l2update") {
          return
        } else if (data.type === "hearbeat") {
          return
          // ws.send(data.product_id, data.price)
        } else if (matchViewArray.includes(ticker) && data.type == "ticker") {
          console.log(ticker)
          console.log(data.time, data.product_id, data.last_size, data.price)
          ws.send(
            `${data.time} ${data.product_id} ${data.last_size} ${data.price}`
          )
        }
      }
    })
  })
})

// wss.on("close", function () {
//   console.log("exiting")
//   process.exitCode = 1
// })
