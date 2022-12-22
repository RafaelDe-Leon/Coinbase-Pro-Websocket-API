const WebSocket = require('ws')

// matches
// ${coin-USD}: price view.
// ${coin-USD}: matches view.
// #{coin-USD} u: unsubscribe symbol.
// system: system status of subscribed coins atm
// system <number>: change refresh interval in milliseconds

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    // read the message to get the data from client
    let readData = message.toString('utf-8').toUpperCase()

    const myArray = readData.split(' ')
    console.log(myArray)

    // // sub
    // let request = {
    //   type: 'subscribe',
    //   product_ids: [`${myArray[0]}`],
    //   channels: ['ticker'],
    // }

    // if (myArray[1] === 'u') {
    //   request = {
    //     type: 'unsubscribe',
    //     channels: ['hearbeat'],
    //   }
    // }

    // if (myArray[1] === undefined) {
    //   request = {
    //     type: 'subscribe',
    //     product_ids: [`${myArray[0]}`],
    //     channels: ['ticker'],
    //   }
    // }

    // create a WebSocket client and connect to the coinbase's api
    const client = new WebSocket('wss://ws-feed.exchange.coinbase.com')

    client.on('open', function open() {
      // send the parameters to the third-party
      // console.log(JSON.stringify(request))
      // client.send(JSON.stringify(request)) // parses data as a json to coinbase

      const inputOne = myArray[0]
      switch (inputOne) {
        case 'SYSTEM':
          sendMessage('subscribe', ['status'])
          break
        case 'BTC-USD':
          sendMessage('subscribe', [`${myArray[0]}`], ['ticker'])
          break
        case 'ETH-USD':
          sendMessage('subscribe', [`${myArray[0]}`], ['ticker'])
          break
        case 'XRP-USD':
          sendMessage('subscribe', [`${myArray[0]}`], ['ticker'])
          break
        case 'LTC-USD':
          sendMessage('subscribe', [`${myArray[0]}`], ['ticker'])
          break
        default:
          console.log('Invalid Input')
      }

      const inputTwo = myArray[1]
      switch (inputTwo) {
        case 'U':
          sendMessage('unsubscribe', [`${myArray[0]}`], ['heartbeat'])
          break
        default:
          sendMessage('subscribe', [`${myArray[0]}`], ['ticker'])
      }

      function sendMessage(type, productIds, channels) {
        const request = {
          type: type,
          product_ids: productIds,
          channels: channels,
        }
        // console.log(request.type, request.product_ids, request.channels)
        client.send(JSON.stringify(request))
      }
    })

    // logs data to the console on the client side
    client.on('message', function incoming(response) {
      let data = JSON.parse(response)

      if (data.type !== 'ticker') {
        return
      }

      if (data.product_id === myArray[0]) {
        console.log(`${myArray[0]} Price: ${data.price}`)
      }

      if (myArray[1] === 'M') {
        console.log(`${data}`)
      }

      // // send the response back to the client
      ws.send(`${myArray[0]} ${data.price}`)
    })
  })
})
