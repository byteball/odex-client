const account = require('./account.js');
const ws_api = require('./ws_api.js');
const rest_api = require('./rest_api.js');

let assocBalances = null;


ws_api.on('balances', (type, payload) => {
	console.error('---- received balances', type, payload);
	assocBalances = payload.balances;
});

async function getBalances() {
	if (assocBalances)
		return assocBalances;
	assocBalances = await rest_api.getBalances(account.getAddress());
	return assocBalances;
}


exports.getBalances = getBalances;
