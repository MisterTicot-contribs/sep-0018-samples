/*******************************************************************************
 * tree.js demo
 */
const accountNamespace = require("../tree.js")
const account = require("./account.js")

/// Parse
const base64ToUtf8 = x => Buffer.from(x, "base64").toString("utf8")
const dataTree = accountNamespace.read(account, base64ToUtf8)
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
const tx = accountNamespace.write(account, dataTree)
console.log(tx.operations)
