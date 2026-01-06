import { UserDataState } from './store/user.state';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';



import { routes } from './app.routes';
import { provideHttpClient} from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { registerReducer } from './store/register.reducer';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({
      userData : registerReducer
    }),
  ]
};
