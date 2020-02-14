const fetch = require('node-fetch');
const conf = require('ocore/conf');


const request = (endpoint, options) => {
	return fetch(`${conf.odex_http_url}${endpoint}`, {
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		...options
	})
}

const createPairs = async (asset) => {
	const response = await request(`/pairs/create`, {
		body: JSON.stringify({ asset: asset }),
		method: 'POST'
	})

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	const { data } = await response.json()
	return data
}

const fetchInfo = async () => {
	const response = await request(`/info`)

	if (response.status !== 200) {
		throw new Error('non-200 status from /info: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchFees = async () => {
	const response = await request('/fees')

	if (response.status !== 200) {
		throw new Error('non-200 status from /fees: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchTokens = async (listed = '') => {
	const response = await request(`/tokens?listed=${listed}`)

	if (response.status !== 200) {
		throw new Error('non-200 status from /tokens: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchToken = async (asset) => {
	const response = await request(`/tokens/${encodeURIComponent(asset)}`)

	if (response.status !== 200) {
		throw new Error('non-200 status from /tokens: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchPairs = async (listed = '') => {
	const response = await request(`/pairs?listed=` + listed)

	if (response.status !== 200) {
		throw new Error('non-200 status from /pairs: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchPair = async (baseToken, quoteToken) => {
	const response = await request(`/pair?baseToken=${encodeURIComponent(baseToken)}&quoteToken=${encodeURIComponent(quoteToken)}`)


	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /pair: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchOrders = async (address) => {
	const response = await request(`/orders?address=${address}`)


	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /orders: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchOrderHistory = async (address) => {
	const response = await request(`/orders/history?address=${address}`)

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /orders/history: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchCurrentOrders = async (address) => {
	const response = await request(`/orders/current?address=${address}`)

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /orders/current: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchTokenPairTrades = async (baseToken, quoteToken) => {
	const response = await request(`/trades/pair?baseToken=${baseToken}&quoteToken=${quoteToken}`)
	const data = await response.json()

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /trades/pair: ' + response.status)
	}

	return data
}

const fetchAddressTrades = async (address) => {
	const response = await request(`/trades?address=${address}`)
	const data = await response.json()

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /trades: ' + response.status)
	}

	return data
}

const fetchOrderBook = async (baseToken, quoteToken) => {
	const response = await request(`/orderbook?baseToken=${baseToken}&quoteToken=${quoteToken}`)

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /orderbook: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchRawOrderBook = async (baseToken, quoteToken) => {
	const response = await request(`/orderbook/raw?baseToken=${baseToken}&quoteToken=${quoteToken}`)

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /orderbook/raw: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchTokenPairData = async () => {
	const response = await request('/pairs/data')

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /pairs/data: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const fetchTradingStats = async () => {
	const response = await request('/stats/trading')

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	const { data } = await response.json()
	return data
}

const createAccount = async (address) => {
	const response = await request(`/account/create?address=${address}`, { method: 'post'})

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /account/create: ' + response.status)
	}

	const { data } = await response.json()
	return data
}

const getBalances = async (address) => {
	const response = await request(`/account/balances/${address}`)

	if (response.status === 400) {
		const { error } = await response.json()
		throw new Error(error)
	}

	if (response.status !== 200) {
		throw new Error('non-200 status from /account/balances/: ' + response.status)
	}

	const { data } = await response.json()
	return data
}



const checkToken = async(asset) => {
	const response = await request(`/tokens/check/${asset}`)

	if (response.status !== 200) {
		throw new Error('non-200 status from /tokens/check: ' + response.status)
	}

	const { data } = await response.json()
	
	return data
}




const getExchangeAddress = async () => {
	let data = await fetchInfo()
	let exchangeAddress = data.exchangeAddress

	return exchangeAddress
}

const getOperatorAddress = async () => {
	let data = await fetchInfo()
	let operatorAddress = data.operatorAddress

	return operatorAddress
}

exports.createPairs = createPairs;
exports.fetchInfo = fetchInfo;
exports.fetchFees = fetchFees;
exports.fetchTokens = fetchTokens;
exports.fetchToken = fetchToken;
exports.fetchPairs = fetchPairs;
exports.fetchPair = fetchPair;
exports.fetchOrders = fetchOrders;
exports.fetchOrderHistory = fetchOrderHistory;
exports.fetchCurrentOrders = fetchCurrentOrders;
exports.fetchTokenPairTrades = fetchTokenPairTrades;
exports.fetchAddressTrades = fetchAddressTrades;
exports.fetchOrderBook = fetchOrderBook;
exports.fetchRawOrderBook = fetchRawOrderBook;
exports.fetchTokenPairData = fetchTokenPairData;
exports.fetchTradingStats = fetchTradingStats;
exports.createAccount = createAccount;
exports.getBalances = getBalances;
exports.checkToken = checkToken;
exports.getExchangeAddress = getExchangeAddress;
exports.getOperatorAddress = getOperatorAddress;
