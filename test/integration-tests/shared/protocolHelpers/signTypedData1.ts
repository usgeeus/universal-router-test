"use strict";
// See: https://github.com/ethereum/wiki/wiki/JSON-RPC
import { Signer, TypedDataDomain, TypedDataField, TypedDataSigner } from "@ethersproject/abstract-signer";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { Logger } from "@ethersproject/logger";
const logger = new Logger("providers/5.7.2");

async function getAddress(): Promise<string> {
    if (this._address) {
        return Promise.resolve(this._address);
    }

    return this.provider.send("eth_accounts", []).then((accounts) => {
        if (accounts.length <= this._index) {
            logger.throwError("unknown account #" + this._index, Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "getAddress"
            });
        }
        return this.provider.formatter.address(accounts[this._index])
    });
}

export async function _signTypedData1(provider: any, domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
    // Populate any ENS names (in-place)
    
    const populated = await _TypedDataEncoder.resolveNames(domain, types, value, (name: string) => {
        return provider.resolveName(name);
    });
    const address = await this.getAddress();
    console.log(populated);
    try {
        return await provider.send("eth_signTypedData_v4", [
            address.toLowerCase(),
            JSON.stringify(_TypedDataEncoder.getPayload(populated.domain, types, populated.value))
        ]);
    } catch (error) {
        if (typeof(error.message) === "string" && error.message.match(/user denied/i)) {
            logger.throwError("user rejected signing", Logger.errors.ACTION_REJECTED, {
                action: "_signTypedData",
                from: address,
                messageData: { domain: populated.domain, types, value: populated.value }
            });
        }
        throw error;
    }
}