
# Sports betting on the ethereum blockchain
A decentralized application for sports betting on the ethereum blockchain


## Dependencies

 1. [Node.js](https://nodejs.org/en/download/)
 2. Truffle
	  `npm install -g truffle`
 3. [Ganache](https://www.trufflesuite.com/ganache)
 4. [Metamask](https://metamask.io/) 
	 1. Once the account is ready, you will be connected to the Main Ethereum network. To connect to the local blockchain that was setup by Ganache, Click Main Ethereum Network and then go to Custom RPC. 
	 2. Set **Network Name**:  "anything you like"
	      Set **New RPC URL**: http://127.0.0.1:7545 
	 3. Whitelist the localhost address in the settings

## Executing the code

1. Initialising Blockchain Ledger
	``truffle migrate --reset``
2. Running the Decentralised App(Server)
	``npm run dev``
