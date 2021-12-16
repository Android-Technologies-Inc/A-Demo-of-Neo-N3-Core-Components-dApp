// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import { DIDNetwork, ISchema } from '../common';
import { SeraphIDIssuerContract } from '../issuer-contract';
import testData from './test-data.json';
// import util from 'util';

// global.TextEncoder = util.TextEncoder;

const contract = new SeraphIDIssuerContract(testData.issuerScriptHash, testData.neoRpcUrl, DIDNetwork.PrivateNet, testData.magic);

// Increase test suite timeout as we need to wait for block confirmation.
jest.setTimeout(240000);

test('SeraphIDContract.getIssuerName', () => {
  expect(contract.getIssuerName()).resolves.toBe(testData.issuerName);
});

test('SeraphIDContract.getIssuerDID', () => {
  expect(contract.getIssuerDID()).toBe(testData.issuerDID);
});

test('SeraphIDContract.getIssuerPublicKeys', () => {
  expect(contract.getAdminList()).resolves.toEqual(testData.issuerPublicKeys);
});

test('SeraphIDContract.getSchemaDetails.nonexistentSchema', () => {
  const nonExistentSchema = 'NonexistentSchema-' + new Date().getTime();
  expect(contract.getSchemaDetails(nonExistentSchema)).rejects.toThrowError();
});

test('SeraphIDContract.registerSchema.getSchemaDetails', async () => {
  const newSchemaName = 'TestSchema-' + new Date().getTime();
  const newSchema: ISchema = {
    attributes: testData.existingSchema.attributes,
    name: newSchemaName,
    revokable: true,
  };

  try{
    const tx = await contract.registerSchema(newSchema, testData.issuerPrivateKey);
    expect(tx).toBeDefined();
  } catch(err){
    console.log("sendSignedTransaction error: " + err);
  }

  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));

  const schemaDetails = await contract.getSchemaDetails(newSchemaName);
  expect(schemaDetails).toHaveProperty('name', newSchemaName);
});

test('SeraphIDContract.isValidClaim.invalidClaim', () => {
  const invalidClaimId = 'InvalidClaim-' + new Date().getTime();
  expect(contract.isValidClaim(invalidClaimId)).resolves.toBe(false);
});

test('SeraphIDContract.injectClaim.validClaim.revokeClaim', async () => {
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));

  const newClaimId = 'NewTestClaim-' + new Date().getTime();

  try{
  const tx = await contract.injectClaim(newClaimId, testData.issuerPrivateKey);
  expect(tx).toBeDefined();
  } catch (err)  {
    console.log("sendSignedTransaction error: " + err);
  }

  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));

  const isValid = await contract.isValidClaim(newClaimId);
  expect(isValid).toBe(true);

  try{
  const tx2 = await contract.revokeClaim(newClaimId, testData.issuerPrivateKey);
  expect(tx2).toBeDefined();
  } catch (err){
    console.log("sendSignedTransaction error: " + err);
  }

  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const isValid2 = await contract.isValidClaim(newClaimId);
  expect(isValid2).toBe(false);
});
