import { DGTConnection, DGTConnectionService, DGTLDFilter, DGTLDFilterService } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';

@DGTInjectable()
export class DGTConnectionStateService extends DGTConnectionService {

  constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private logger: DGTLoggerService, private filters: DGTLDFilterService) {
    super();
  }

  public save<T extends DGTConnection<any>>(resources: T[]): Observable<T[]> {
    throw new DGTErrorNotImplemented();
  }

  public get<T extends DGTConnection<any>>(uri: string): Observable<T> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to get', { uri });

    if (!uri) {
      throw new DGTErrorArgument('Argument uri should be set.', uri);
    }

    return of({ uri })
      .pipe(
        switchMap(data => this.store.select<DGTConnection<any>[]>(state => state.app.connections)
          .pipe(map((connections: T[]) => ({ ...data, connections })))),
        take(1),
        map(data => data.connections ? _.cloneDeep(data.connections.find(c => c.uri === data.uri)) : null),
      );
  }

  public delete<T extends DGTConnection<any>>(resource: T): Observable<T> {
    throw new DGTErrorNotImplemented();
  }

  public query<T extends DGTConnection<any>>(filter?: DGTLDFilter): Observable<T[]> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to query', { filter });

    return of({ filter })
      .pipe(
        switchMap(data => this.store.select<DGTConnection<any>[]>(state => state.app.connections)
          .pipe(map((connections: T[]) => ({ ...data, connections })))),
        switchMap(data => data.filter ? this.filters.run<T>(data.filter, data.connections) : of(data.connections)),
        take(1),
      );
  }

  public getConnectionsWithWebId<T extends DGTConnection<any>>(webId: string): Observable<T[]> {
    throw new DGTErrorNotImplemented();
  }

  public getConnectionForInvite(inviteId: string, sourceId: string): Observable<any> {
    throw new DGTErrorNotImplemented();
  }

  public sendTokensForInvite<T extends DGTConnection<any>>(inviteId: string, fragvalue: string): Observable<T> {
    throw new DGTErrorNotImplemented();
  }

  public getConnectionsForHolder<T extends DGTConnection<any>>(holderUri: string): Observable<T[]> {

    if (!holderUri) {
      throw new DGTErrorArgument('Argument holderUri should be set.', holderUri);
    }

    return of({ holderUri })
      .pipe(
        switchMap(data => this.store.select<DGTConnection<any>[]>(state => state.app.connections)
          .pipe(map((connections: T[]) => ({ ...data, connections })))),
        take(1),
        map(data => data.connections ? _.cloneDeep(data.connections.filter(c => c.holder === data.holderUri)) : null),
      );
  }
}
