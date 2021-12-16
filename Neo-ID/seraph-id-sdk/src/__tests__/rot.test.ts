// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import { DIDNetwork } from '../common';
import { SeraphIDRootOfTrust } from '../rot';
import testData from './test-data.json';

const contract = new SeraphIDRootOfTrust(testData.rotScriptHash, testData.neoRpcUrl, DIDNetwork.PrivateNet, testData.magic);

// Increase test suite timeout as we need to wait for block confirmation.
jest.setTimeout(240000);

test.only('SeraphIDRootOfTrust.getName', () => {
  expect(contract.getName()).resolves.toBe(testData.rotName);
});

test.only('SeraphIDRootOfTrust.getIssuerDID', () => {
  expect(contract.getDID()).toBe(testData.rotDID);
});

test.only('SeraphIDRootOfTrust.isTrusted.notTrusted', () => {
  const schemaName = 'TestInvalidSchema-' + new Date().getTime();
  expect(contract.isTrusted(testData.issuerDID, schemaName)).resolves.toBe(false);
});

test.only('SeraphIDRootOfTrust.registerIssuer.isTrusted.deactivated', async () => {
  const schemaName = 'Test';
try{
  const tx = await contract.registerIssuer(testData.issuerDID, schemaName, testData.rotPrivateKey);
  expect(tx).toBeDefined();
}catch(err){
  console.log("send rawtx error: ", err);
}
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const isTrusted = await contract.isTrusted(testData.issuerDID, schemaName);
  expect(isTrusted).toBe(true);

  try{
  const tx2 = await contract.deactivateIssuer(testData.issuerDID, schemaName, testData.rotPrivateKey);
  expect(tx2).toBeDefined();
  } catch(err){
    console.log("send rawtx error: ", err);
  }
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));

  const isTrusted2 = await contract.isTrusted(testData.issuerDID, schemaName);
  expect(isTrusted2).toBe(false);
});
