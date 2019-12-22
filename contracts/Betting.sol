pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Betting {

	struct Bet{
		uint betId; // id of the bet
		bytes32 question; // title of the bet
		BetStatus betStatus; // status of the bet {Open | Closed | Settled}
		mapping(uint => MoneyLineDatum) moneyLineData; // to store betting odds
		uint lengthMoneyLineData; // length of moneyLineData
		mapping(uint => BetterDatum[]) bettersData; // stores bet data
		uint correctChoice; // winning team
	}


	struct MoneyLineDatum{
		bytes32 option; // team name
		int value; // betting odd for a team
	}
	
	struct BetterDatum{
		address payable better; // betters address
		uint value; // bet value of the better
	}

	// used for my bets
	struct BetterCacheDatum{
		uint betId; // bet id
		uint optionId; // option chosen
		uint betValue; // bet value of the better
	}
	
	address	payable owner; // store owner address

	mapping(uint => Bet) public bets; // store all bet
	uint public lengthBets; // length of bets

	mapping(address => BetterCacheDatum[]) betterCacheData; // store betters data for fast access
	// uint public lengthBetterCacheData;

	enum BetStatus {Open, Closed, Settled} //enums for different status of the bet

	// constructor
	constructor() public{
		owner = msg.sender; // set owner

		// add 2 open bets by default
		bytes32[2] memory options = [bytes32("Gators"), bytes32("Hurricanes")];
		int[2] memory values = [int(105), -150];
		addBet(bytes32("Gators vs Hurricanes"), options, values);

		options = [bytes32("Gators"), bytes32("Bulldogs")];
		values = [int(110), -160];
		addBet(bytes32("Gators vs Bulldogs"), options, values);
	}

	// to restrict access to non admin users
	modifier onlyByOwner{
		require(msg.sender == owner, "Unauthorised Access");
		_;
	}

	// to find if the current user is admin
	function isOwner() public view returns(bool){
		if(msg.sender == owner){
			return true;
		} else{
			return false;
		}
	}

	// adds a bet without setting any values
	function addNewEmptyBet() public{
		Bet memory bet;
		bets[lengthBets] = bet;
	}

	// to add bet
	function addBet(bytes32 question, bytes32[2] memory options, int[2] memory values) public onlyByOwner{
		addNewEmptyBet();
		Bet storage bet = bets[lengthBets];
		bet.betId = lengthBets; //set id
		bet.question = question; // set title
		bet.betStatus = BetStatus.Open; // set status
		lengthBets+=1;
		// set team name and betting odds
		for(uint i=0; i<options.length; i++){
			bet.moneyLineData[i] = MoneyLineDatum(options[i], values[i]);
		}
		bet.lengthMoneyLineData+=options.length;
	}

	// get total number of options in a bet. Currently only 2
	function getLengthMoneyLineData(uint betId) public view returns(uint){
		return bets[betId].lengthMoneyLineData;
	}

	// get team name and betting odd for a given bet and a given team
	function getMoneyLineData(uint betId, uint idx) public view returns(bytes32, int, uint){
		MoneyLineDatum storage moneyLineDatum = bets[betId].moneyLineData[idx];
		uint totalBetValue = 0;
		for(uint i=0; i<bets[betId].bettersData[idx].length; i++){
			totalBetValue += bets[betId].bettersData[idx][i].value;
		}
		return (moneyLineDatum.option, moneyLineDatum.value, totalBetValue);
	}

	// allows the user to bet
	function bet(uint betId, uint moneyLineDatumId, uint betValue) payable public{
		require(msg.value >= betValue);
		bets[betId].bettersData[moneyLineDatumId].push(BetterDatum(msg.sender, msg.value)); // record betters address, choice and bet value
		betterCacheData[msg.sender].push(BetterCacheDatum(betId, moneyLineDatumId, betValue));
	}

	// returns all the bet made by a user
	function myBets() public view returns (uint[] memory, bytes32[] memory, bytes32[] memory, int[] memory){
		uint n = betterCacheData[msg.sender].length;

		uint[] memory betValues = new uint[](n);
		bytes32[] memory options = new bytes32[](n);
		bytes32[] memory winStatus = new bytes32[](n);
		int[] memory moneyLineValues = new int[](n);

		for(uint i=0; i<n; i++){
			uint betId = betterCacheData[msg.sender][i].betId;
			uint optionId = betterCacheData[msg.sender][i].optionId;

			betValues[i] = betterCacheData[msg.sender][i].betValue;
			options[i] = bets[betId].moneyLineData[optionId].option;

			if(bets[betId].betStatus == BetStatus.Open || bets[betId].betStatus == BetStatus.Closed){
				winStatus[i] = "pending";
			} else{
				if(bets[betId].correctChoice == optionId){
					winStatus[i] = "won";
					moneyLineValues[i] = bets[betId].moneyLineData[optionId].value;
				} else{
					winStatus[i] = "lost";
				}
			}
		}
		return (betValues, options, winStatus, moneyLineValues);
	}

	// close a bet before the toss
	function closeBet(uint betId) public onlyByOwner{
		bets[betId].betStatus = BetStatus.Closed;
	}

	// start the payout process after the winner is known
	function payout(uint betId, uint correctChoice) public onlyByOwner{
		if(bets[betId].betStatus == BetStatus.Closed){
			bets[betId].correctChoice = correctChoice;
			for(uint i=0; i<bets[betId].bettersData[correctChoice].length; i++){
				address payable better = bets[betId].bettersData[correctChoice][i].better;
				uint betValue = bets[betId].bettersData[correctChoice][i].value;
				
				int moneyLineValue = bets[betId].moneyLineData[correctChoice].value;
				if(address(this).balance > 0){
					if(moneyLineValue > 0){
						better.transfer(betValue+uint(moneyLineValue)*betValue/uint(100));
					} else{
						better.transfer(betValue+(uint(100)*betValue)/uint(-moneyLineValue));				
					}
				} else{
					break;
				}
			}
			bets[betId].betStatus = BetStatus.Settled;
		}
	}

	// get ethers held by the contact
	function getBalance() public view onlyByOwner returns(uint){
		return address(this).balance;
	}

	// redeem the ethers in the contract
	function redeem() public onlyByOwner{
		if(address(this).balance > 0){	
			bool allBetsSettled = true;
			/*for(uint i=lengthBets-1; i>=0; i--){
				if(bets[i].betStatus != BetStatus.Settled){
					allBetsSettled = false;
					break;
				}else{
					allBetsSettled = true;
				}
			}*/
			if(allBetsSettled){
				owner.transfer(address(this).balance);
			}
		}
	}
}
