import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTConnector } from '../../connector/models/dgt-connector.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTProfile } from '../models/dgt-profile.model';
import { DGTProfileTransformerService } from './dgt-profile-transformer.service';
import { DGTProfileService } from './dgt-profile.service';

@DGTInjectable()
/** Service used for retrieving and updating a user's profile */
export class DGTProfileSolidService extends DGTProfileService {
  constructor(
    private connector: DGTConnector<any, any>,
    private transformer: DGTProfileTransformerService,
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
  ) {
    super();
  }

  /**
   * Returns a user's profile
   * @param connection connection to retrieve the profile information from
   * @param source source to retrieve the profile information from
   */
  public get(exchange: DGTExchange): Observable<DGTProfile> {
    this.logger.debug(DGTProfileSolidService.name, 'Starting to retrieve profile', { exchange })

    this.paramChecker.checkParametersNotNull({ exchange });

    return of({ exchange })
      .pipe(
        switchMap(data => this.connector.query<DGTProfile>(data.exchange, this.transformer)
          .pipe(map(profiles => ({ ...data, profile: profiles[0] })))),
        tap(data => this.logger.debug(DGTProfileSolidService.name, 'Retrieved profile data', data)),
        tap(data => this.logger.debug(DGTProfileSolidService.name, 'Retrieved type registrations for profile', data)),
        map(data => data.profile),
      );
  }

  /**
   * Updates a user's profile
   * @param originalProfile the original profile
   * @param updatedProfile the updated profile
   * @param connection connection to retrieve the profile information from
   * @param source source to retrieve the profile information from
   */
  public update(resource: DGTProfile): Observable<DGTProfile> {
    this.paramChecker.checkParametersNotNull({ resource });

    return of({ resource })
      .pipe(
        switchMap(data => this.connector.save([data.resource], this.transformer)
          .pipe(map(updates => updates[0])),
        ),
      );
  }
}
