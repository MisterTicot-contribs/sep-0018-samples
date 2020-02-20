# SEP-0018-samples

Two possible implementations for
[SEP-0018](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0018.md).

* **Minimal implementation:** [flat.js](flat.js) parse account data entries as a
  list of keys. It takes 45 lines of code so it's nice for being compact.
* **Recommended implementation:** [tree.js](tree.js), parse account data entries
  as a tree. It takes 70 lines of code. It is not as compact and efficient, but
  it is dev-friendly.

Both implementations expose the following methods:

* `accountData.read(account, [convert])` parse valid namespace entries and
  convert them to the desired format.
* `accountData.write(account, accountData)` generate a transaction that mutates
  **account** data entries to reflect **accountData**.

Both implementations come with demos that perform a few basic operations
([demo/flat.js](demo/flat.js) & [demo/tree.js](demo/tree.js)). What we can see
is that the tree version makes it a breeze to manipulate the account data tree,
while with the flat version everything is a bit more complicated. The reason is
the flat version exposes namespaces as keys, not as actually namespaces.

If you want to run the demos:

```sh
git clone https://github.com/cosmic-plus-contribs/sep-0018-samples
cd sep-0018-samples
npm install
node demo/flat.js
node demo/tree.js
```
