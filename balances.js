const account = require('./account.js');
const ws_api = require('./ws_api.js');
const rest_api = require('./rest_api.js');

let assocBalances = null;


ws_api.on('balances', (type, payload) => {
	console.error('---- received balances', type, payload);
	if (assocBalances) {
		let deltas = {};
		for (let symbol in assocBalances)
			if (assocBalances[symbol] !== payload.balances[symbol])
				deltas[symbol] = payload.balances[symbol] - assocBalances[symbol];
		if (Object.keys(deltas).length > 0)
			console.error('----- balance deltas: ', deltas);
	}
	assocBalances = payload.balances;
});

async function getBalances() {
	if (assocBalances)
		return assocBalances;
	assocBalances = await rest_api.getBalances(account.getOwnerAddress());
	return assocBalances;
}


exports.getBalances = getBalances;
