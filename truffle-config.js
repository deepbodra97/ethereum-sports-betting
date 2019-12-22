const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
	// See <http://truffleframework.com/docs/advanced/configuration>
  	// for more about customizing your Truffle configuration!
	networks: {
		development: {
			host: "127.0.0.1",
			port: 7545,
		  	network_id: "*", // Match any network id
		},
    	testrpc: {
      		host: "localhost",
      		port: 7545,
      		network_id: "*" // Match any network id
    	},
    	ropsten: {
      		provider: () => new HDWalletProvider("angle hobby stock close hour cost employ stadium sort remove must enjoy", "https://ropsten.infura.io/v3/" + "9ab6c609e744480bba19ad943442f185"),
      		network_id: 3,
      		gas: 3000000,
      		gasPrice: 10000000000
    	},
	}
};
