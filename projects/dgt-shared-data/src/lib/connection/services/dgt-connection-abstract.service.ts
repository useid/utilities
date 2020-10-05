import { Observable } from 'rxjs';
import { DGTConnection } from '../models/dgt-connection.model';

import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTInjectable } from '@digita/dgt-shared-utils';

@DGTInjectable()
export abstract class DGTConnectionService implements DGTLDResourceService<DGTConnection<any>> {
    public abstract save(resource: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract delete(resource: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract get(id: string): Observable<DGTConnection<any>>;
    public abstract query(filter: Partial<DGTConnection<any>>): Observable<DGTConnection<any>[]>;
    public abstract getConnectionsWithWebId(webId: string): Observable<DGTConnection<any>[]>;
}
