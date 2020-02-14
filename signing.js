const headlessWallet = require('headless-obyte');
const signed_message = require('ocore/signed_message.js');
const account = require('./account.js');

function signMessage(message, handleResult) {
	if (!handleResult)
		return new Promise(resolve => {
			signMessage(message, (err, signedMessage) => {
				if (err)
					throw Error("signing failed: " + err);
				resolve(signedMessage);
			});
		});
	// orders are signed not network-aware for speed
	signed_message.signMessage(message, account.getAddress(), headlessWallet.signer, false, handleResult);
}


exports.signMessage = signMessage;
