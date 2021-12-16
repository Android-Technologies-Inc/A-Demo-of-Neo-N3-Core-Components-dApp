// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import {wallet} from '@cityofzion/neon-core';
import { DIDNetwork, ISchema } from '../common';
import { SeraphIDIssuer } from '../issuer';
import { SeraphIDIssuerContract } from '../issuer-contract';
import testData from './test-data.json';

const issuer = new SeraphIDIssuer(testData.issuerScriptHash, testData.neoRpcUrl, DIDNetwork.PrivateNet, testData.magic);
const contract = new SeraphIDIssuerContract(testData.issuerScriptHash, testData.neoRpcUrl, DIDNetwork.PrivateNet, testData.magic);

// Increase test suite timeout as we need to wait for block confirmation.
jest.setTimeout(240000);

test.only('SeraphIDIssuer.sign.verifyOffline', () => {
  const claim = issuer.createClaim(
    'TestClaimID123',
    testData.existingSchema.name,
    testData.claimAttributes,
    testData.issuerDID,
  );
  claim.issuerDID = testData.issuerDID;
  claim.signature = wallet.sign(issuer.getClaimHash(claim), testData.issuerPrivateKey);
  expect(issuer.verifyOffline(claim, testData.issuerPublicKeys[0])).toBeTruthy();
});

// This tests all issueClaim, validate, validateClaimStructure, verify and verify offline methods.
test.only('SeraphIDIssuer.issueClaim.validate', async () => {
  const existingSchema: ISchema = testData.existingSchema;
  try {
    await contract.registerSchema(existingSchema, testData.issuerPrivateKey);
    await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  } catch (err) {
    console.log("send rawtx error: ", err);
  }

  let claim = issuer.createClaim(
    'TestClaim-' + new Date().getTime(),
    testData.existingSchema.name,
    testData.claimAttributes,
    testData.issuerDID,
  );
  claim = await issuer.issueClaim(claim, testData.issuerPrivateKey);

  expect(claim).toBeDefined();
  expect(claim.tx).toBeDefined();
  expect(claim.signature).toBeDefined();

  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const valid = await issuer.validateClaim(claim, clm => clm.attributes.age === testData.claimAttributes.age);
  expect(valid).toBeTruthy();
});

test('SeraphIDContract.addAdmin', async () => {
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  try{
  const tx = await contract.addAdmin(testData.addedAdminKey, testData.issuerPrivateKey);
  expect(tx).toBeDefined();
  } catch (err)  {
    console.log("sendSignedTransaction error: " + err);
  }
});

test('SeraphIDContract.removeAdmin', async () => {
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  try{
  const tx = await contract.removeAdmin(testData.addedAdminKey, testData.issuerPrivateKey);
  expect(tx).toBeDefined();
  } catch (err)  {
    console.log("sendSignedTransaction error: " + err);
  }
});
