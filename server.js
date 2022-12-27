const WebSocket = require('ws')
// const { setInterval, clearInterval, setTimeout } = require('timers')

const wss = new WebSocket.Server({ port: 8080 })

const supportedPairs = ['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD']
const supportedCommands = ['SYSTEM', 'QUIT']

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
  connections[id].send(`New connection with id ${id}`)
  connections[id].send(
    'Please input one of these symbols to start ETH-USD, BTC-USD, XRP-USD, LTC-USD'
  )

  // arrays to keep track
  let subscriptions = []
  let matchViewArray = []

  // view changes variables
  let subscriptionLog = false
  let systemLog = false
  let matchesView = false
  let intervalLog = false

  // when message is receive from user
  connections[id].on('message', function incoming(message) {
    // read the message to get the data from client
    let readData = message.toString('utf8').toUpperCase()

    const [ticker, command] = readData.split(' ')

    // only accept these pairs from the list supportedPairs
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
        connections[id].send(
          `${ticker} has been already subbed, please unsub first`
        )
        return
      } else {
        subscriptions.push(ticker)
        console.log(`${ticker} has successfully been subbed`)
        connections[id].send(`${ticker} has successfully been subbed`)
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
          connections[id].send(`Viewing ${ticker} prices`)
        }

        if (supportedCommands.includes(ticker)) {
          supportedCommands.push(ticker)
          console.log(supportedCommands)
        }
        matchView = false
        systemLog = false
        subscriptionLog = true
        intervalLog = false
        emptyAndAdd(matchViewArray) // empties matchArray
        addSubbed(ticker)
        cbWebSocket.send(subMsg)
      }

      // unsubscribe
      if (
        command !== undefined &&
        command === 'U' &&
        subscriptions.includes(ticker)
      ) {
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
          connections[id].send(
            'You are currently, not subscribed to any product. Please Subscribe to view prices'
          )
        }

        connections[id].send(`succesfully unsubbed from ${ticker}`)
      }

      // matches view
      if (
        command !== undefined &&
        command === 'M' &&
        subscriptions.includes(ticker)
      ) {
        connections[id].send(`switched to view ${ticker} in details`)
        subscriptionLog = false
        systemLog = false
        matchesView = true

        // empty the matchViewArray and then add current ticker
        emptyAndAdd(matchViewArray, ticker)
      }

      // show which are subscribed at the moment
      if (ticker !== undefined && ticker === 'SYSTEM') {
        // let statusMsg = JSON.stringify(statusMessage())
        subscriptionLog = false
        systemLog = true
      }

      // change interval - NYI
      if (ticker !== undefined && ticker === 'SYSTEM' && command === '1') {
        matchesView = false
        systemLog = false
        subscriptionLog = false
        intervalLog = true
      }

      // close the program if quit request is passed
      if (ticker !== undefined && ticker === 'QUIT') {
        ws.send('Program Closed')
        console.log('closing')
        ws.close()
        delete connections[id]

        // if no connections are available close node server
        if (Object.keys(connections).length === 0) {
          console.log('Closing server in 3 secs')
          // Close the server after 5 seconds
          setTimeout(() => {
            process.exit() // shuts down node if no connections
          }, 3000)
        }
      }
    })

    // when coinbase send message back to our server
    cbWebSocket.on('message', function incoming(response) {
      let data = JSON.parse(response)

      // interval change
      if (intervalLog && data.type === 'ticker') {
        const interval = setInterval(() => {
          console.log(data.price)
          connections[id].send(
            `Symbol: ${data.product_id} Current Price: ${data.price}`
          )
          if (intervalLog === false) {
            clearInterval(interval)
          }
        }, 5000)
      }

      // subscribe message back to user showing prices
      if (
        subscriptions.includes(ticker) &&
        subscriptionLog === true &&
        data.type === 'ticker'
      ) {
        console.log(data.product_id, data.price)
        connections[id].send(
          `Symbol: ${data.product_id} Current Price: ${data.price}`
        )
      }

      // let user know which one they are subscribed to
      if (systemLog === true) {
        console.log(`You are subscribed to ${subscriptions} at the moment`)
        connections[id].send(
          `You are subscribed to ${subscriptions} at the moment`
        )
        systemLog = false // disable system view
        connections[id].send(
          `Enabling Prices View after 10 seconds if no commands are given`
        )
        setTimeout(() => {
          subscriptionLog = true // will resume subscriptionsLog in 5 seconds
        }, 10000)
      }

      // Show detail if matchView is true
      if (matchesView === true) {
        if (matchViewArray.includes(ticker) && data.type == 'ticker') {
          console.log(data.time, data.product_id, data.last_size, data.price)
          connections[id].send(
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

  connections[id].on('error', err => {
    console.error(`An error occured: ${err.message}`)
  })
})
