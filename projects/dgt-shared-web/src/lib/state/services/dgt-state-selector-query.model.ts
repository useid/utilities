import { DGTStateSelector } from '../models/dgt-state-selector.model';
import { DGTQueryService, DGTQuery } from '@digita/dgt-shared-data/public-api';
import { Observable, of } from 'rxjs';

export class DGTStateSelectorQuery<K> implements DGTStateSelector<K, K> {

    constructor(private queries: DGTQueryService, private query: DGTQuery) { }

    execute(input: K): Observable<K> {
        return of(this.queries.execute<K>(input, this.query));
    }
}