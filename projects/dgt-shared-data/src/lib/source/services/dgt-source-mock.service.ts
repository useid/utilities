import { Observable, of } from 'rxjs';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTSourceService } from './dgt-source.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTSource } from '../models/dgt-source.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';

@DGTInjectable()
export class DGTSourceMockService extends DGTSourceService {

  constructor(
    private logger: DGTLoggerService,
    private filters: DGTLDFilterService,
    private uri: DGTUriFactoryService,
  ) {
    super();
  }

  public resources: Array<DGTSource<any>> = [];

  public get(uri: string): Observable<DGTSource<any>> {
    return of(this.resources.find(e => e.uri === uri));
  }

  public query(filter?: DGTLDFilter): Observable<Array<DGTSource<any>>> {
    this.logger.debug(DGTSourceMockService.name, 'Starting to query sources', filter);

    return of({ filter, resources: this.resources })
      .pipe(
        switchMap(data => data.filter ? this.filters.run<DGTSource<any>>(data.filter, data.resources) : of(data.resources)),
      );
  }

  public save(resources: DGTSource<any>[]): Observable<DGTSource<any>[]> {
    this.logger.debug(DGTSourceMockService.name, 'Starting to save resources', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({ resources })
            .pipe(
                map(data => data.resources.map(resource => {
                    if (!resource.uri) {
                        resource.uri = this.uri.generate(resource, 'source');
                    }
                    
                    this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];

                    return resource;
                })
                )
            );
  }

  public delete(resource: DGTSource<any>): Observable<DGTSource<any>> {
    this.logger.debug(DGTSourceMockService.name, 'Starting to delete resource', { resource });

    if (!resource) {
      throw new DGTErrorArgument('Argument resource should be set.', resource);
    }

    this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri)];

    return of(resource);
  }
}