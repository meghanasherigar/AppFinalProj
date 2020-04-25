import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from './alert.service';
import { AppliConfigService } from './appconfig.service';
import { CountryService } from './country.service';
import { EntityService } from './entity.service';
import { RegionService } from './region.service';
import { SharedServiceAggregatorService } from './shared-service-aggregator.service';
import { EventAggregatorService } from './event/event.service';
import { UseCase } from '../../@models/masterData/masterDataModels';
import { CacheMapService } from './cache/cache-map.service';
import { CacheBase } from './cache/cache';
import { ToastContainerModule, ToastrModule } from 'ngx-toastr';

const SERVICES = [
  AlertService,
  AppliConfigService,
  CountryService,
  EntityService,
  RegionService,
  EventAggregatorService,
  SharedServiceAggregatorService,
  UseCase,
  CacheMapService,
      { provide: CacheBase, useClass: CacheMapService },
];

@NgModule({
  imports: [
    CommonModule,
    ToastContainerModule,
    ToastrModule.forRoot(
      {
        timeOut: 3000,
        preventDuplicates:true

      }) // ToastrModule added
  ],
  providers: [
    ...SERVICES,
  ],
})
// TODO: Testing PR from Commit
export class SharedServicesModule {
  constructor (@Optional() @SkipSelf() parentModule: SharedServicesModule) {
    if (parentModule) {
      throw new Error(
        'SharedServicesModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: SharedServicesModule,
      providers: [
        ...SERVICES,
      ],
    };
  }
}
