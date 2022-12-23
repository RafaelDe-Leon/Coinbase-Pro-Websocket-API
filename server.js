const WebSocket = require('ws')

// matches
// ${coin-USD}: price view.
// ${coin-USD}: matches view.
// #{coin-USD} u: unsubscribe symbol.
// system: system status of subscribed coins atm
// system <number>: change refresh interval in milliseconds

const wss = new WebSocket.Server({ port: 8080 })

// request data
let requestData = {
  type: 'subscribe',
  product_ids: ['ETH-USD'],
  channels: [
    'level2',
    'heartbeat',
    {
      name: 'ticker',
      product_ids: ['ETH-USD'],
    },
  ],
}

let statusData = {
  type: 'subscribe',
  channels: [{ name: 'status' }],
}

wss.on('connection', function connection(ws) {
  console.log('connected to localhost')
  ws.on('message', function incoming(message) {
    // read the message to get the data from client
    let readData = message.toString('utf8').toUpperCase()

    console.log(readData)

    const myArray = readData.split(' ')

    // function handleString(str1, str2) {
    //   switch (str1) {
    //     case `${myArray[0]}`:
    //       switch (str2) {
    //         case 'U':
    //           let unsub = JSON.parse(JSON.stringify(requestData)) // make a deep copy of request data
    //           unsub.type = 'unsubscribe'
    //           unsub.product_ids = [`${myArray[0]}`]
    //           unsub.channels[2].product_ids = [`${myArray[0]}`]

    //           let unubMSg = JSON.stringify(unsub)
    //           console.log(unubMSg)
    //           client.send(unubMSg)
    //           break
    //         default:
    //           break
    //       }
    //       let sub = JSON.parse(JSON.stringify(requestData)) // make a deep copy of request data

    //       sub.type = 'subscribe'
    //       sub.product_ids = [`${myArray[0]}`]
    //       sub.channels[2].product_ids = [`${myArray[0]}`]

    //       let subMsg = JSON.stringify(sub)
    //       console.log(sub.channels[2])
    //       client.send(subMsg)
    //       break

    //     case 'SYSTEM':
    //       let status = JSON.parse(JSON.stringify(statusData)) // make a deep copy of request data

    //       let jsonStatus = JSON.stringify(status)
    //       client.send(jsonStatus)

    //       break
    //     default:
    //       console.log('try again')
    //   }
    // }

    // create a WebSocket client and connect to the coinbase's api
    const client = new WebSocket('wss://ws-feed.exchange.coinbase.com')

    client.on('open', function open() {
      // send the parameters to the third-party
      // handleString(myArray[0], myArray[1])

      if (myArray[0] === 'ETH-USD' && myArray.length <= 1) {
        let sub = JSON.parse(JSON.stringify(requestData)) // make a deep copy of request data

        sub.type = 'subscribe'
        sub.product_ids = [`${myArray[0]}`]
        sub.channels[2].product_ids = [`${myArray[0]}`]

        let subMsg = JSON.stringify(sub)
        console.log(sub.channels[2])
        client.send(subMsg)
      }

      if (myArray[0] === 'BTC-USD' && myArray.length <= 1) {
        let sub = JSON.parse(JSON.stringify(requestData)) // make a deep copy of request data

        sub.type = 'subscribe'
        sub.product_ids = [`${myArray[0]}`]
        sub.channels[2].product_ids = [`${myArray[0]}`]

        let subMsg = JSON.stringify(sub)
        console.log(sub.channels[2])
        client.send(subMsg)
      }

      if (
        myArray[0] === 'ETH-USD' &&
        myArray.length >= 1 &&
        myArray[1] === 'U'
      ) {
        let unsub = {
          type: 'unsubscribe',
          channels: ['heartbeat'],
        }

        // unsub.type = 'unsubscribe'
        // unsub.product_ids = [`${myArray[0]}`]
        // unsub.channels[2].product_ids = [`${myArray[0]}`]

        let subMsg = JSON.stringify(unsub)
        client.send(subMsg)
      }
    })

    client.on('message', function incoming(response) {
      let data = JSON.parse(response)

      if (data.type === 'l2update') {
        return
      }

      if (data.type === 'ticker') {
        condition = true
        console.log(data.price)
      }

      if (data.type === 'subscriptions') {
        console.log(data.type, data.channels)
      }
    })
  })
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
