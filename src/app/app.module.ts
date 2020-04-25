/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER, InjectionToken } from '@angular/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { MatDialogModule } from '@angular/material'
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ThemeModule } from './@theme/theme.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthInterceptor } from './@core/auth/authInterceptor';
import { ErrorDialogService } from './@core/services/error-dialog/errordialog.service';
import { AuthService } from './shared/services/auth.service';
import { AuthguardService } from './@core/services/auth-guard/authguard.service'
import { LoginComponent } from '../app/pages/login/login.component';
import { StorageService } from './@core/services/storage/storage.service';
import { ConfirmationDialogComponent } from '../../src/app/shared/confirmation-dialog/confirmation-dialog.component';
// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NbBadgeModule, NbDatepickerModule } from '@nebular/theme';
import { NbDateFnsDateModule } from '@nebular/date-fns';
import { NbMomentDateModule } from '@nebular/moment';
import { MatBadgeModule } from '@angular/material/badge';
import { AppliConfigService } from '../app/shared/services/appconfig.service';
import { Observable } from 'rxjs';
import { CachingInterceptor } from './@core/cache/cacheInterceptor';
import { AuthComponent } from './pages/auth/auth.component';

// Create custom Injection Token
const ConfigDeps = new InjectionToken<(() => Function)[]>('configDeps');

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ConfirmationDialogComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatDialogModule,
    NbBadgeModule,
    MatBadgeModule,
    NbDatepickerModule.forRoot(),
    NgbModule.forRoot(),
    ThemeModule.forRoot(),
    CoreModule.forRoot(),

    // configure the imports
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  bootstrap: [AppComponent],
  providers: [
    CoreModule,
    ErrorDialogService,
    AuthguardService,
    NbMomentDateModule,
    NbDateFnsDateModule,
    AuthService,
    StorageService,
    AppliConfigService,
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // { provide: APP_INITIALIZER, useFactory:loadConfigService, deps:[AppliConfigService], multi:true},
    // { provide: APP_INITIALIZER, useFactory:loadAuthService, deps:[AuthService, AppliConfigService], multi:true}
    {
      provide: APP_INITIALIZER,
      useFactory: configurationFactory,
      multi: true,
      // ConfigDeps is now a dependency for configurationFactory
      deps: [HttpClient, AppliConfigService, ConfigDeps],
    },
    {
      provide: ConfigDeps,
      // Use a factory that return an array of dependant functions to be executed
      useFactory: (
        http: HttpClient,
        config: AppliConfigService,
        configAuth: AuthService,
      ) => {
        // Easy to add or remove dependencies
        return [
          loadAuthService(http, config, configAuth),
          // cFactory(http, config, configC)
        ];
      },
      deps: [HttpClient, AppliConfigService, AuthService],
    }
  ],
  entryComponents: [ConfirmationDialogComponent],
})
export class AppModule {
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function loadConfigService(configService: AppliConfigService): Function {
  return () => { return configService.loadClientConfig(); };
}

export function loadAuthService(http: HttpClient, config: AppliConfigService, authService: AuthService): Function {
    // CCP
    //return () => { authService.initManagerEvents(config); return authService.loadUser(); };

    // DPASS
    return () => { authService.initAuthentication(config); };
}

export function configurationFactory(
  http: HttpClient,
  config: AppliConfigService,
  configDeps: (() => Function)[],
): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise((resolve, reject) => {

      config.loadClientConfig()
        .then(data => {
          // All logic needed
          // Return resolved Promise when dependant functions are resolved
          return Promise.all(configDeps.map(dep => dep())); // configDeps received from the outside world
        })
        .then(() => {
          // Once configuration dependencies are resolved, then resolve factory
          resolve(true);
        })
        .catch((error) => {
          reject(true);
          return Observable.throw('Error: Failed to load client config');
        });
    });
  };
}
