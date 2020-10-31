import * as _ from 'lodash';
import { DGTParameterCheckerService, DGTMap, DGTLoggerService, DGTInjectable, DGTErrorArgument, DGTConfigurationService, DGTErrorConfig, DGTConfigurationBase } from '@digita-ai/dgt-shared-utils';
import { DGTSourceType } from '../../source/models/dgt-source-type.model';
import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap, tap, catchError, switchMap } from 'rxjs/operators';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTPurposeService } from '../../purpose/services/dgt-purpose.service';
import { DGTConnector } from '../models/dgt-connector.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTProfileService } from '../../profile/services/dgt-profile.service';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTLDTypeRegistrationService } from '../../linked-data/services/dgt-ld-type-registration.service';

@DGTInjectable()
export class DGTConnectorService {

  private connectors: DGTMap<DGTSourceType, DGTConnector<any, any>>;

  constructor(
    private logger: DGTLoggerService,
    private sources: DGTSourceService,
    private connections: DGTConnectionService,
    private paramChecker: DGTParameterCheckerService,
    private purposes: DGTPurposeService,
    private profiles: DGTProfileService,
    private config: DGTConfigurationService<DGTConfigurationBase>,
    private typeregistrationService: DGTLDTypeRegistrationService,
  ) { }

  public register(sourceType: DGTSourceType, connector: DGTConnector<any, any>) {
    this.paramChecker.checkParametersNotNull({ sourceType, connector });

    if (!this.connectors) {
      this.connectors = new DGTMap<DGTSourceType, DGTConnector<any, any>>();
    }

    this.connectors.set(sourceType, connector);
  }

  public get(sourceType: DGTSourceType) {
    if (!sourceType) {
      throw new DGTErrorArgument('Argument sourceType should be set.', sourceType);
    }

    return this.connectors.get(sourceType);
  }

  public save<T extends DGTLDResource>(exchange: DGTExchange, resources: T[], destination: string): Observable<T[]> {
    this.paramChecker.checkParametersNotNull({ exchange, triples: resources });

    return this.sources.get(destination).pipe(
      map(source => ({ source })),
      // get connection
      mergeMap(data => this.connections.query({ holder: exchange.holder, source: data.source.id }).pipe(
        tap(connection => this.logger.debug(DGTConnectorService.name, 'found connection for upstream', connection)),
        map(connection => connection.length > 0 ? connection : [null]),
        map(connection => ({ ...data, connection: connection[0] })),
      )),
      // check if connection is set
      map(data => {
        if (data.connection !== null) {
          return data;
        } else {
          throw new DGTErrorArgument('No connection found for this upstreamSync', data.connection);
        }
      }),
      // get connector
      map(data => ({ ...data, connector: this.connectors.get(data.source.type) })),
      // get purpose
      mergeMap(data => this.purposes.get(exchange.purpose).pipe(
        map(purpose => ({ ...data, purpose })),
      )),
      // get profile to pass to upstreamsync
      mergeMap(data => this.profiles.get(exchange).pipe(
        map(profile => ({ ...data, profile }))
      )),
      mergeMap(data => {
        if (resources.length === 0) {
          throw new DGTErrorArgument('triples can not be an empty list', resources);
        }
        return forkJoin(resources.map(resource => this.upstreamSync(
          data.connector, resource, data.connection, null, exchange, data.profile)
        )).pipe(map(resultFromUpstream => ({ ...data, resultFromUpstream })));
      }),
      map(data => _.flatten(data.resultFromUpstream)),
      // catch error if no connection found or triples was an empty list
      catchError(() => {
        this.logger.debug(DGTConnectorService.name, 'No connection was found for this upstreamSync');
        return [resources];
      }),
    );
  }

  public upstreamSync<T extends DGTLDResource>(
    connector: DGTConnector<any, any>,
    resource: T,
    connection: DGTConnection<any>,
    transformer: DGTLDTransformer<T>,
    exchange: DGTExchange,
    profile: DGTProfile,
  ): Observable<T> {
    this.logger.debug(DGTConnectorService.name, 'upstream syncing',
      { connector, resource, connection, transformer, exchange });

    return this.calculateDocumentUri(resource, profile, connection).pipe(
      switchMap(preparedDomainEntity =>
        // find possible existing values to determine add or update
        connector.query(preparedDomainEntity.uri, exchange, transformer).pipe(
          map(existingValues => ({ existingValues, domainEntity: preparedDomainEntity })),
        )
      ),
      switchMap(data => {
        if (data.existingValues[0]) {
          // domainEntity.documentUri = connection.configuration.webId;
          // // find possible existing values
          // return connector.query(domainEntity.documentUri, exchange, transformer).pipe(
          //   switchMap(existingValues => {
          //     if (existingValues[0]) {
          // convert to list of {original: Object, updated: Object}
          const updatedResource = { original: data.existingValues[0], updated: data.domainEntity };
          this.logger.debug(DGTConnectorService.name, 'Updating value', { connector, updatedResource });
          return connector.update<T>([updatedResource], transformer).pipe(
            map(resources => resources[0]),
            catchError((error) => {
              this.logger.debug(DGTConnectorService.name, '[upstreamSync] error updating', { connector, updatedResource, error });
              return of(data.domainEntity);
            }),
          );
        } else {
          this.logger.debug(DGTConnectorService.name, 'adding value', { connector, resource });
          return connector.add<T>([resource], transformer).pipe(
            map(resources => resources[0]),
            catchError(() => {
              this.logger.debug(DGTConnectorService.name, '[upstreamSync] error adding', { connector, resource });
              return of(resource);
            }),
          );
        }
      }),
    );
  }

  public calculateDocumentUri<T extends DGTLDResource>(
    domainEntity: T,
    profile: DGTProfile,
    connection: DGTConnection<any>,
  ): Observable<T> {
    let missingTypeReg = false;
    // profile will only have a value when we have a solid source / connection
    // find typeregistration in profile
    const typeRegFound = profile.typeRegistrations.filter(reg =>
      reg.forClass === domainEntity.triples[0].predicate
    );
    const origin = new URL(connection.configuration.webId).origin;
    if (typeRegFound.length > 0) {
      this.logger.debug(DGTConnectorService.name, 'Typeregistration found in profile', typeRegFound[0]);
      // typeregistration found in profile
      domainEntity.uri = typeRegFound[0].instance;
    } else {
      // check config for typeReg
      const typeRegsInConfig = this.config.get(c => c.typeRegistrations);
      const typeRegFoundInConfig = Object.keys(typeRegsInConfig).filter(key =>
        key === domainEntity.triples[0].predicate
      );
      if (typeRegFoundInConfig && typeRegFoundInConfig.length > 0) {
        this.logger.debug(DGTConnectorService.name, 'Typeregistration found in config', typeRegFoundInConfig[0]);
        // typeReg found in config
        missingTypeReg = true;
        domainEntity.uri = origin + typeRegsInConfig[typeRegFoundInConfig[0]];
      } else {
        this.logger.debug(DGTConnectorService.name, 'no Typeregistration found in config');
        // tslint:disable-next-line:max-line-length
        throw new DGTErrorConfig('No TypeRegistration was found in the config matching this predicate', domainEntity.triples[0].predicate);
      }
    }

    return of(domainEntity).pipe(
      mergeMap(entity => {
        if (missingTypeReg) {
          return this.typeregistrationService.registerMissingTypeRegistrations(profile).pipe(
            map(() => entity),
          );
        } else {
          return of(entity);
        }
      })
    );
  }

  public query<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
    this.logger.debug(DGTConnectorService.name, 'Getting triples', { exchange });

    this.paramChecker.checkParametersNotNull({ exchange });

    return of({ exchange })
      .pipe(
        switchMap((data) => this.sources.get(data.exchange.source)
          .pipe(map(source => ({ source, ...data, connector: this.get(source.type) })))),
        switchMap(data => data.connector.query<T>(null, exchange, transformer)
          .pipe(map(resources => ({ ...data, resources })))),
        // map(resources => triples.filter(triple => purpose.predicates.includes(triple.predicate))),
        tap(data => this.logger.debug(DGTConnectorService.name, 'Queried resources for exchange', data)),
        map(data => data.resources),
        // catchError(() => of([])),
      );
  }
}
