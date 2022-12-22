const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message)

    // parse the message to get the parameters
    const params = JSON.parse(message)
    console.log(params)

    // create a WebSocket client and connect to the third-party's WebSocket server
    const client = new WebSocket('wss://ws-feed.exchange.coinbase.com')

    client.on('open', function open() {
      // send the parameters to the third-party
      console.log(params) // see the request from client side
      client.send(JSON.stringify(params))
    })

    client.on('message', function incoming(response) {
      let data = JSON.parse(response)

      if (data.type !== 'ticker') {
        return
      }

      if (data.product_id === 'ETH-USD') {
        console.log('ETH Price: ' + data.price)
      }

      // // send the response back to the client
      ws.send(`Coins ${data.price}`)
    })
  })
})
