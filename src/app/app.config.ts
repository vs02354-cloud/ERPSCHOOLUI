import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { importProvidersFrom } from '@angular/core';
import { FlatpickrModule } from 'angularx-flatpickr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { dateFormat: 'dd/MM/yyyy', timezone: '+0530' } },
    importProvidersFrom(FlatpickrModule.forRoot())
  ]
};
