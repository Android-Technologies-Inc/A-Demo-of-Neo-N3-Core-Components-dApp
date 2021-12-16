// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import { SeraphIDAccount } from '../account';
import { DIDNetwork } from '../common';
import { SeraphIDIssuer } from '../issuer';
import { SeraphIDWallet } from '../wallet';
import testData from './test-data.json';

interface ITestData {
  account: SeraphIDAccount;
  issuer: SeraphIDIssuer;
  wallet: SeraphIDWallet;
}

function getTestData(): ITestData {
  const testObj: ITestData = {
    account: new SeraphIDAccount(testData.walletOwnerPrivateKey, DIDNetwork.PrivateNet),
    issuer: new SeraphIDIssuer(testData.issuerScriptHash, testData.neoRpcUrl, DIDNetwork.PrivateNet, testData.magic),
    wallet: new SeraphIDWallet({ name: testData.walletName }),
  };
  testObj.wallet.addAccount2(testObj.account);

  return testObj;
}

test.only('Wallet.addClaim', async () => {
  const testObj = getTestData();
  // create and store claim
  const claim = testObj.issuer.createClaim(
    'TestClaimID',
    testData.existingSchema.name,
    testData.claimAttributes,
    testObj.account.getDID(),
    new Date(),
    new Date(),
  );

  expect(testObj.wallet.addClaim(claim)).toBeUndefined();

  // retrieve claim from wallet
  const retrievedClaim = testObj.wallet.getClaim(claim.id);
  expect(retrievedClaim).toEqual(claim);
});

test.only('Wallet.addClaim.encrypted', async () => {
  const testObj = getTestData();
  const claim = testObj.issuer.createClaim(
    'testid',
    testData.existingSchema.name,
    testData.claimAttributes,
    'test',
    new Date(),
    new Date(),
  );

  await testObj.account.encrypt(testData.walletPassword);
  expect(testObj.account.addClaim(claim)).toBeUndefined();
  await testObj.account.decrypt(testData.walletPassword);
  expect(testObj.account.addClaim(claim)).toBeUndefined();
}, 10000);

test.only('Wallet.export.import', async () => {
  const testObj = getTestData();

  // generate claim from issuer and add to wallet
  const claimId = 'TestClaimID123';
  const validFrom = new Date();
  const claim = testObj.issuer.createClaim(
    claimId,
    testData.existingSchema.name,
    testData.claimAttributes,
    testObj.account.getDID(),
    validFrom,
    new Date(),
  );
  testObj.wallet.addClaim(claim);

  await testObj.account.encrypt(testData.walletPassword);

  // export wallet to JSON
  const exportedWalletJSON = JSON.stringify(testObj.wallet.export());

  // Create new wallet with exported JSON
  const importedWallet = new SeraphIDWallet(JSON.parse(exportedWalletJSON));

  // decrypt account and access getters of fields that will be compared
  await importedWallet.accounts2[0].decrypt(testData.walletPassword);
  await testObj.account.decrypt(testData.walletPassword);
  let _ = importedWallet.accounts2[0].privateKey;
  _ = importedWallet.accounts2[0].publicKey;
  _ = importedWallet.accounts2[0].scriptHash;

  expect(importedWallet).toEqual(testObj.wallet);
  const importedClaim = importedWallet.getClaim(claimId);

  expect(importedWallet.accounts2[0].getDID()).toEqual(testObj.account.getDID());
  expect(importedClaim).toBeDefined();
  if (importedClaim) {
    expect(importedClaim.validFrom).toEqual(validFrom);
  }
}, 20000);

test.only('Wallet.createDID', async () => {
  // create keys and wallet
  const testAccount = new SeraphIDAccount(testData.walletOwnerPrivateKey, DIDNetwork.PrivateNet);
  const testWallet = new SeraphIDWallet({ name: testData.walletName });
  testWallet.addAccount2(testAccount);
  expect(testWallet.getDID(0)).toEqual(testData.ownerDID);

  // create new random DID from wallet
  const did = testWallet.createDID(DIDNetwork.PrivateNet);

  expect(testWallet.accounts2.length).toEqual(2);
});

test.only('Account.encrypt.decrypt', async () => {
  const testObj = getTestData();
  // generate claim from issuer and add to wallet
  const claim = testObj.issuer.createClaim(
    'TestClaimID123',
    testData.existingSchema.name,
    testData.claimAttributes,
    testObj.account.getDID(),
    new Date(),
    new Date(),
  );
  testObj.wallet.addClaim(claim);
  const claimsBeforeEncryption = testObj.account.getAllClaims();

  await testObj.account.encrypt(testData.walletPassword);
  await testObj.account.decrypt(testData.walletPassword);
  expect(claimsBeforeEncryption).toEqual(testObj.account.getAllClaims());
}, 10000);
