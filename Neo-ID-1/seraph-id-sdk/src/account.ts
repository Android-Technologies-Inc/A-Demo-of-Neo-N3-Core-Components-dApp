// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import { wallet } from '@cityofzion/neon-core';
import { enc } from 'crypto-js';
import AES from 'crypto-js/aes';
import { IClaim, SeraphIDError } from './common';


/**
 * Seraph ID account as JSON.
 * Accounts with their claims inside in this form are encrypted.
 */

export interface ISeraphIDAccountJSON extends wallet.AccountJSON {
  extra: { [key: string]: any };
  claims: string | undefined;
}

/**
 * Single DID account storing all claims issued for this DID.
 */
export class SeraphIDAccount extends wallet.Account {
  // DID Network key in extra's map.
  public static readonly DID_NETWORK = 'DIDnetwork';

  // The claims in this account.
  public claims: { [key: string]: IClaim };

  // The claims in encrypted form.
  private encryptedClaims?: string;

  // Indicates if the account is locked (true) or decrypted (false).
  private isLocked: boolean;

  public extra: { [key: string]: any } = {};

  /**
   * Default constructor.
   * @param str The account.
   * @param didNetwork DID network for which this account is used according to NEO DID definition (e.g. 'test' or 'main').
   */
  constructor(str: string | Partial<ISeraphIDAccountJSON> = '', didNetwork: string) {
    super(str);
    this.claims = {};
    this.isLocked = false;
    this.extra[SeraphIDAccount.DID_NETWORK] = didNetwork;

    if (typeof str === 'object' && !!str) {
      this.encryptedClaims = str.claims;
      this.isLocked = !!str.key;
    }
  }

  /**
   * Returns a DID of this account.
   * @returns DID of this account.
   */
  public getDID(): string {
    return `did:neoid:${this.extra[SeraphIDAccount.DID_NETWORK]}:${this.address}`;
  }

  /**
   * Adds a given claim to this account.
   * @param claim The claim to be added to this account.
   */
  public addClaim(claim: IClaim) {
    if (this.isLocked) {
      throw new SeraphIDError('Decrypt account before adding claims.');
    }
    if (!claim || !claim.id) {
      throw new SeraphIDError('This claim is invalid');
    }

    if (this.claims[claim.id]) {
      throw new SeraphIDError(`Claim with id ${claim.id} already exists`);
    }
    this.claims[claim.id] = claim;
  }

  /**
   * Returns a claim of specified ID that is stored in this account.
   * @param claimId The claim ID as given by the issuer.
   */
  public getClaim(claimId: string): IClaim | undefined {
    if (this.isLocked) {
      throw new SeraphIDError('Decrypt account first');
    }

    return this.claims[claimId];
  }

  /**
   * Returns all claims stored in this account.
   * @returns All claims stored in this account or empty array.
   */
  public getAllClaims(): IClaim[] {
    if (this.isLocked) {
      throw new SeraphIDError('Decrypt account first');
    }

    return Object.values(this.claims) || [];
  }

  /**
   * Exports the account.
   * Account must be encrypted upfront or it will fail.
   * @returns Exported account.
   */
  public export(): ISeraphIDAccountJSON {
    if (!this.encryptedClaims) {
      throw new SeraphIDError('Encrypt account before exporting it.');
    }

    const acc = super.export() as ISeraphIDAccountJSON;
    acc.claims = this.encryptedClaims;
    acc.extra = this.extra;
    return acc;
  }

  /**
   * Encrypts the contents of this account.
   * @param keyphrase Encryption password.
   * @param scryptParams Script parameters.
   * @return This account with encrypted claims.
   */
  public async encrypt(keyphrase: string, scryptParams?: wallet.ScryptParams | undefined): Promise<this> {
    const acc = await super.encrypt(keyphrase, scryptParams);

    acc.encryptedClaims = AES.encrypt(JSON.stringify(this.claims), keyphrase).toString();

    return acc;
  }

  /**
   * Decrypts the claims in this account.
   * @param keyphrase Decryption password.
   * @param scryptParams Script parameters.
   * @returns This account with decrypted claims.
   */
  public async decrypt(keyphrase: string, scryptParams?: wallet.ScryptParams | undefined): Promise<this> {
    const acc = await super.decrypt(keyphrase, scryptParams);
    if (this.encryptedClaims) {
      const decryptedClaims = AES.decrypt(this.encryptedClaims, keyphrase).toString(enc.Utf8);
      acc.claims = JSON.parse(decryptedClaims, this.dateReviver);
    } else {
      acc.claims = {};
    }

    this.isLocked = false;

    return acc;
  }

  /**
   * Revives the given JSON string back into a date format.
   * @param key  Attribute key.
   * @param value Attribute value.
   */
  private dateReviver(key: string, value: any) {
    if (typeof value === 'string') {
      const a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
      if (a) {
        return new Date(value.toString());
      }
    }

    return value;
  }
}
