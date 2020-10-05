import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { DGTMap, DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTSourceConnector } from '../../source/models/dgt-source-connector.model';
import { DGTSourceType } from '../../source/models/dgt-source-type.model';
import { Observable } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { map } from 'rxjs/operators';
import { DGTErrorArgument } from '@digita/dgt-shared-utils';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTSourceState } from '../../source/models/dgt-source-state.model';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';
import { DGTSource } from '../../source/models/dgt-source.model';


@Injectable()
export class DGTConnectorService {

  private connectors: DGTMap<DGTSourceType, DGTSourceConnector<any, any>>;

  constructor(private logger: DGTLoggerService) { }

  public register(sourceType: DGTSourceType, connector: DGTSourceConnector<any, any>) {
    if (!this.connectors) {
      this.connectors = new DGTMap<DGTSourceType, DGTSourceConnector<any, any>>();
    }

    this.connectors.set(sourceType, connector);
  }

  public get(sourceType: DGTSourceType) {
    return this.connectors.get(sourceType);
  }

  public getTriples(exchange: DGTExchange, connection: DGTConnection<any>, source: DGTSource<any>, purpose: DGTPurpose)
    : Observable<DGTLDTriple[]> {
    this.logger.debug(DGTConnectorService.name, 'Getting source', source);

    if (!source || source.state !== DGTSourceState.PREPARED) {
      throw new DGTErrorArgument('Argument source || source.state === DGTSourceState. should be set.', source);
    }

    const connector: DGTSourceConnector<any, any> = this.get(source.type);

    return connector.query(null, purpose, exchange, connection, source, null)
      .pipe(
        map((entities) => entities.map(entity => entity.triples)),
        map((triples) => _.flatten(triples)),
        map(triples => triples.filter(triple => purpose.predicates.includes(triple.predicate)))
      );
  }
}
