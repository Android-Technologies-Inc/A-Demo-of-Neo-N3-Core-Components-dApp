using Neo.Cryptography.ECC;
using Neo.SmartContract.Framework.Services;
using System;

namespace SeraphID
{
    /// <summary>
    /// SeraphID Issuer Smart Contract
    /// </summary>
    partial class Issuer
    {
        private const byte Prefix_Admin = 0x03;
        private static StorageMap AdminList => new StorageMap(Storage.CurrentContext, Prefix_Admin);


        /// <summary>
        /// Add an admin
        /// </summary>
        /// <param name="pubKey"></param>
        /// <returns>true if added successfully</returns>
        public static bool AddAdmin(ECPoint pubKey)
        {
            if (!Runtime.CheckWitness(Owner)) throw new Exception("No authorization.");
            if (AdminList[pubKey] is not null) throw new InvalidOperationException("The admin already exists.");
            AdminList.Put(pubKey, 0);
            return true;
        }


        /// <summary>
        /// Remove an admin
        /// </summary>
        /// <param name="pubKey"></param>
        /// <returns>true if removed successfully</returns>
        public static bool RemoveAdmin(ECPoint pubKey)
        {
            if (!Runtime.CheckWitness(Owner)) throw new Exception("No authorization.");
            if (AdminList[pubKey] is null) throw new InvalidOperationException("The admin does not exist.");
            AdminList.Delete(pubKey);
            return true;
        }


        /// <summary>
        /// Get the current admin list
        /// </summary>
        /// <returns>The public keys of the admins</returns>
        public static ECPoint[] GetAdminList()
        {
            // List<ECPoint> ret = null;
            Iterator pubKeyList = AdminList.Find(FindOptions.RemovePrefix | FindOptions.KeysOnly);
            int count = 0;
            while (pubKeyList.Next())
            {
                count++;
            }
            ECPoint[] pubKeys = new ECPoint[count];
            pubKeyList = AdminList.Find(FindOptions.RemovePrefix | FindOptions.KeysOnly);
            int i = 0;
            while (pubKeyList.Next())
            {
                pubKeys[i++] = (ECPoint)pubKeyList.Value;
            }
            return pubKeys;
        }

        /// <summary>
        /// check if the caller is the memeber of the admin list
        /// </summary>
        /// <returns>true if it is</returns>
        private static bool IsCalledByAdmin()
        {
            ECPoint[] pubkeys = GetAdminList();
            int pubkeyIndex = 0;
            for (; pubkeyIndex < pubkeys.Length; pubkeyIndex++)
            {
                if (Runtime.CheckWitness(Contract.CreateStandardAccount(pubkeys[pubkeyIndex]))) break;
            }
            if (pubkeyIndex >= pubkeys.Length) return false;
            return true;
        }
    }
}
