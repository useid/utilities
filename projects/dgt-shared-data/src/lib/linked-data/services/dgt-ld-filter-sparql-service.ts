import { Observable } from 'rxjs';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';

/** Service that allow conversion from a filter to a SparQL query */
export interface DGTLDFilterSparqlService<T extends DGTLDFilter> {

    /** The DGTLDFilterType of this service */
    type: DGTLDFilterType;

    /**
     * Converts a filter to a SparQL query
     * @param filter The DGTLDFilter to convert
     */
    getQuery(filter: T): Observable<string>;
}