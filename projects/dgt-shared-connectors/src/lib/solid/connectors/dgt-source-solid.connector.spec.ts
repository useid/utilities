/* tslint:disable:no-unused-variable */

import { async } from '@angular/core/testing';
import { DGTTestRunnerService } from '@digita/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { DGTSourceSolidConnector } from './dgt-source-solid.connector';
import { DGTExchange, DGTSourceSolid, DGTConnectionSolid, DGTLDTriple, DGTLDTermType } from '@digita/dgt-shared-data';
import * as _ from 'lodash';

describe('DGTSourceSolidConnector', () => {
    const testService = new DGTTestRunnerService<DGTSourceSolidConnector>(configuration);
    testService.setup(DGTSourceSolidConnector);

    it('should convert simple turtle', async(() => {
        const response = `@prefix : <#>.
        @prefix dgt-events: <http://digita.ai/voc/events#>.
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

       :me dgt-events:event :1.`;
        const webId = 'https://john.my.id/';
        const exchange: DGTExchange = {
            id: 'e-1',
            justification: null,
            subject: null,
            source: 's-1',
            connection: 'c-1',
        };
        const source: DGTSourceSolid = {
            id: 's-1',
            icon: null,
            description: null,
            type: null,
            configuration: null,
        };
        const connection: DGTConnectionSolid = {
            id: 'c-1',
            configuration: null,
            state: null,
            source: 's-1',
            subject: null,
        };

        const expectedResult: DGTLDTriple[] = [
            {
                exchange: 'e-1',
                predicate: {
                    namespace: 'http://digita.ai/voc/events#',
                    name: 'event'
                },
                subject: {
                    termType: DGTLDTermType.REFERENCE,
                    value: 'https://john.my.id/'
                },
                object: {
                    termType: DGTLDTermType.REFERENCE,
                    value: 'https://john.my.id/#1'
                },
                originalValue: {
                    termType: DGTLDTermType.REFERENCE,
                    value: 'https://john.my.id/#1'
                },
                source: 's-1',
                connection: 'c-1',
            }
        ];

        const result = testService.service.convert(response, webId, exchange, source, connection);
        delete result[0].id;

        // expect(_.isEqual(result, expectedResult)).toBeTruthy();
        expect(result).toEqual(expectedResult);
    }));
});