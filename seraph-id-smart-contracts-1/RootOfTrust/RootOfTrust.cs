using Neo;
using Neo.SmartContract;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;
using System;

namespace SeraphID
{
    /// <summary>
    /// SeraphID Trust Anchor Smart Contract
    /// </summary>
    public class RootOfTrust : SmartContract
    {
        private static readonly string ROT_NAME = "SeraphID Trust Anchor";

        [InitialValue("NKv1ZaKZBQ73bVDJ9nk6QtoWkGLER6n5XC", ContractParameterType.Hash160)]
        private static readonly UInt160 Owner = default;

        /// <summary>
        /// Get RootofTrust name
        /// </summary>
        public static string Name()
        {
            return ROT_NAME;
        }

        /// <summary>
        /// Checks if given issuer-schema pair is trusted
        /// </summary>
        /// <param name="issuerDID">issuerDID (string)</param>
        /// <param name="schemaName">the schema name</param>
        public static bool IsTrusted(string issuerDID, string schemaName)
        {
            StorageMap issuerTrustList = new StorageMap(Storage.CurrentContext, issuerDID);
            return issuerTrustList[schemaName] != null;
        }

        /// <summary>
        /// Registers an issuer-schema pair.
        /// </summary>
        /// <param name="issuerDID">issuer ID</param>
        /// <param name="schemaName">the schema name</param>
        public static bool RegisterIssuer(string issuerDID, string schemaName)
        {
            if (!Runtime.CheckWitness(Owner)) throw new Exception("No authorization.");
            StorageMap issuerTrustList = new StorageMap(Storage.CurrentContext, issuerDID);
            issuerTrustList.Put(schemaName, 0);
            return true;
        }

        /// <summary>
        /// Deactivates a trusted issuer-schema pair
        /// </summary>
        /// <param name="issuerDID">issuerDID (string)</param>
        /// <param name="schemaName">schemaName (string)</param>
        public static bool DeactivateIssuer(string issuerDID, string schemaName)
        {
            if (!Runtime.CheckWitness(Owner)) throw new Exception("No authorization.");
            StorageMap issuerTrustList = new StorageMap(Storage.CurrentContext, issuerDID);
            if (issuerTrustList[schemaName] is null) throw new Exception("No such issuer-schema pair registered");

            issuerTrustList.Delete(schemaName);

            return true;
        }
    }
}
