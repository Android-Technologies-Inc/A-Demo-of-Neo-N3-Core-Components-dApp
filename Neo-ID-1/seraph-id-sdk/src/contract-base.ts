// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import { rpc, tx, u, wallet, sc} from '@cityofzion/neon-core';
import neoCore from '@cityofzion/neon-core';
import bundle from '@cityofzion/neon-api';
import { DIDNetwork, IResult, SeraphIDError } from './common';
// import util from 'util';
const api = bundle(neoCore);

// global.TextEncoder = util.TextEncoder;

/**
 * Base class for Seraph ID smart contracts.
 */
export class SeraphIDContractBase {

  /**
   * Default constructor.
   * @param networkRpcUrl URL to NEO RPC.
   * @param network Network identifier used for DID
   */
  protected readonly networkRpcUrl: string;
  protected readonly network: DIDNetwork;
  protected readonly magic: number;

  constructor(networkRpcUrl: string, network: DIDNetwork, magic: number) {
    this.networkRpcUrl = networkRpcUrl;
    this.network = network;
    this.magic = magic;
  }

  /**
   * Sents signed transaction to the blockchain.
   * @param script Script for invocation.
   * @param privateKey Private key of the transaction signer.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  protected async sendSignedTransaction(
    script: string,
    privateKey: string,
    gas?: number,
  ): Promise<string> {
    const account = new wallet.Account(privateKey);
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const currentHeight = await client.getBlockCount();
    
    const transaction = new tx.Transaction({
      version: 0,
      nonce: Math.floor(Math.random()*4294967295),
      validUntilBlock: currentHeight + tx.Transaction.MAX_TRANSACTION_LIFESPAN - 1,
      signers: [new tx.Signer({account: account.scriptHash, scopes: tx.WitnessScope.CalledByEntry})],
      attributes: [],
      script: u.HexString.fromHex(script, false)
    });
    
    const invokeResult = await client.invokeScript(u.HexString.fromHex(script), transaction.signers);
    if (invokeResult.state != "HALT") {
      throw new SeraphIDError('invoke script failed', invokeResult.exception);
    }
    
    transaction.systemFee = u.BigInteger.fromNumber(invokeResult.gasconsumed);

    transaction.witnesses[0] = new tx.Witness({ invocationScript: "", verificationScript: u.HexString.fromBase64(account.contract.script)});
    const { feePerByte, executionFeeFactor } = await api.api.getFeeInformation(client);

    transaction.networkFee =  api.api.calculateNetworkFee(
      transaction,
      feePerByte,
      executionFeeFactor
    );

    transaction.witnesses = [];
    transaction.sign(account, this.magic);

    const res = await client.sendRawTransaction(transaction);
    if (!res) {
      throw new SeraphIDError('Transaction failed: ' + transaction.hash, res);
    }
    console.log(transaction.hash());
    return transaction.hash();
  }

  /**
   * Invokes a smart contract operation that returns a string.
   * @param scriptHash Hash of the smart contract's script.
   * @param operation Operation name of Seraph ID Issuer's contract.
   * @returns Operation's result as a string.
   */
  protected async getStringFromOperation(scriptHash: string, operation: string): Promise<string> {
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res = await client.invokeFunction(scriptHash, operation);
    let result: string;

    const seraphResult = this.extractResult(res);
    if (seraphResult.success) {
      result = rpc.StringParser(seraphResult.result);
    } else {
      throw new SeraphIDError(seraphResult.error, res);
    }
    return result;
  }

    /**
   * Invokes a smart contract operation that returns a string array.
   * @param scriptHash Hash of the smart contract's script.
   * @param operation Operation name of Seraph ID Issuer's contract.
   * @returns Operation's result as a string.
   */
  protected async getStringArrayFromOperation(scriptHash: string, operation: string): Promise<string[]> {
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res = await client.invokeFunction(scriptHash, operation);
    let result: string[];
    const seraphResult = this.extractResult(res);
    const length = seraphResult.result.value.length;
    if (seraphResult.success) {
      result = [];
      for (var i = 0 ; i < length; i++)
      {
        result.push(seraphResult.result.value[i].value);
      }
    } else {
      throw new SeraphIDError(seraphResult.error, res);
    }

    return result;
  }

  /**
   * Extracts the result from smart contract and wraps it in ISeraphResult.
   * @param res Smart contract's invocation result.
   * @returns Seraph result.
   */
  protected extractResult(res: rpc.InvokeResult): IResult {
    let result: any | undefined;
    let success = false;
    let error: string | undefined = "no error";
    if (res.stack != null && res.stack instanceof Array) {
      const returnObject = res.stack[0];
      result = returnObject;
      success = true;
      if (returnObject.type === 'Array') {
        const arr = returnObject.value as Array<sc.StackItemJson>;
        for (var i = 0; i < arr.length; i++){
          arr[i].value = arr[i].type === "ByteString" ? u.HexString.fromBase64(arr[i].value as string).toString() : arr[i].value;
        }
        result.value = arr;
      } else if (returnObject.type === "ByteString"){
        result.value = u.HexString.fromBase64(returnObject.value as string).toString();
      } 
    } else {
      error = res.exception === null ? undefined : res.exception;
    }
    const outcome: IResult = {
      error,
      result,
      success,
    };

    return outcome;
  }
}