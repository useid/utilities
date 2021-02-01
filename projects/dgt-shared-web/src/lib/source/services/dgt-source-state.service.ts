import { DGTLDFilter, DGTLDResource, DGTSource, DGTSourceService } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';

@DGTInjectable()
export class DGTSourceStateService extends DGTSourceService {
    constructor(
        private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
        private logger: DGTLoggerService,
    ) {
        super();
    }

    public save(resources: DGTSource<any>[]): Observable<DGTSource<any>[]> {
        throw new DGTErrorNotImplemented();
    }

    public get(uri: string): Observable<DGTSource<any>> {
        this.logger.debug(DGTSourceStateService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri }).pipe(
            switchMap((data) =>
                this.store
                    .select<DGTSource<any>[]>((state) => state.app.sources)
                    .pipe(map((sources) => ({ ...data, sources }))),
            ),
            map((data) => (data.sources ? data.sources.find((c) => c.uri === data.uri) : null)),
            take(1),
        );
    }

    public delete(resource: DGTSource<any>): Observable<DGTSource<any>> {
        throw new DGTErrorNotImplemented();
    }

    public query(filter?: DGTLDFilter): Observable<DGTSource<any>[]> {
        throw new DGTErrorNotImplemented();
    }

    public getConnectionsWithWebId(webId: string): Observable<DGTSource<any>[]> {
        throw new DGTErrorNotImplemented();
    }

    public linkSource(inviteId: string, sourceId: string): Observable<{ state: string; loginUri: string }> {
        throw new DGTErrorNotImplemented();
    }

    public refresh(source: DGTSource<any>): Observable<DGTLDResource[]> {
        throw new DGTErrorNotImplemented();
    }
}
