import { Injectable } from '@angular/core';
import { CountryService } from './country.service';
import { RegionService } from './region.service';
import { EntityService } from './entity.service';
import { GlobalUltimateParentService } from './global-ultimate-parent.service';
import { OrganizationService } from './organization.service';
import { IndustryService } from './industry.service';
import { UseCaseService } from './use-case.service';

@Injectable({
  providedIn: 'root',
})
export class SharedServiceAggregatorService {

  constructor(
    private countryService: CountryService,
    private regionService: RegionService,
    private entityService: EntityService,
    private gupService: GlobalUltimateParentService,
    private orgService: OrganizationService,
    private industryService: IndustryService,
    private userCaseService: UseCaseService,
    ) { }

    get CountryService() {
      return this.countryService;
    }

    get EntityService() {
      return this.entityService;
    }

    get RegionService() {
      return this.regionService;
    }

    get GupServicee() {
      return this.gupService;
    }

    get IndustryService() {
      return this.industryService;
    }

    get OrganizationService() {
      return this.orgService;
    }

    get UseCaseService() {
      return this.userCaseService;
    }
}
