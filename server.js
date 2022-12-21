const WebSocket = require('ws')

// const httpserver = http.createServer((req, res) => {
//   console.log('we have received a request')
// })

// Connect to coinbase URL
const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com')

// When a client connects to the server
// wss.on('connection', function connection(ws) {
//   console.log('Client is connected')

//   ws.on('open', function open() {
//     ws.send({
//       type: 'subscribe',
//       product_ids: ['ETH-USD', 'ETH-EUR'],
//       channels: [
//         'level2',
//         'heartbeat',
//         {
//           name: 'ticker',
//           product_ids: ['ETH-BTC', 'ETH-USD'],
//         },
//       ],
//     })
//   })

//   ws.on('message', function message(data) {
//     console.log('received: ', data)
//   })
// })

ws.on('open', function open() {
  let message = {
    type: 'subscribe',
    product_ids: ['BTC-USD'],
    channels: [
      {
        name: 'ticker',
      },
    ],
  }
  let jsonMsg = JSON.stringify(message)
  ws.send(jsonMsg)
})

ws.on('message', function message(response) {
  let data = JSON.parse(response)
  // only show data from matching ticker name
  if (data.type !== 'ticker') {
    return
  }

  // checks if product id matches what we are looking for
  if (data.product_id === 'BTC-USD') {
    console.log('BTC Price: ' + data.price)
  }
})

// server.listen(8080)
