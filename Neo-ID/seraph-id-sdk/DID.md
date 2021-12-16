<p align="center">
<img src="https://www.seraphid.io/assets/img/logo-dark.png" width="450px"/>
</p>

<h1></h1>

<p align="center">Seraph ID DID Definition.</p>

# Abstract

To introduce Self-Sovereign Identity support in the NEO blockchain and enforce compatibility
with the raising standards we propose a DID method for NEO. The DID is a pre-requisite for the [Seraph ID](https://seraphid.io). 

The W3C Credentials Community Group [DIDs](https://w3c-ccg.github.io/did-spec/) standard was chosen for future interopability
with other Decentralized Identifier provider. The following DID Method will be registered on [DID Method Registry](https://w3c-ccg.github.io/did-method-registry/).

## NEO-DID Method Definition

### Context
As defined in the W3C Credentials Community Group [DIDs](https://w3c-ccg.github.io/did-spec/) standard the context is defined as

```json
{
  "@context": "https://w3id.org/did/v1"
}
```

### Subject
The Seraph ID subject is "neoid" and the following format is required:

```json
did = "did:neoid:" network ":" specific-idstring
network = ("test" / "main" / "priv")
specific-idstring = NEO public address or issuer smart contract ScriptHash (see below)
```

`specific-idstring` will be generated using a NEO Public key 

```json
<pre>
{
  "id": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527"
}
```

### Public Keys
A public key section is defined in order to support encryption and cryptography operations.
The public key is generated according to the NEO cryptography available support.
If the identity is public in the network (on-chain identity) then its smart contract ScriptHash will be also listed in the available public keys. 

```json
 "publicKey": [{
    "id": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527#keys-1",
    "type": "EcdsaSecp256r1VerificationKey2019",
    "controller": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527",
    "publicKeyHex": "02103a7f7dd016558597f7960d27c516a4394fd968b9e65155eb4b013e4040406e"
  },{
    "id": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527#keys-2",
    "type": "EcdsaSecp256r1VerificationKey2019",
    "controller": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527",
    "publicKeyHex": "38fdd55282cace2081c1db2f8ac5979fa2cd23bf2d7a15c6c687190e42c5272d5a"
  }]
```

### Service Endpoint
Given the versatile nature of NEO Seraph ID for public, on-chain identity, endpoint to interact with the identity itself is represented by a smart contract. For off-chain, discrete identity, using identity cloud manager, a specific endpoint is provided.

```json
  "service": [{
    "type": "smartContractService",
    "serviceEndpoint":"https://www.cloudservice1.org/me"
  },{
    "type": "cloudWallet",
    "serviceEndpoint":"https://me.cloudservice2.com"
  }]
```

## Method Example
The following example shows the extensive DID method definition proposed for a single, public, on-chain identity (e.g. Issuer).
```json
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527",
  "authentication": [
      {
        "type": "EcdsaSecp256r1Authentication2019",
        "publicKey": [
          "did:neoid:priv:81210f2127603ae7e910e452e4a140ee4e713527#keys-1"
        ]
      },
      {
        "type": "EcdsaSecp256r1Authentication2019",
        "publicKey": [
          "did:neoid:priv:81210f2127603ae7e910e452e4a140ee4e713527#keys-2"
        ]
      }

  ]
  "publicKey": [{
    "id": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527#keys-1",
    "type": "EcdsaSecp256r1VerificationKey2019",
    "controller": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527",
    "publicKeyHex": "02103a7f7dd016558597f7960d27c516a4394fd968b9e65155eb4b013e4040406e"
  },{
    "id": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527#keys-2",
    "type": "EcdsaSecp256r1VerificationKey2019",
    "controller": "did:neoid:main:81210f2127603ae7e910e452e4a140ee4e713527",
    "publicKeyHex": "38fdd55282cace2081c1db2f8ac5979fa2cd23bf2d7a15c6c687190e42c5272d5a"
  }],
  "service": [{
    "type": "smartContractService",
    "serviceEndpoint":"https://www.cloudservice1.org/me"
  },{
    "type": "CloudService",
    "serviceEndpoint":"https://me.cloudservice2.com"
  }]
}
```

# References
- Seraph ID official page: https://seraphid.io
- Seraph ID demo application on [GitHub](https://github.com/neo-ngd/seraph-id-demo)
- Seraph ID SDK on [GitHub](https://github.com/neo-ngd/seraph-id-sdk)
- Seraph ID smart contract templates and examples on [GitHub](https://github.com/neo-ngd/seraph-id-smart-contracts.git)
