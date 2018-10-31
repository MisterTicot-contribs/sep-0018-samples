# stellar-draft-0005

Two possible implementations for
[draft-0005](https://github.com/stellar/stellar-protocol/pull/199).

* **Minimal implementation:**
  [flat.js](https://github.com/MisterTicot/stellar-draft-0005/blob/master/flat.js)
  parse account data entries as a list of keys. It takes 45 lines of code so
  it's nice for being compact.
* **Recommended implementation:**
  [tree.js](https://github.com/MisterTicot/stellar-draft-0005/blob/master/tree.js),
  parse account data entries as a tree. It takes 70 lines of code. It is not
  as compact and efficient, but it is dev-friendly.

Both implementations expose the following methods:

* `accountData.read(account, [convert])` parse valid namespace entries and
  convert them to the desired format.
* `accountData.write(account, accountData)` generate a transaction that change
  **account** data entries to reflect **accountData**.

Both implementations come with a demo
([demo/flat.js](https://github.com/MisterTicot/stellar-draft-0005/blob/master/demo/flat.js)
&
[demo/tree.js](https://github.com/MisterTicot/stellar-draft-0005/blob/master/demo/tree.js))
that perform a few basic operations. What we can see is that the tree version
makes it a breeze to manipulate the account data tree, while with the flat
version everything is a bit more complicated. The reason is the flat version
expose namespace as keys, not as actually namespaces.

If you want to run the demo:

```sh
git clone https://github.com/MisterTicot/stellar-draft-0005
cd stellar-draft-0005
npm install
node demo/flat.js
node demo/tree.js
```
