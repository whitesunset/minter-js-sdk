import axios from 'axios';
import MinterTx from 'minterjs-tx';
import {formatCoin} from 'minterjs-tx/src/helpers';
import ethUtil from 'ethereumjs-util';
import {Buffer} from 'safe-buffer';

/**
 * @typedef {Object} TxParams
 * @property {string|Buffer} privateKey
 * @property {string} gasCoin
 * @property {string|Buffer} txType
 * @property {Buffer} txData
 * @property {string} message
 */

/**
 * @param {Object} options
 * @param {string} options.baseURL
 * @return {Function<Promise>}
 */
export default function SendTx(options) {
    const minterNode = axios.create(options);

    /**
     * @param {TxParams} txParams
     * @param {string|Buffer} txParams.privateKey
     * @param {string} txParams.gasCoin
     * @param {string|Buffer} txParams.txType
     * @param {Buffer} txParams.txData
     * @param {string} txParams.message
     * @return {Promise}
     */
    return function sendTx(txParams) {
        let {privateKey, gasCoin = 'BIP', txType, txData, message} = txParams;
        // @TODO asserts
        if (typeof privateKey === 'string') {
            privateKey = Buffer.from(privateKey, 'hex');
        }
        const address = ethUtil.privateToAddress(privateKey).toString('hex');
        return new Promise((resolve, reject) => {
            getNonce(minterNode, address)
                .then((nonce) => {
                    const txParams = {
                        nonce: `0x${nonce.toString(16)}`,
                        gasPrice: '0x01',
                        gasCoin: formatCoin(gasCoin),
                        type: txType,
                        data: txData,
                    };
                    if (message) {
                        txParams.payload = `0x${Buffer.from(message, 'utf-8').toString('hex')}`;
                    }

                    const tx = new MinterTx(txParams);
                    tx.sign(privateKey);

                    minterNode.post('/api/sendTransaction', {
                        transaction: tx.serialize().toString('hex'),
                    })
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    }
}

/**
 * Get nonce for new transaction: last transaction number + 1
 * @param {AxiosInstance} minterNode
 * @param {string} address
 * @return {Promise<number>}
 */
export function getNonce(minterNode, address) {
    return minterNode.get(`/api/transactionCount/${address}`)
        .then((response) => Number(response.data.result.count) + 1);
}
