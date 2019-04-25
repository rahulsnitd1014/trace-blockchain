/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Iterators } from 'fabric-shim';
import { asn } from './asn';
import { AdvanceShipNotice } from './asn';

export class Trace extends Contract {
    public async initLedger(ctx: Context) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    public async createASN(ctx: Context, poNumber: string, asnXML: string, asnJson: string) {
        console.info('============= START : Create ASN ===========');
        const advanceShipNotice: AdvanceShipNotice = JSON.parse(asnJson);
        const asn: asn = {
            advanceShipNotice,
            asnJson,
            asnXML,
            docType: 'asn',
            poNumber,
        };

        console.info('Asn Json  asn:: ' + asn.asnJson + '::::=====>>>' + asn.advanceShipNotice.FileHeader.GSSenderID +
        '=====>>>' + asn.asnXML);

        await ctx.stub.putState(poNumber, Buffer.from(JSON.stringify(asn)));
        console.info('============= END : Create ASN ===========');
    }

    public async queryASN(ctx: Context, poNumber: string): Promise<string> {
        const asnAsBytes = await ctx.stub.getState(poNumber); // get the asn from chaincode state
        if (!asnAsBytes || asnAsBytes.length === 0) {
            throw new Error(`${poNumber} does not exist`);
        }
        console.log(asnAsBytes.toString());
        return asnAsBytes.toString();
    }

    public async createPO(ctx: Context, poNumber: string, poJson: string): Promise<string> {
        console.info('============= START : Create PO ===========');
        const obj = this.convertToJson(poJson);
        await ctx.stub.putState(poNumber, Buffer.from(JSON.stringify(obj)));
        console.info('============= END : Create PO ===========');
        return poJson;
    }

    public async POHistory(ctx: Context, poNumber: string): Promise<string> {
        console.info('============= START : Get PO History ===========');
        const history = [];
        const historyIt  = await ctx.stub.getHistoryForKey(poNumber);
        const resp =  await this.serializeHistoryData(history, historyIt);
        console.info('============= END : Get PO History ===========');
        return resp;
    }

    public async createLocation(ctx: Context, locationId: string, locationJson: string): Promise<string> {
        console.info('============= START : Create Location ===========');
        const obj = this.convertToJson(locationJson);
        await ctx.stub.putState(locationId, Buffer.from(JSON.stringify(obj)));
        console.info('============= END : Create Location ===========');
        return locationJson;
    }

    public async createProduct(ctx: Context, productId: string, productJson: string): Promise<string> {
        console.info('============= START : Create Product ===========');
        const obj = this.convertToJson(productJson);
        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(obj)));
        console.info('============= END : Create Product ===========');
        return productJson;
    }

    private async serializeHistoryData(arr, obj: Iterators.HistoryQueryIterator) {
        let flag = true;
        while (flag) {
            const response = await obj.next();
            if (response.value && response.value.value && response.value.value.toString()) {
                try {
                    const tmp = JSON.parse(response.value.value.toString('utf8'));
                    arr.push(tmp);
                } catch (e) {
                    arr.push(response.value.value.toString('utf8'));
                }
            }
            if (response.done) {
                flag = false;
            }
        }
        return arr;
    }

    private convertToJson(strJson: string) {
        let obj = strJson;
        try {
            obj = JSON.parse(strJson);
        } catch (e) {
            //
        }
        return obj;
    }

}
