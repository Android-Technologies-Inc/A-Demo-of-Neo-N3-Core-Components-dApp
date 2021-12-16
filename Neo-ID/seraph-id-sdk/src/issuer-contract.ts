// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import { rpc, sc} from '@cityofzion/neon-js';

import { DIDNetwork, ISchema, IssuerOperation, SeraphIDError } from './common';
import { SeraphIDContractBase } from './contract-base';

/**
 * Direct communication interface with Seraph ID smart contract of the Issuer.
 */
export class SeraphIDIssuerContract extends SeraphIDContractBase {
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
   * Returns official name of the Issuer.
   * @returns Issuer's name.
   */
  public async getIssuerName(): Promise<string> {
    return this.getStringFromOperation(this.scriptHash, IssuerOperation.Name);
  }

  /**
   * Retruns DID of the issuer.
   * @returns Issuer's DID.
   */
  public getIssuerDID(): string {
    return `did:neoid:${this.network}:${this.scriptHash}`;
  }

  /**
   * Returns public key of the issuer required to validate claim's signature.
   * @returns Issuer's public key.
   */
  public async getAdminList(): Promise<string[]> {
    return this.getStringArrayFromOperation(this.scriptHash, IssuerOperation.GetAdminsList);
  }

    /**
   * Adds public key of the issuer required to validate claim's signature.
   * @returns Issuer's public key.
   */
     public async addAdmin(admin: string, issuerPrivateKey: string, gas?: number): Promise<string> {
      const adminPubKey = sc.ContractParam.publicKey(admin);
      
      return this.sendSignedTransaction(sc.createScript({
        scriptHash: this.scriptHash,
        operation: IssuerOperation.AddAdmin,
        args: [adminPubKey]
      }), issuerPrivateKey, gas);
    }

  /**
   * Adds public key of the issuer required to validate claim's signature.
   * @returns Issuer's public key.
   */
  public async removeAdmin(admin: string, issuerPrivateKey: string, gas?: number): Promise<string> {
  const adminPubKey = sc.ContractParam.publicKey(admin);

  return this.sendSignedTransaction(sc.createScript({
    scriptHash: this.scriptHash,
    operation: IssuerOperation.RemoveAdmin,
    args: [adminPubKey]
  }), issuerPrivateKey, gas);
  }

  /**
   * Returns the schema for specified name.
   * @param schemaName Name of the schema.
   * @returns Detailed meta data structure of the given schema.
   */
  public async getSchemaDetails(schemaName: string): Promise<ISchema> {
    const paramSchemaName = sc.ContractParam.string(schemaName);
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res: any = await client.invokeFunction(
      this.scriptHash,
      IssuerOperation.GetSchemaDetails,
      [paramSchemaName],
    )
    const seraphResult = this.extractResult(res);
    if (!seraphResult.success) {
      throw new SeraphIDError(seraphResult.error, res);
    }

    const schema: ISchema = JSON.parse(rpc.StringParser(seraphResult.result));
    return schema;
  }

  /**
   * Checks if claim with the given ID is valid.
   * That is: if it was issued by this issuer and was not yet revoked.
   * Claim's optional validity dates (from-to) are not a part of this check.
   * @param claimId ID of the claim.
   * @returns True if claim is valid, false otherwise.
   */
  public async isValidClaim(claimId: string): Promise<boolean> {
    const paramClaimId = sc.ContractParam.string(claimId);
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res: any = await client.invokeFunction(
      this.scriptHash,
      IssuerOperation.IsValidClaim,
      [paramClaimId],
    );

    let result = false;
    if (res.stack != null && res.stack.length === 1) {
      result = res.stack[0].value;
    } else {
      const seraphResult = this.extractResult(res);
      if (!seraphResult.success) {
        throw new SeraphIDError(seraphResult.error, res);
      }

      result = rpc.IntegerParser(seraphResult.result) !== 0;
    }

    return result;
  }

  /**
   * Registers a new schema in Issuer's smart contract.
   * @param schema Schema to register.
   * @param issuerPrivateKey Private key of the issuer to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async registerSchema(schema: ISchema,issuerPrivateKey: string,gas?: number): Promise<string> {
    const paramName = sc.ContractParam.string(schema.name);
    const paramDefinition = sc.ContractParam.string(JSON.stringify(schema));
    
    const script = sc.createScript({
      scriptHash: this.scriptHash,
      operation: IssuerOperation.RegisterSchema,
      args: [paramName, paramDefinition]
    })
    return this.sendSignedTransaction(script, issuerPrivateKey, gas);
  }

  /**
   * Injects an issued claim of specified ID into Issuer's smart contract.
   * @param claimId ID of issued claim.
   * @param issuerPrivateKey Private key of the issuer to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async injectClaim(
    claimId: string,
    issuerPrivateKey: string,
    gas?: number,
  ): Promise<string> {
    const paramClaimId = sc.ContractParam.string(claimId);

    return this.sendSignedTransaction(sc.createScript({
      scriptHash: this.scriptHash,
      operation: IssuerOperation.InjectClaim,
      args: [paramClaimId]
    }), issuerPrivateKey, gas);
  }

  /**
   * Revokes previously issued claim of specified ID.
   * @param gas Id ID of issued claim.
   * @param issuerPrivateKey Private key of the issuer to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async revokeClaim(
    claimId: string,
    issuerPrivateKey: string,
    gas?: number,
  ): Promise<string> {
    const paramClaimId = sc.ContractParam.string(claimId);

    return this.sendSignedTransaction(sc.createScript({
      scriptHash: this.scriptHash,
      operation: IssuerOperation.RevokeClaim,
      args: [paramClaimId]
    }), issuerPrivateKey, gas);
  }

  /**
   * Invokes schema registration operation without sending a transaction.
   * @param schema The schema to be registered.
   */
  public async registerSchemaTest(schema: ISchema): Promise<void> {
    const paramName = sc.ContractParam.string(schema.name);
    const paramDefinition = sc.ContractParam.string(JSON.stringify(schema));
    const paramRevokable = sc.ContractParam.boolean(schema.revokable);
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res: any = await client.invokeFunction(
      this.scriptHash,
      IssuerOperation.RegisterSchema,
      [paramName,
      paramDefinition,
      paramRevokable]
    )
    
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new SeraphIDError(seraphResult.error, res);
    }
  }

  /**
   * Invokes claim injection operation without sending a transaction.
   * @param claimId ID of the issued claim.
   */
  public async injectClaimTest(claimId: string): Promise<void> {
    const paramClaimId = sc.ContractParam.string(claimId);
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res: any = await client.invokeFunction(this.scriptHash, IssuerOperation.InjectClaim, [paramClaimId]);
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new SeraphIDError(seraphResult.error, res);
    }
  }

  /**
   * Invokes claim revocation operation without sending a transaction.
   * @param claimId ID of the claim to be revoked.
   */
  public async revokeClaimTest(claimId: string): Promise<void> {
    const paramClaimId = sc.ContractParam.string(claimId);
    const client = new rpc.RPCClient(this.networkRpcUrl);
    const res: any = await client.invokeFunction(this.scriptHash, IssuerOperation.RevokeClaim, [paramClaimId]);
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new SeraphIDError(seraphResult.error, res);
    }
  }
}
