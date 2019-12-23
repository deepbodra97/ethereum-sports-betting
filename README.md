
# Fortunether
A decentralized application for sports betting on the ethereum blockchain. This project implements **[moneyline betting](https://news.sportsinteraction.com/guide/moneyline-betting-explained)**. Make sure you know what it actually is to better appreciate the project.

The demo can be found [here](https://fortunether.herokuapp.com/). Read the guidelines for the demo to work as expected

## Features

 1. Add Bet
	 1. The admin of the system can add new bets to the system
	 2. The admin is responsible for setting the betting odds
	 3. After a bet has been added, the status of the bet is considered as Open meaning the users can bet on it now
 2. Bet
	 1. Now, the users can bet Ethereum on a team of their choice
	 2. The amount they bet is recorded on the blockchain
	 3. Also the Ether they bet is stored in the smart contract
 3. My Bets
	 1. The users can see all their bets along with the amount they earned/lost
 4. Close a bet
	 1. The toss in the game can affect the outcome of the game
	 2. So, the admin closes the bet before the toss
	 3. The bet status is now Closed
 5. Start Payout
	 1. Once the game has finished the admin can select the winner and start payouts.
	 2. The winners will be listed and ethers will be sent out to them depending upon the amount of their bet.
	 3. The ether stored in the smart contract earlier is released and used in the payout process
 6. Redeem
	 1. Once the payout has finished, there are chances that the smart contract still has ethers left over 
	 2. Using this, the admin can get the ether transferred to his address.

## Guidelines to test the demo
1. Import this private key `ed6d7422eb57924e8b6d071ae87f226638f28cee56447a16f5cdfc39325b687b` into your metamask account. Using this key you can test the admin only features. 
A few humble requests: 
	1. Don't steal the fake ethers in the account
	2. Use only 1 ether while testing because there aren't many
2. Whitelist the url of the website in metamask (as shown in the dependencies)

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

## Credits

Shoutout to [goodvibration](https://ethereum.stackexchange.com/users/16043/goodvibration) and [Rob Hitchens](https://ethereum.stackexchange.com/users/5549/rob-hitchens-b9lab) for answering my questions on Stack Exchange
