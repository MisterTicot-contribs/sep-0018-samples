"use_strict"
/**
 * Reference implementation for getting/setting account data namespace.
 * 
 * With tree, with character restriction.
 */
const accountData = exports

const Buffer = require("safe-buffer").Buffer
const StellarSdk = require("stellar-sdk")

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
  return expand(dataAttr)
}

function expand (dataAttr) {
  const keys = Object.keys(dataAttr).sort((a, b) => b.localeCompare(a))
  const tree = {}
  
  keys.forEach(key => {
    let focus = tree, path = key.split(".")
    while (path.length > 1) {
      const next = path.shift()
      if (!focus[next]) focus[next] = {}
      focus = focus[next]
    }
    /// Solve key/namespace conflict thanks to reverse sorting.
    if (!focus[path[0]]) focus[path[0]] = dataAttr[key]
  })
  
  return tree
}

accountData.write = function (account, dataTree) {
  const dataAttr = reduce(dataTree)

  Object.keys(account.data_attr).filter(accountData.isValidKey).forEach(key => {
    if (!dataAttr[key]) dataAttr[key] = null
    else if (dataAttr[key] === account.data_attr[key]) delete dataAttr[key]
  })

  if (Object.keys(dataAttr).length > 0) return makeWriteTx(account, dataAttr)
}

function reduce (dataTree, prefix = "", obj = {}) {
  for (let field in dataTree) {
    const path = prefix ? prefix + "." + field : field
    const value = dataTree[field]
    if (typeof value === "object") reduce(value, path, obj)
    else obj[path] = toBase64(value)
  }
  if (!prefix) return obj
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
  return Buffer.from(value, "base64")
}

function toBase64 (value) {
  if (value === undefined || value === null) value = Buffer.from("")
  else if (!(value instanceof Buffer)) value = Buffer.from(value, "utf8")
  return value.toString("base64")
}


/*******************************************************************************
 * Demo
 */

const account = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0")
account.data_attr = {
  "....": toBase64("InvalidKey1"),
  "conf.multisig": toBase64("InvalidKey2"),
  "conf.multisig.collector": toBase64("GASE...TWUY"),
  "conf.multisig.network": toBase64("test"),
  "Invalid Key 3": toBase64("..."),
  "profile.alias": toBase64("MisterTicot"),
  "wallet.btc": toBase64("..."),
  "wallet.eth": toBase64("..."),
  "wallet.xrp": toBase64("...")
}

/// Parse
const base64ToUtf8 = x => Buffer.from(x, "base64").toString("utf8")
const dataTree = accountData.read(account, base64ToUtf8)
console.log(dataTree)

console.log()
/// Iterate
for (let coin in dataTree.wallet) {
  console.log(coin + ": " + dataTree.wallet[coin])
}

console.log()
/// Get scope object
const scope = dataTree.conf && dataTree.conf.multisig
console.log(scope)

/// Rewrite scope
if (!dataTree.conf) dataTree.conf = {}
dataTree.conf.multisig = { collector: "https://example.org/.well_known/multisig.toml" }

console.log()
/// Write changes on the legder
const tx = accountData.write(account, dataTree)
console.log(tx.operations)
