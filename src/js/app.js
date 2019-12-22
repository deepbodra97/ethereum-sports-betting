App = {
	web3Provider: null,
	contracts: {},
	account: 'guest',
	isOwner: false,

	init: async function() {
		return await App.initWeb3();
	},

	initWeb3: async function() {
		if (typeof web3 !== 'undefined') {
			// If a web3 instance is already provided by Meta Mask.
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			// Specify default instance if no web3 instance provided
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContract();
	},

	initContract: function() {
		$.getJSON("Betting.json", function(betting) {
			// Instantiate a new truffle contract from the artifact
			App.contracts.Betting = TruffleContract(betting);
			// Connect provider to interact with contract
			App.contracts.Betting.setProvider(App.web3Provider);
			// App.listenForEvents();
			return App.render();
		});
	// return App.bindEvents();
	},

	render: function(){
		var loader = $("#loader");
    	var content = $("#content");
		web3.eth.getCoinbase(function(err, account) {
			if(err === null){
				App.account = account;
				$("#accountAddress").html("Current account: " + account);
			}
		});

		// set isOwner
		App.contracts.Betting.deployed().then(function(_instance){
			return _instance.isOwner({from: App.account});
		}).then(function(isOwner){
			console.log("isOwner", isOwner);
			if(isOwner){
				// App.getBalance().then(function(bal){
				App.contracts.Betting.deployed().then(function(_instance){
					return _instance.getBalance({from: App.account});
				}).then(function(bal){
					$("#redeem").append(`<button id="redeem" class="close-bet btn btn-success btn-sm">Redeem | ${web3.fromWei(bal, "ether")}</button><br><br>`);					
				});
				// });
			} else{
				$("#payoutABet").hide();
				$("#addABet").hide();
			}
			App.isOwner = isOwner;			
			return isOwner
		});

		// Get bets from Contract and display
		App.contracts.Betting.deployed().then(function(_instance){
			bettingInstance = _instance;
			return bettingInstance.lengthBets();
		}).then(function(lengthBets){
			for(var i=lengthBets-1; i>=0; i--){
				bettingInstance.bets(i).then(function(_bet) {
					let bet = _bet;
					// if bet is open
					let questionHTML = App.getQuestionHTML(bet[0], bet[1], bet[2]);
					if(bet[2] == 0){					
						$("#openBets").append(questionHTML);
						$("#closeABet").append(questionHTML);
					} else if(bet[2] == 1){
						$("#payoutABet").append(questionHTML);						
					}
					bettingInstance.getLengthMoneyLineData(bet[0]).then(function(_lengthMoneyLineData){
						for(var i=0; i<_lengthMoneyLineData; i++){
							let optionIdx = i;
							bettingInstance.getMoneyLineData(bet[0], optionIdx).then(function(_moneyLineData){
								if(bet[2] == 0){	
									$("#openBets").find("#bet-"+bet[0]).append(App.getMoneyLineDataHTML(bet[0], optionIdx, _moneyLineData, false));
								} else if(bet[2] == 1){
									console.log("betStatus", bet[2]);
									$("#payoutABet").find("#bet-"+bet[0]).append(App.getMoneyLineDataHTML(bet[0], optionIdx, _moneyLineData, false));
								}
							});
						}
					}).then(function(){
						if(App.isOwner){
							$("#openBets").find(`#bet-${bet[0]} ~ .close-bet-wrapper`).append(App.getCloseBetHTML(bet[0]));
						}
					});
				});
			}
		});

		//get Prev Bets
		App.myBets();
	},

	getQuestionHTML: function(betId, question, betStatus){
		html = `<div class="bet-card col-lg-5 col-lg-offset-1">`;
		html += `<div id="bet-${betId}">#${betId} ${web3.toAscii(question)}</div>`;
		html += `<div class="close-bet-wrapper"></div>`;
		html += `</div>`;
		return html;
	},

	getMoneyLineDataHTML: function(betId, i, moneyLineData, disableOptions){
		html = `<button id="bet-${betId}-option-${i}" class="bet-option btn btn-primary btn-sm ${disableOptions ? "disabled" : ""}">${web3.toAscii(moneyLineData[0])} | ${moneyLineData[1]} | ${web3.fromWei(moneyLineData[2], "ether")}</button>`;
		return html;
	},

	getCloseBetHTML: function(betId){
		html = `<button id="close-bet-${betId}" class="close-bet btn btn-primary btn-sm">Close</button>`;
		return html;
	},

	addBet: function(){
		
		var question;
		var options = [];
		var values = [];

		question = $("#question").val();

		$(".moneyLineOption").each(function(){
			options.push($(this).val());
		});

		$(".moneyLineValue").each(function(){
			values.push(parseInt($(this).val()));
		});

		// add bet to the contract

		App.contracts.Betting.deployed().then(function(_instance){
			return _instance.addBet(question, options, values, {from: App.account}).then(function(res){
				console.log("Bet has been added", res)
			}).catch(function(err){
				console.log("Error adding bet", err);
			});
		});
	},

	bet: function(betId, moneyLineDatumId, betValue){
		App.contracts.Betting.deployed().then(function(_instance){
			return _instance.bet(betId, moneyLineDatumId, betValue, {from: App.account, value: web3.toWei(betValue, "ether")});
		}).then(function(res){
			console.log("Bet has been placed", res);			
		});
	},

	closeBet: function(betId){
		if(App.isOwner){
			App.contracts.Betting.deployed().then(function(_instance){
				return _instance.closeBet(betId, {from: App.account});
			}).then(function(res){
				console.log("Bet has been closed", res);			
			});
		} else{
			console.log("Unauthorized Access: Only admin can close a bet");
		}
	},

	payout: function(betId, moneyLineDatumId){
		if(App.isOwner){	
			App.contracts.Betting.deployed().then(function(_instance){
				return _instance.payout(betId, moneyLineDatumId, {from: App.account});
			}).then(function(res){
				console.log("Bet has been settled", res);		
			}).catch(function(err){
				console.log("Error settling bet", err);
			});
		} else{
			console.log("Unauthorized access: Only admin can initiate payout");
		}
	},

	myBets: function(){
		App.contracts.Betting.deployed().then(function(_instance){
			return _instance.myBets({from: App.account});
		}).then(function(res){
			var betValues = res[0];
			var options = res[1];
			var winStatuses = res[2];
			var moneyLineValues = res[3];
			if(betValues.length == 0){
				$("#myBets").append(`<div class="text-center">Stop counting ethers and start spending some</div>`);
			} else{
				$("#myBets").append(App.getMyBetHTML(betValues, options, winStatuses, moneyLineValues));
			}
		});
	},

	// get all bets of the user
	getMyBetHTML(betValues, options, winStatuses, moneyLineValues){
		html = `<table class="table">
    				<thead>
      					<tr>
					        <th>Choice</th>
					        <th>Bet Value</th>
					        <th>Reward</th>
				      	</tr>
				    </thead>
				    <tbody>`;
		for(var i=0; i<options.length; i++){
			var reward=0;
			var winStatus = web3.toUtf8(winStatuses[i]);
			if(moneyLineValues[i]>0 && winStatus == "won"){
				reward = "+" + betValues[i]*1+(moneyLineValues[i]*betValues[i])/100 + " ether";
			} else if(moneyLineValues[i]<0 && winStatus == "won"){
				reward = betValues[i]*1-(100*betValues[i])/moneyLineValues[i] + " ether";
			} else if(winStatus == "lost") {
				reward = `-${betValues[i]} ether`;
			} else{
				reward = "pending";
			}
			var color = "#FFFFFF";
			if(winStatus == "won"){
				color = "#aed581";
			} else if(winStatus == "lost"){
				color = "#e57373";
			}
			html += `<tr>
						<td style="color: ${color};}">${web3.toAscii(options[i])}</td>
						<td style="color: ${color};}">${betValues[i]} ether</td>
						<td style="color: ${color};}">${reward}</td>
					</tr>`;
			html += `</tbody>`;
		}
		return html;
	},

	getBalance: function(){
		// implemented before
	},

	redeem: function(){
		App.contracts.Betting.deployed().then(function(_instance){
			return _instance.redeem({from: App.account});
		}).then(function(res){
			console.log("redeemed", res);
		});
	}
};

$(function() {
	$(window).load(function() {
		App.init();
	});
});
