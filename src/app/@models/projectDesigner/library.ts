import {DeliverableViewModel} from './deliverable';
import {TemplateViewModel} from './template';
import { BlockDetailsResponseViewModel, BlockDetails, BlockFilterDataModel, StackModelFilter } from './block';
import { SearchRequestViewModel } from './common';
import { StackAttributeDetail } from './stack';
import { flattenStyles } from '@angular/platform-browser/src/dom/dom_renderer';


export class LibraryDropdownViewModel
{
    id:number;
    name: string;
    isActive: boolean;
}

export class LibraryFilter {
    selectedStackLevel: any = [];
    selectedStackType: any = [];
    selectedStackTransactionType: any = [];
    selectedFilterBlockCreator: any = [];
    selectedFilterblockOrigin: any = [];
    selectedFilterindustry: any = [];
    selectedFiltertitle: any = [];
    selectedFilterblockState: any = [];
    selectedFilterblockStatus: any = [];
    selectedblockType: any = [];
}
export class LibraryBlockDetails
{
    library : LibraryDropdownViewModel;
    blocks : BlockDetailsResponseViewModel[];
}
export class manageLibrary {
    isGlobal: boolean;
    organizationId: string;
    countryId:string;
    countryName:string;
    userId: string;
    isAdmin: boolean;
    Global: boolean;
    CategoryId: string;
    IsCountryTemplate: boolean;
    IsGlobalTemplate: boolean;
    IsCountry: boolean;
    IsGlobal: boolean;
    GlobalTemplate: boolean;
    CountryTemplate: boolean;
    IsCountryLibrary: boolean;
}

export class AccessLibraryMenus {
    createStack: boolean; 
    copy: boolean;
    ungroup: boolean; 
    remove: boolean;
    attribute: boolean;
}

export class LibraryBlockPromoteDemote {
    BlockDetail: BlockDetail[] = [];
    projectId: string;
    IsOECDTemplate: boolean;
    IsCountryTemplate: boolean;
}

export class blocksById {
    blockId: string;
    isStack: boolean;
    isGlobalTemplate: boolean;
    isCountryTemplate: boolean;
}

export class BlockDetail{
    blockRefernceId: string;
    isStack: boolean;
    stackId: string;
    stackUid:string;
    previousId: string;
    parentId: string;
    blockIndex: number;
}

export class AdminLibrarySectionViewModel {
    expandedCategories = [];
    expandedStacks = [];
}

export class Library {
    isGlobal: boolean;
    organizationId: string;
    countryId:string;
    countryName:string;
    userId: string;
    isAdmin: boolean;
    categoryId: string;
    Global: boolean;
    GlobalTemplate: boolean;
    CountryTemplate: boolean;
    IsCountryLibrary: boolean;
    IsCountryTemplate: boolean;
    IsGlobalTemplate: boolean;
    IsCountry: boolean;
    IsGlobal: boolean;
    CategoryId:string;
}

export class LibraryReferenceViewModel {
    template: TemplateViewModel;
    deliverable: DeliverableViewModel;
    project: ProjectDetailsViewModel;
    organization: OrganizationViewModel;
    global: boolean;
    Country: boolean;
    organizationId: string;
    countryId: string;
    countryName: string;
    userId: string;
    country: CountryViewModel;
    Global: boolean;
    GlobalTemplate: boolean;
    CountryTemplate: boolean;
    IsCountryLibrary: boolean;
    IsCountryTemplate: boolean;
    IsGlobalTemplate: boolean;
    IsUserLibrary: boolean;
    IsCountry: boolean;
    IsGlobal: boolean;
}
export class Stack{
    Id:string;
    stackId: string;
}
export class DeleteBlockViewModel{
    blockDetails: BlockDetails[];
    libraryReferenceModel:LibraryReferenceViewModel;
    CBCBlocDeleteModel: CBCBlocDeleteModel;
}   

export class CBCBlocDeleteModel {
    OrganizationId: string;
    BlockIds: any;
    Status: string;
    ProjectId: string;
}

export class ProjectDetailsViewModel {
    projectId: string;
    projectName: string;
    projectYear: string;
}

export class OrganizationViewModel {
    organizationId: string;
    organizationName: string;
}

export class CountryViewModel{
    id: string;
    country: string;
    countryCode: string;
    currency: string;
}

export class blockSuggestionRequest {
    librarySections: number;
    PageIndex: number;
    PageSize: number;
}

export class SearchLibraryViewModel extends SearchRequestViewModel {
    organizationId : string;
    countryId : string;
    isGlobal: boolean;
    isAdmin : boolean;
    categoryId: string;
    userId : string;
    IsCountryTemplate: boolean;
    IsGlobalTemplate: boolean;
    IsCountry: boolean;
    IsGlobal: boolean;
    countryName:string;
    Global: boolean;
    GlobalTemplate: boolean;
    CountryTemplate: boolean;
    IsCountryLibrary: boolean;
    CategoryId: string;
}

export class FilterLibraryModel{
    isGlobal: boolean=true;
    isCountry:boolean=false;
    isOrganization:boolean=false;
    isPersonal:boolean=false;
    organizationId:string;
    blockFilterRequestModel: BlockFilterDataModel;
    stackFilter:StackModelFilter;
    projectId:string;
    isCBC:boolean=false;
}

export class FilterManageLibraryModel {

    IsCountryTemplate: boolean;
    IsGlobalTemplate: boolean;
    IsCountry: boolean;
    IsGlobal: boolean;
    blockFilterRequestModel: BlockFilterDataModel;
    stackFilter:StackModelFilter;

}

export enum LibraryTypes
{
    GlobalLibrary = 0,
    GlobalOECDTemplate,
    CountryLibrary,
    CountryTemplate
}


export class libraryRequestModel {
    LibraryType: number;
    CoverPage: string;
}

export class getCoverPage {
    id:string;
    content: string;
}
