/*******************************************************************************
 * flat.js demo
 */
const accountNamespace = require("../flat.js")
const account = require("./account.js")

/// Parse
const base64ToUtf8 = x => Buffer.from(x, "base64").toString("utf8")
const dataAttr = accountNamespace.read(account, base64ToUtf8)
console.log(dataAttr)

console.log()
/// Iterate
for (let key in dataAttr) {
  if (!key.match(/^wallet./)) continue
  console.log(key.substr(7) + ": " + dataAttr[key])
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
dataAttr["conf.multisig.collector"] = "https://example.org/.well_known/multisig.toml"

console.log()
/// Write changes on the legder
const tx = accountNamespace.write(account, dataAttr)
console.log(tx.operations)

