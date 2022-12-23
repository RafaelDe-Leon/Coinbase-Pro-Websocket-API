// const WebSocket = require('ws')

// // const httpserver = http.createServer((req, res) => {
// //   console.log('we have received a request')
// // })

// // Connect to coinbase URL
// const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com')

// ws.on('open', function open() {
//   let message = {
//     type: 'subscribe',
//     product_ids: ['BTC-USD', 'ETH-USD'],
//     channels: [
//       {
//         name: 'ticker',
//       },
//     ],
//   }
//   let jsonMsg = JSON.stringify(message)
//   ws.send(jsonMsg)
// })

// ws.on('message', function message(response) {
//   let data = JSON.parse(response)
//   // only show data from matching ticker name
//   if (data.type !== 'ticker') {
//     return
//   }

//   // checks if product id matches what we are looking for
//   if (data.product_id === 'BTC-USD' && 'ETH-USD') {
//     console.log('BTC Price: ' + data.price)
//   }
//   if (data.product_id === 'ETH-USD') {
//     console.log('ETH Price: ' + data.price)
//   }
// })

// // matches
// // ${coin-USD}: price view.
// // ${coin-USD}: matches view.
// // #{coin-USD} u: unsubscribe symbol.
// // system: system status of subscribed coins atm
// // system <number>: change refresh interval in milliseconds
