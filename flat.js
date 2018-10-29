"use_strict"
/**
 * Reference implementation for getting/setting account data namespace.
 * 
 * Flat, with character restriction.
 */
const accountData = exports

const Buffer = require('safe-buffer').Buffer
const StellarSdk = require('stellar-sdk')

/*******************************************************************************
 * Base implementation
 */
 
accountData.isValidKey = function (key) {
  return key.match(/^[_a-z][_a-z0-9]*(\.[_a-z][_a-z0-9]*)*$/)
}

accountData.read = function (account, converter = fromBase64) {
  const dataAttr = {}
  for (let key in account.data_attr) {
    if (accountData.isValidKey(key)) {
      dataAttr[key] = converter(account.data_attr[key])
    }
  }
  return dataAttr
}

accountData.write = function (account, dataAttr) {
  const diff = {}

  Object.keys(account.data_attr).filter(accountData.isValidKey).forEach(key => {
    if (!dataAttr[key]) {
      diff[key] = null
    } else if (toBase64(dataAttr[key]) !== account.data_attr[key]) {
      diff[key] = dataAttr[key]
    }
  })

  if (Object.keys(diff).length > 0) return makeWriteTx(account, diff)
}

function makeWriteTx (account, dataAttr) {
  const txBuilder = new StellarSdk.TransactionBuilder(account)
  for (let key in dataAttr) {
    const operation = StellarSdk.Operation.manageData({ name: key, value: dataAttr[key] })
    txBuilder.addOperation(operation)
  }
  return txBuilder.build()
}

function fromBase64 (value) {
  return Buffer.from(value, 'base64')
}

function toBase64 (value) {
  if (value === undefined || value === null) value = Buffer.from('')
  else if (!(value instanceof Buffer)) value = Buffer.from(value, 'utf8')
  return value.toString('base64')
}

/*******************************************************************************
 * Demo
 */

const account = new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0')
account.data_attr = {
  '....': toBase64('InvalidKey1'),
  'conf.multisig': toBase64('InvalidKey2'),
  'conf.multisig.collector': toBase64('GASE...TWUY'),
  'conf.multisig.network': toBase64('test'),
  'Invalid Key 3': toBase64('...'),
  'profile.alias': toBase64('MisterTicot'),
  'wallet.btc': toBase64('...'),
  'wallet.eth': toBase64('...'),
  'wallet.xrp': toBase64('...')
}

/// Parse
const base64ToUtf8 = x => Buffer.from(x, 'base64').toString('utf8')
const dataAttr = accountData.read(account, base64ToUtf8)
console.log(dataAttr)

console.log()
/// Iterate
for (let key in dataAttr) {
  if (!key.match(/^wallet./)) continue
  console.log(key.substr(7) + ': ' + dataAttr[key])
}

console.log()
/// Get scope object
const scope = {}
for (let key in dataAttr) {
  if (key.match(/^conf.multisig./)) scope[key.substr(14)] = dataAttr[key]
}
console.log(scope)

/// Rewrite scope
for (let key in dataAttr) {
  if (key.match(/^conf\.multisig/)) delete dataAttr[key]
}
dataAttr['conf.multisig.collector'] = 'https://example.org/.well_known/multisig.toml'

console.log()
/// Write changes on the legder
const tx = accountData.write(account, dataAttr)
console.log(tx.operations)

