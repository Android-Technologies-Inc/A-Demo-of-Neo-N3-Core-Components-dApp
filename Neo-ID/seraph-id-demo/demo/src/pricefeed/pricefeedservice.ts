
import { wallet, rpc, sc, u, CONST} from '@cityofzion/neon-core';
import { SeraphIDError, DIDNetwork, IResult } from '@sbc/seraph-id-sdk/common';
import { SeraphIDContractBase } from '@sbc/seraph-id-sdk/contract-base';
import * as configs from '../configs';
import neoCore from '@cityofzion/neon-core';
import bundle from '@cityofzion/neon-api';
const api = bundle(neoCore);
/**
 * Direct communication interface with Seraph ID smart contract of the Issuer.
 */
export class PriceFeedService extends SeraphIDContractBase {
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
   * Returns the neo price based on price feed service.
   * @returns Issuer's name.
   */
 public async getPrice(): Promise<number> {
  const symbol = sc.ContractParam.string("GAS-USDT");
  const index = await this.getBestBlock();
  console.log("the block index is " + index);
  const blockIndex = sc.ContractParam.string(index);
  const provider = sc.ContractParam.array(sc.ContractParam.hash160(configs.OKEX_PROVIDER));

  const client = new rpc.RPCClient(this.networkRpcUrl);
  const res: any = await client.invokeFunction(
    this.scriptHash,
    "getPrice",
    [symbol, blockIndex, provider],
  )
  const result = this.extractResult(res);
  if (!result.success) {
    throw new SeraphIDError(result.error, res);
  }
  const price = result.result.value;
  console.log(parseFloat(u.base642utf8(price)));
  return parseFloat(u.base642utf8(price));
}

/**
   * Returns the index of the block where the price is the most recent.
   * @returns Issuer's name.
   */
 public async getBestBlock(): Promise<string> {
    return this.getStringFromOperation(this.scriptHash, "bestBlockIndex");
  }

  public async payFlat(ownerPrivKey: string, flatWalletAddress: string, amount: number): Promise<String>{
    const client = new rpc.NeoServerRpcClient(this.networkRpcUrl);
    const facade = await api.api.NetworkFacade.fromConfig({ node: client });
    const fromAccount = new wallet.Account(ownerPrivKey);

    const txid = await facade.transferToken(
      [
        {
          from: fromAccount,
          to: flatWalletAddress,
          contractHash: CONST.NATIVE_CONTRACT_HASH.GasToken,
          decimalAmt: amount,
        },
      ],
      {
        signingCallback: api.api.signWithAccount(fromAccount),
      }
    );
    console.log("transfer completed with tx id: " + txid);
    return txid;
  }

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
      } else if (returnObject.type === "Map") {
        const map = returnObject.value as sc.StackItemValue;
        result.value = map[0].value.value;
      }
      else {
        error = res.exception === null ? undefined : res.exception;
      } 
    }
    const outcome: IResult = {
      error,
      result,
      success,
    };
    return outcome;
  }
}
