import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { authInterceptor, errorInterceptor } from '@core/interceptors';
import ExodiaPreset from './theme/exodia-preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor]),
    ),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: ExodiaPreset,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: false
        }
      }
    })
  ]
};
