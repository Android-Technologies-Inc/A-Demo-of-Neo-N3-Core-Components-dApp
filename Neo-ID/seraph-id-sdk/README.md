

<p align="center">
<img
    src="https://www.seraphid.io/assets/img/logo-dark.png"
    width="450px">
</p>
<h1></h1>
<p align="center">
  Seraph ID JavaScript SDK.
</p>

<p align="center">      
  <a href="https://github.com/swisscom-blockchain/seraph-id-sdk/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?color=green">
  </a>
</p>

# Overview

This is the JavaScript SDK for Seraph ID - a self-sovereign identity solution on the NEO blockchain platform. This project aims to be a lightweight and simple helper to use Seraph ID wallets, claims issuance and verification in the browser.

Visit the [Seraph ID](https://www.seraphid.io/) official web page to learn more about self-sovereign identity!

# Getting started

## Step for Setup:

1. Go to /seraph-id-sdk/neon-js-5.0.0-next.X

```
yarn
yarn bootstrap
yarn build
yarn dist
```

2. Go to /seraph-id-sdk

```
yarn add -P loglevel bignumber.js axios
yarn
yarn build
```

## Installation

### Node.js

```js
npm i @sbc/seraph-id-sdk --save
```

## Usage

### Node.js

```js
var seraphId = require('@sbc/seraph-id-sdk');
```

#### Seraph ID Owner

Create a new wallet:
```js
var wallet = new seraphId.SeraphIDWallet({ name: 'MyWallet' });
```

Generate a new DID (here for private network):
```js
var myDID = wallet.createDID(DIDNetwork.PrivateNet); // e.g. did:neoid:priv:AKkkumHbBipZ46UMZJoFynJMXzSRnBvKcs
```

Add a claim issued by Seraph ID issuer:
```js
wallet.addClaim(claim);
```

Encrypt and export wallet:
```js
account.encrypt('password');
const exportedWalletJSON = JSON.stringify(wallet.export());
```

Import wallet, decrypt it and get all claims of a specified DID or a claim by ID:
```js
const wallet = new SeraphIDWallet(JSON.parse(exportedWalletJSON));
account.decrypt('password');

var allClaims = wallet.getAllClaims('did:neoid:priv:AKkkumHbBipZ46UMZJoFynJMXzSRnBvKcs');
var claim = wallet.getClaim('claimId');
```

#### Seraph ID Issuer

Create issuer instance:
```js
var issuer = new seraphId.SeraphIDIssuer('issuerSmartContractScriptHash', 'http://localhost:10332', DIDNetwork.PrivateNet, 5195086);
```

Create a new (revokable) credentials schema:
```js
issuer.registerNewSchema('schemaName', ['firstName', 'lastName', 'age'], true, 'issuerPrivateKey');
```

Create and issue a claim: 
```js
var claim = issuer.createClaim('claimId', 'schemaName', {'firstName': 'John', 'lastName': 'Doe', 'age': 26}, 'did:neoid:priv:AKkkumHbBipZ46UMZJoFynJMXzSRnBvKcs');

issuer.issueClaim(claim, 'issuerPrivateKey');
```

Revoke previously issued claim (if schema allows revocation):
```js
issuer.revokeClaimById('claimId','issuerPrivateKey');
```

#### Seraph ID Verifier

Create verifier instance:
```js
var verifier = new seraphId.SeraphIDVerifier('issuerSmartContractScriptHash', 'http://localhost:10332', DIDNetwork.PrivateNet, 5195086);
```

Get meta-data of issuer's credentials schema:
```js
var schema = verifier.getSchemaDetails('schemaName');
```

Verify the given owner's claim offline (having issuer's public key):
```js
var verfied = verifier.verifyOffline(claim, 'issuerPublicKey');
```

Validate the given owner's claim. Validation includes online verification, claim revocation and validity dates check. Optionally custom validation function can be passed.
```js
var valid = verifier.validateClaim(claim, function customClaimValidator(clm) {
    return clm.attributes.age > 18;
});
```

Check if issuer of owner's claim is trusted by the given Root of Trust:
```js
var trusted = verifier.isIssuerTrusted('scriptHashOfRoTSmartContract', claim.issuerDID, claim.schemaName);
```

#### Seraph ID Root of Trust

Create Root of Trust instance:
```js
var rot = new seraphId.SeraphIDRootOfTrust('rotSmartContractScriptHash', 'http://localhost:10332', DIDNetwork.PrivateNet, 5195086);
```

Register issuer's DID and schema as trusted:
```js
rot.registerIssuer('did:neoid:priv:AKkkumHbBipZ46UMZJoFynJMXzSRnBvKcs', 'SchemaName', 'rootOfTrustPrivateKey');
```

Remove trust for issuer's DID and schema from RoT:
```js
rot.deactivateIssuer('did:neoid:priv:AKkkumHbBipZ46UMZJoFynJMXzSRnBvKcs', 'SchemaName', 'rootOfTrustPrivateKey');
```

Check if issuer is trusted with the given schema:
```js
var trusted = rot.isTrusted('did:neoid:priv:AKkkumHbBipZ46UMZJoFynJMXzSRnBvKcs', 'SchemaName');
```


# Contributing

## Setup

This repository is a typescript repository using Yarn. Please ensure the following is installed:

- Yarn (v 1.16.0 or higher)
- Node (latest LTS)

```sh
git clone https://github.com/neo-ngd/seraph-id-sdk.git
cd seraph-id-sdk
yarn
yarn build
```

## Testing

Before executing unit tests, please make sure to have:
- Both the smart contract of Issuer and RootOfTrust are deployed on your network.
- Network information and test data maintained properly in `__tests__/test-data.json` file.

```sh
yarn test
```

# References
- Seraph ID official page: https://seraphid.io
- Seraph ID demo application on [GitHub](https://github.com/neo-ngd/seraph-id-demo)
- Seraph ID smart contract templates and examples on [GitHub](https://github.com/neo-ngd/seraph-id-smart-contracts)
- Seraph ID chrome extension [GitHub](https://github.com/swisscom-blockchain/seraph-id-chrome-extension)
- Seraph ID DID resolver on
  [GitHub](https://github.com/swisscom-blockchain/seraph-id-did-driver)


# License

- Open-source [MIT](https://github.com/swisscom-blockchain/seraph-id-sdk/blob/master/LICENSE).
