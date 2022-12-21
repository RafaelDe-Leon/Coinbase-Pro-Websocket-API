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

let message = {
  type: 'subscribe',
  product_ids: ['ETH-USD'],
  channels: [
    'level2',
    'heartbeat',
    {
      name: 'ticker',
      product_ids: ['ETH-BTC'],
    },
  ],
}
let jsonMsg = JSON.stringify(message)

ws.on('open', function open() {
  ws.send(jsonMsg)
})

ws.on('message', function message(data) {
  console.log('received: %s', data)
})

// server.listen(8080)
