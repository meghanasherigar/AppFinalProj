import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of as observableOf } from 'rxjs';
import { NbBadgeModule } from '@nebular/theme';
import { throwIfAlreadyLoaded } from './module-import-guard';
import {
  AnalyticsService,
  LayoutService,
  StateService,
} from './utils';
import { StorageService } from '../@core/services/storage/storage.service';
import { SessionStorageService } from './services/storage/sessionStorage.service';
import { Ng2SmartTableModule } from './components/ng2-smart-table';
import { CustomPreloadingStrategy } from './utils/AppPreLoadingStrategy';

export const NB_CORE_PROVIDERS = [
  AnalyticsService,
  LayoutService,
  StateService,
  StorageService,
  SessionStorageService,
  CustomPreloadingStrategy,
];

@NgModule({
  imports: [
    CommonModule,
    Ng2SmartTableModule,
    NbBadgeModule,
  ],
  exports: [],
  declarations: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: CoreModule,
      providers: [
        ...NB_CORE_PROVIDERS
      ],
    };
  }
}
