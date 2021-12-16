// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import {rpc, sc} from '@cityofzion/neon-js';
import { DIDNetwork, RootOfTrustOperation, SeraphIDError } from './common';
import { SeraphIDContractBase } from './contract-base';

/**
 * Direct communication interface with Root's of Trust Seraph ID smart contract.
 */
export class SeraphIDRootOfTrust extends SeraphIDContractBase {
  /**
   * Default constructor.
   * @param scriptHash Script hash of issuer's smart contract.
   * @param networkRpcUrl URL to NEO RPC.
   * @param network Network identifier used for DID
   */
  constructor(
    protected readonly scriptHash: string,
    protected readonly networkRpcUrl: string,
    protected readonly network: DIDNetwork,
    protected readonly magic: number,
  ) {
    super(networkRpcUrl, network, magic);
  }

  /**
   * Returns official name of the Root of Trust.
   * @returns Root of Trust name.
   */
  public async getName(): Promise<string> {
    return this.getStringFromOperation(this.scriptHash, RootOfTrustOperation.Name);
  }

  /**
   * Retruns DID of the issuer.
   * @returns Root of Trust DID.
   */
  public getDID(): string {
    return `did:neoid:${this.network}:${this.scriptHash}` 
  }

  /**
   * Checks if the given issuer with the schema name are trusted by this RoT.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   * @returns True if issuer and their schema is trusted by RoT.
   */
  public async isTrusted(issuerDID: string, schemaName: string): Promise<boolean> {
    const paramIssuerDID = sc.ContractParam.string(this.trimedDID(issuerDID));
    const paramSchemaName = sc.ContractParam.string(schemaName);
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res: any = await client.invokeFunction(
      this.scriptHash,
      RootOfTrustOperation.IsTrusted,
      [paramIssuerDID,
      paramSchemaName]
    );
    const seraphResult = this.extractResult(res);
    if (!seraphResult.success) {
      throw new SeraphIDError(seraphResult.error, res);
    }

    return seraphResult.result.value;
  }

  /**
   * Registers the given issuer and specified schema as trusted by this RoT.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   * @param rotPrivateKey Private key of the RoT to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async registerIssuer(
    issuerDID: string,
    schemaName: string,  
    rotPrivateKey: string,
    gas: number = 0,
  ): Promise<string> {
    const paramIssuerDID = sc.ContractParam.string(this.trimedDID(issuerDID));
    const paramSchemaName = sc.ContractParam.string(schemaName);

    return this.sendSignedTransaction(sc.createScript({
      scriptHash: this.scriptHash,
      operation: RootOfTrustOperation.RegisterIssuer,
      args: [
        paramIssuerDID,
        paramSchemaName
      ]
    }), rotPrivateKey, gas);
  }

  /**
   * Deactivates the given issuer and specified schema as trusted trusted by this RoT.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   * @param rotPrivateKey Private key of the RoT to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async deactivateIssuer(
    issuerDID: string,
    schemaName: string,
    rotPrivateKey: string,
    gas?: number,
  ): Promise<string> {
    const paramIssuerDID = sc.ContractParam.string(this.trimedDID(issuerDID));
    const paramSchemaName = sc.ContractParam.string(schemaName);

    return this.sendSignedTransaction(sc.createScript({
      scriptHash: this.scriptHash,
      operation: RootOfTrustOperation.DeactivateIssuer,
      args: [paramIssuerDID, paramSchemaName]
    }), rotPrivateKey, gas);
  }

  /**
   * Invokes schema registration operation without sending a transaction.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   */
  public async registerIssuerTest(issuerDID: string, schemaName: string): Promise<void> {
    const paramIssuerDID = sc.ContractParam.string(this.trimedDID(issuerDID));
    const paramSchemaName = sc.ContractParam.string(schemaName);
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res: any = await client.invokeFunction(
      this.scriptHash,
      RootOfTrustOperation.RegisterIssuer,
      [paramIssuerDID,
      paramSchemaName]
    );
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new SeraphIDError(seraphResult.error, res);
    }
  }

  /**
   * Invokes deactivation operation without sending a transaction.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   */
  public async deactivateIssuerTest(issuerDID: string, schemaName: string): Promise<void> {
    const paramIssuerDID = sc.ContractParam.string(this.trimedDID(issuerDID));
    const paramSchemaName = sc.ContractParam.string(schemaName);
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res: any = await client.invokeFunction(
      this.scriptHash,
      RootOfTrustOperation.DeactivateIssuer,
      [paramIssuerDID,
      paramSchemaName]
    );
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new SeraphIDError(seraphResult.error, res);
    }
  }

  private trimedDID(issuerDID: string): string{
    return issuerDID.substring(9); // priv:0x0d2c6f2b036ab1da64030a0554fb2a6aa24be730
  }
}
