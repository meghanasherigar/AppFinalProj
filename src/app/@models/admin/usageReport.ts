import { BaseFilterViewModel } from '../common/commonmodel';

export class ProjectUsageViewModel {
    organizationName: string;
    gupName: string;
    projectName: string;
    industryName: string;
    useCaseName: string;
    useCaseInternalUsers: number;
    useCaseExternalUsers: number;
    entities: number;
    createdByName: string;
    createdByCountry: string;
    createdByEmail: string;
    createdOn: Date;
    
}

export class ProjectUsageResponseViewModel {
    usageReportList : ProjectUsageViewModel[];
    totalCount: number;
}


export class ProjectUsageFilterViewModel  extends BaseFilterViewModel{
    gupIds: any = [];
    organizationIds: any = [];
    regionIds: any = [];
    countryIds: any = [];
    industryIds: any = [];
    useCaseIds: any = [];
    projectName: any;
    createdBy: any = [];
    createdOnStart: string;
    createdOnTo : string;
}

export class ProjectUsageDomainModel {
    organizationId: string;
    organizationName: string;
    gupId: string;
    gupName: string;
    projectId: string;
    projectName: string;
    IndustryDataKeyPairs: IndustryDomainModel[];
    useCaseId: string;
    useCaseName: string;
    useCaseInternalUsers: number;
    useCaseExternalUsers: number;
    entities: number;
    createdByName: string;
    createdByCountry: string;
    createdByEmail: string;
    createdOn: Date;
}

export class IndustryDomainModel
{
    
  SubIndustryDetails: [];
  mainIndustryId: string;
  mainIndustryName: string;
}

export class ProjectUsageFilterMenuViewModel
{
    gupIds: any = [];
    organizationIds: any = [];
    regionIds: any = [];
    countryIds: any = [];
    industryIds: ProjectIndustryViewModel[];
    useCaseIds: any = [];
    projectName: string[];
    createdBy: any = [];
    createdOn: Date;
}

export class ProjectIndustryViewModel{
    id: string;
    industry: string;
    subIndustries: SubIndustryViewModel[];
}

export class SubIndustryViewModel{
    id: string;
    subIndustry: string;
}

// export class ProjectUsageFilterMenuDomainViewModel
// {
//     gupIds: any = [];
//     organizationIds: any = [];
//     regionIds: any = [];
//     countryIds: any = [];
//     industryIds: ProjectIndustryViewModel[];
//     useCaseIds: any = [];
//     projectName: string[];
//     createdBy: string[];
//     createdOn: Date;
// }

// export class FilterViewModel
// {
//     id: string;
//     name: string;
// }