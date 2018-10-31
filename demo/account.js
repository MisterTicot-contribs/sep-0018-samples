"use_strict"
/**
 * Demo account object.
 */
const StellarSdk = require('stellar-sdk')

const account = module.exports = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0")
account.data_attr = {
  "...": stringToBase64("InvalidKey1"),
  "conf.multisig": stringToBase64("InvalidKey2"),
  "conf.multisig.collector": stringToBase64("GASE...TWUY"),
  "conf.multisig.network": stringToBase64("test"),
  "Invalid Key 3": stringToBase64("..."),
  "profile.alias": stringToBase64("MisterTicot"),
  "wallet.btc": stringToBase64("..."),
  "wallet.eth": stringToBase64("..."),
  "wallet.xrp": stringToBase64("...")
}

function stringToBase64 (string) {
	return Buffer.from(string, "utf8").toString("base64")
}