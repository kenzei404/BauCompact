import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { environment, AppDataSource, AppEnvironment } from '../../../environments/environment';

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');
export const APP_DATA_SOURCE = new InjectionToken<AppDataSource>('APP_DATA_SOURCE');
export const FIREBASE_APP_CONFIG = new InjectionToken<AppEnvironment['firebase']>('FIREBASE_APP_CONFIG');

export function provideAppRuntimeConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_ENVIRONMENT,
      useValue: environment,
    },
    {
      provide: APP_DATA_SOURCE,
      useValue: environment.dataSource,
    },
    {
      provide: FIREBASE_APP_CONFIG,
      useValue: environment.firebase,
    },
  ]);
}
