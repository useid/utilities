import { mergeMap, map, catchError, tap, switchMap } from 'rxjs/operators';
import { Actions, Effect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { DGTErrorService, DGTConnectionService, DGTLoggerService, DGTErrorConfig, DGTConfigurationService, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTProfileService, DGTLDTypeRegistrationService, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-data';
import * as _ from 'lodash';
import { DGTProfileActionTypes, DGTProfileLoad, DGTProfileLoadFinished } from '../../profile/models/dgt-profile-actions.model';
import { DGTEventsRegister } from '../../events/models/dgt-events-actions.model';
import { DGTI8NLocale } from '../../i8n/models/dgt-i8n-locale.model';
import { ActionTypes, AddNotification, CheckConnection, CheckConnectionFinish, HandleError, Navigate, NavigateExternal, SetDefaultLocale, SetLocale } from '../models/dgt-actions.model';
import { DGTNotification } from '../../interface/models/dgt-notification.model';
import { DGTNotificationType } from '../../interface/models/dgt-notification-type.model';
import { DGTI8NService } from '../../i8n/services/dgt-i8n.service';


@DGTInjectable()
export class DGTStateEffectsBaseWebService {
    /**  Determines (default) locale */
    @Effect()
    /**  Determines (default) locale */
    init$ = this.actions$
        .pipe(
            ofType(ROOT_EFFECTS_INIT),
            mergeMap(() => {
                this.logger.debug(DGTStateEffectsBaseWebService.name, 'Starting to determine the default locale');
                const defaultLocale: DGTI8NLocale = new DGTI8NLocale(this.config.get<string>(keys => keys.locale.default));

                this.logger.debug(DGTStateEffectsBaseWebService.name, 'Starting to determine the active locale');
                const locale: DGTI8NLocale = this.i8n.getLocale(defaultLocale, this.config.get<any>(keys => keys.locale.mapping));

                return [
                    new SetDefaultLocale(defaultLocale),
                    new SetLocale(locale)
                ];
            }),
            catchError((error, caught) => of(new HandleError({ typeName: ROOT_EFFECTS_INIT, error, caught }))),
        );

    @Effect({ dispatch: false })
    /** Navigates to a path */
    navigate$ = this.actions$
        .pipe(
            ofType(ActionTypes.NAVIGATE),
            map((action: Navigate) => action.payload),
            tap(({ path, query: queryParams, extras }) => this.router.navigate(path, { queryParams, ...extras })),
            catchError((error, caught) => of(new HandleError({ typeName: Navigate.name, error, caught }))),
        );

    @Effect({ dispatch: false })
    /** Navigates to an external URI */
    navigateExternal$ = this.actions$
        .pipe(
            ofType(ActionTypes.NAVIGATE_EXTERNAL),
            map((action: NavigateExternal) => action.payload),
            tap((payload: any) => window.location.href = payload),
            catchError((error, caught) => of(new HandleError({ typeName: NavigateExternal.name, error, caught }))),
        );

    @Effect({ dispatch: false })
    /** Sets the locale */
    setLocale$ = this.actions$
        .pipe(
            ofType(ActionTypes.SET_LOCALE),
            tap((action: SetLocale) => this.i8n.applyLocale(action.payload)),
            catchError((error, caught) => of(new HandleError({ typeName: SetLocale.name, error, caught }))),
        );

    @Effect({ dispatch: false })
    /** Sets the default locale */
    setDefaultLocale$ = this.actions$
        .pipe(
            ofType(ActionTypes.SET_DEFAULT_LOCALE),
            tap((action: SetDefaultLocale) => this.i8n.applyDefaultLocale(action.payload)),
            catchError((error, caught) => of(new HandleError({ typeName: SetDefaultLocale.name, error, caught }))),
        );

    @Effect()
    /** Checks the current connection status */
    checkConnection$ = this.actions$
        .pipe(
            ofType(ActionTypes.CHECK_CONNECTION),
            mergeMap(() => this.connection.status),
            map(online => new CheckConnectionFinish(online)),
            catchError((err, caught) => of(new HandleError({
                typeName: CheckConnection.name,
                error: err,
                caught
            })))
        );

    @Effect()
    /** Handles error and adds a new notification, then checks connection */
    handleError$ = this.actions$
        .pipe(
            ofType(ActionTypes.HANDLE_ERROR),
            tap((action: HandleError) => this.errors.handle(action.payload.typeName, action.payload.error, action.payload.caught)),
            mergeMap(() => of(new AddNotification(new DGTNotification(
                DGTNotificationType.DANGER,
                'app.notifications.unexpected-error'
            )))),
        );

    @Effect()
    /** Loads profiles, registers an event */
    loadProfile$ = this.actions$.pipe(
        ofType(DGTProfileActionTypes.LOAD_PROFILE),
        mergeMap((action: DGTProfileLoad) => this.profiles.get(action.payload.connection, action.payload.source)
            .pipe(map(profile => ({ profile, action })))),
        switchMap(data => this.registrationsService.registerMissingTypeRegistrations(data.profile, data.action.payload.connection, data.action.payload.source)
            .pipe(map(typeRegistrationsRegistered => ({ ...data, typeRegistrationsRegistered })))),
        // add typeRegistrations to the profile
        map(data => ({ ...data, profile: { ...data.profile, typeRegistrations: [...data.profile.typeRegistrations, ...data.typeRegistrationsRegistered] } })),
        switchMap(data => {
            const profileLoaded = this.config.get(c => c.events.templates.profileLoaded)

            if (!profileLoaded) {
                throw new DGTErrorConfig('Config key events.templates.profileLoaded should be set.', profileLoaded);
            }
            return [
                new DGTProfileLoadFinished({ profile: data.profile, connection: data.action.payload.connection, source: data.action.payload.source }),
                new DGTEventsRegister({
                    event: {
                        ...profileLoaded,
                        connection: data.action.payload.connection.id,
                        source: data.action.payload.connection.source,
                    },
                    connection: data.action.payload.connection,
                    source: data.action.payload.source,
                    profile: data.profile
                }),
            ]
        }
        ),
        catchError((error, caught) => of(new HandleError({ typeName: DGTProfileLoad.name, error, caught }))),
    );

    constructor(
        protected errors: DGTErrorService,
        protected actions$: Actions,
        protected router: Router,
        protected connection: DGTConnectionService,
        protected i8n: DGTI8NService,
        protected logger: DGTLoggerService,
        protected config: DGTConfigurationService<DGTConfigurationBaseWeb>,
        protected profiles: DGTProfileService,
        protected registrationsService: DGTLDTypeRegistrationService,
    ) { }
}