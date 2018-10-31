"use_strict"
/**
 * Reference implementation for reading/writing account data namespace.
 * 
 * Tree, with character restriction.
 */
const accountNamespace = exports

const Buffer = require("safe-buffer").Buffer
const StellarSdk = require("stellar-sdk")

/**
 * Returns `true` is **path** is a valid data entry namespace path, `false`
 * otherwise. Changing this method will affect the whole library.
 *  
 * @param  {string} key A data entry name
 * @return {Boolean}
 */
accountNamespace.isValidPath = function (path) {
  return path.match(/^[_a-z][_a-z0-9]*(\.[_a-z][_a-z0-9]*)*$/)
}

/**
 * Parse data entries from **account** using **converter** and returns the
 * namespace tree.
 *  
 * @param  {AccountResponse} account
 * @param  {Function} converter The function used to convert account data
 *     entries values from base64
 * @return {Object}
 */
accountNamespace.read = function (account, converter = fromBase64) {
  const dataAttr = {}
  for (let key in account.data_attr) {
    if (accountNamespace.isValidPath(key)) {
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

/**
 * Build a transaction that saves **dataTree**, which should be an Object
 * similar to what `accountNamespace.read()` returns, as **account** data entries.
 *
 * @param  {AccountResponse} account
 * @param  {Object} dataTree
 * @return {Transaction}
 */
accountNamespace.write = function (account, dataTree) {
  const dataAttr = reduce(dataTree)

  Object.keys(account.data_attr).filter(accountNamespace.isValidPath).forEach(key => {
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