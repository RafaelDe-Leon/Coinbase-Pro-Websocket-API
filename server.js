const WebSocket = require('ws')
// const { setInterval, clearInterval, setTimeout } = require('timers')

const wss = new WebSocket.Server({ port: 8080 })

const supportedPairs = ['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD']

const supportedCommands = ['SYSTEM', 'QUIT']

let subscriptions = []
let matchViewArray = []
let savedVar

let subscriptionLog = false
let systemLog = false
let matchesView = false
let intervalLog = false

const subscribeMessage = (type, ticker, level, channel) => {
  return {
    type: type,
    product_ids: [ticker],
    channels: [level, channel],
  }
}

const emptyAndAdd = (arr, element) => {
  arr.length = 0
  arr.push(element)
}

const connections = {}

wss.on('connection', function connection(ws, req) {
  const id = req.headers['sec-websocket-key'] // get the key from header and assign it to id
  connections[id] = ws
  console.log(`New connection with id ${id}`)
  ws.send(`New connection with id ${id}`)
  ws.send(
    'Please input one of these symbols to start ETH-USD, BTC-USD, XRP-USD, LTC-USD'
  )
  ws.on('message', function incoming(message) {
    // read the message to get the data from client
    let readData = message.toString('utf8').toUpperCase()

    const [ticker, command] = readData.split(' ')

    // only accept these pairs from the list
    if (
      !supportedPairs.includes(ticker) &&
      !supportedCommands.includes(ticker)
    ) {
      throw new Error(`${ticker} is not supported)`)
    }

    // if already subbed log out message if else add sub to array
    const addSubbed = ticker => {
      if (subscriptions.includes(ticker)) {
        console.log(`${ticker} has been already subbed, please unsub first`)
        ws.send(`${ticker} has been already subbed, please unsub first`)
        return
      } else {
        subscriptions.push(ticker)
        console.log(`${ticker} has successfully been subbed`)
        ws.send(`${ticker} has successfully been subbed`)
      }
    }

    // create a WebSocket client and connect to the coinbase's api
    const cbWebSocket = new WebSocket('wss://ws-feed.exchange.coinbase.com')

    cbWebSocket.on('open', function open() {
      // subscribe
      if (
        ticker !== undefined &&
        supportedPairs.includes(ticker) &&
        command === undefined
      ) {
        let subMsg = JSON.stringify(
          subscribeMessage('subscribe', ticker, 'level2', 'ticker')
        )

        if (subscriptions.includes(ticker)) {
          console.log(`Viewing ${ticker} prices`)
          ws.send(`Viewing ${ticker} prices`)
        }

        if (supportedCommands.includes(ticker)) {
          supportedCommands.push(ticker)
          console.log(supportedCommands)
        }
        matchesView = false
        systemLog = false
        subscriptionLog = true
        intervalLog = false
        emptyAndAdd(matchViewArray) // empties matchArray
        addSubbed(ticker)
        cbWebSocket.send(subMsg)
      }

      if (
        command !== undefined &&
        command === 'U' &&
        subscriptions.includes(ticker)
      ) {
        // unsubscribe
        let unsubMsg = JSON.stringify(
          subscribeMessage('unsubscribe', ticker, 'level2', 'ticker')
        )
        matchesView = false
        subscriptionLog = true
        intervalLog = false

        cbWebSocket.send(unsubMsg)
        subscriptions = subscriptions.filter(item => item !== ticker)

        // sends if subscription is empty
        if (subscriptions.length <= 0) {
          console.log('Please Subscribe to view prices')
          ws.send(
            'You are currently, not subscribed to any product. Please Subscribe to view prices'
          )
        }

        ws.send(`succesfully unsubbed from ${ticker}`)
      }

      // matches view
      if (
        command !== undefined &&
        command === 'M' &&
        subscriptions.includes(ticker)
      ) {
        ws.send(`switched to view ${ticker} in details`)
        subscriptionLog = false
        systemLog = false
        matchesView = true

        emptyAndAdd(matchViewArray, ticker)
      }

      if (ticker !== undefined && ticker === 'SYSTEM') {
        // let statusMsg = JSON.stringify(statusMessage())
        subscriptionLog = false
        systemLog = true
        // run the variable with the json data to display in the console and user side
        // cbWebSocket.send(statusMsg)
      }

      if (ticker !== undefined && ticker === 'SYSTEM' && command === '1') {
        matchesView = false
        systemLog = false
        subscriptionLog = false
        intervalLog = true
      }

      if (ticker !== undefined && ticker === 'QUIT') {
        ws.send('Program Closed')
        console.log('closing')
        connections[id].close()
        delete connections[id]

        if (Object.keys(connections).length === 0) {
          console.log('Closing server in 3 secs')
          // Close the server after 5 seconds
          setTimeout(() => {
            process.exit() // shuts down node if no connections
          }, 3000)
        }
      }
    })

    cbWebSocket.on('message', function incoming(response) {
      let data = JSON.parse(response)

      if (intervalLog && data.type === 'ticker') {
        const interval = setInterval(() => {
          console.log(data.price)
          ws.send(`Symbol: ${data.product_id} Current Price: ${data.price}`)
          if (intervalLog === false) {
            clearInterval(interval)
          }
        }, 5000)
      }

      if (
        subscriptions.includes(ticker) &&
        subscriptionLog === true &&
        data.type === 'ticker'
      ) {
        console.log(data.product_id, data.price)
        ws.send(`Symbol: ${data.product_id} Current Price: ${data.price}`)
      }

      if (systemLog === true) {
        // console.log(latestSubscriptions.channels.map(e => e.name))
        // console.log(latestSubscriptions.channels.map(e => e.product_ids))
        console.log(`You are subscribed to ${subscriptions} at the moment`)
        ws.send(`You are subscribed to ${subscriptions} at the moment`)
        // ws.send(latestSubscriptions)
        systemLog = false // disable system view
        ws.send(
          `Enabling Prices View after 10 seconds if no commands are given`
        )
        setTimeout(() => {
          subscriptionLog = true // will resume subscriptionsLog in 5 seconds
        }, 10000)
      }

      if (matchesView === true) {
        if (matchViewArray.includes(ticker) && data.type == 'ticker') {
          console.log(data.time, data.product_id, data.last_size, data.price)
          ws.send(
            `Date and Time: ${data.time} 
            Symbol: ${data.product_id} 
            Last-Trade: ${data.last_size}
            Current Price: ${data.price}`
          )
        } else {
          return
        }
      }
    })

    cbWebSocket.on('close', () => {
      return
    })
  })

  ws.on('error', err => {
    console.error(`An error occured: ${err.message}`)
  })
})
