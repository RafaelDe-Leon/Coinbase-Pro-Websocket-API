## Coinbase Pro Websocket API

This project is a middleware between a user connected to localhost and the Coinbase WebSocket API. It receives requests from the user and sends them to Coinbase, and returns the response from Coinbase back to the user.

## Prerequisites

- Node.js
- npm

## Installation

1. Clone the repository:
   <code>https://github.com/RafaelDe-Leon/Coinbase-Pro-Websocket-API.git</code>

2. Install the dependencies: <code>npm install</code>

## Usage

To run the program run: <code>node server.js</code>

### Available Commands

\*Replace Symbol with any these current supported symbols ETH, BTC, XRP, LTC.

- quit: this will quit the program
- Symbols-USD: subscribes you to start seeing the price of the current crypto
- Symbols-USD m: this will show the symbol with more details to show timestamp, product name, trade size, price.
- Symbol-USD u: will unsubscribe to no longer see the price of a crypto
- System Number: this will change the interval of the current crypto you are subscribed too. (NYI)


Example of a request: <code>ETH-USD</code>

![A Gif of How the application will run with the above example](https://i.imgur.com/5oO5Xqv.gif)

## Packages Used

- WS: Documentation can be found for WS https://github.com/websockets/ws
