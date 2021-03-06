import DelegateTxData from '~/src/tx-data/stake-delegate';
import {clearData} from '~/test/utils';

describe('DelegateTxData', () => {
    const txParamsData = {
        publicKey: 'Mpf9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3',
        coin: 'MNT',
        stake: 100,
    };
    const txData = new DelegateTxData(txParamsData).serialize();

    test('.fromRlp', () => {
        const params = clearData(DelegateTxData.fromRlp(txData));
        expect(params)
            .toEqual(clearData(txParamsData));
    });
});
