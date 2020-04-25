import {Industry, Country, Region} from '../@models/organization'
import { BaseFilterViewModel } from './common/commonmodel';

export class ProjectRequest{
    Id: string;
    ProjectName:string
    Description: string;
    fiscalyear: number;
    CountryId: string;
    OrganizationId: string;
    IsVisible: boolean;
    CreatedBy: string;
    LastModifiedBy: string;
    CreatedOn: Date;
    LastModifiedOn: Date;
    Industries: Industry[];
    UseCase: UseCaseModel;
    RegionId: string;
}

export class ProjectResponse{
    Id: string;
    ProjectName:string
    Description: string;
    fiscalyear: number;
    OrganizationId: string;
    IsVisible: boolean;
    CreatedBy: string;
    LastModifiedBy: string;
    CreatedOn: Date;
    LastModifiedOn: Date;
    Industries: Industry[];
    UseCase: UseCaseModel;
    Country: Country;
    Region: Region
}

export class ProjectResultModel{
    TotalCount: number;
    Projects: ProjectResponse[];
}

export class ProjectUserSettingModel {
    isCentralUser: boolean;
    isStaffedUsersDataAvailable: boolean;
    isEntityDataAvailable: boolean;
    isTransactionDataAvailable: boolean;
}

export class UseCaseModel{
    Id: string;
    UseCase: string;
}

export class LeadUserModel{
    FirstName: string;
    LastName: string;
    Email: string;
    AccountType:any;
}

export class ProjectFilterDataModel{
    projects : [];
    industries : Industry[];
    fiscalYear : [];
    leads : [];
    useCase : string[];
}

export class ProjectFilterViewModel extends BaseFilterViewModel{
    OrganizationId: string;
    ProjectIds : [];
    IndustryIds : [];
    FiscalYear : [];
    UseCaseIds : [];
    isVisible: boolean;
    IsAdminViewEnabled: boolean;
    IsFilterDataRequest: boolean;
}

export class ProjectDeleteModel{
    ProjectIds: string[];
}

export class ProjectHideModel{
    ProjectIds: string[];
    IsAdminViewEnabled: boolean;
}

export class ProjectShowModel{
    ProjectIds: string[];
    IsAdminViewEnabled: boolean;

}
export class UseCase{
    id: string;
    useCase: string;
}

export class ProjectFilterMenuData{
    OrganizationId : string;
    IsVisible : boolean;
    IsAdminViewEnabled : boolean;
}

export class CopyProjectRequest{
    CurrentProjectId: string;
    Id: string;
    ProjectName:string
    Description: string;
    fiscalyear: number;
    CountryId: string;
    OrganizationId: string;
    IsVisible: boolean;
    CreatedBy: string;
    LastModifiedBy: string;
    CreatedOn: Date;
    LastModifiedOn: Date;
    Industries: Industry[];
    UseCase: UseCaseModel;
    RegionId: string;
}