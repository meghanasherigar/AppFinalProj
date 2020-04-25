import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { BlockAttribute, BlockRequest, BlockType, BlockAttributeDetail, BlockAttributeRequest, BlockFilterDataModel, BlockFilterRequestDataModel, BlockDetailsResponseViewModel, BlockDetails, DeliverableRequestViewModel, BlockStackViewModel, TemplateDeliverableRequestModel  } from '../../../@models/projectDesigner/block'
import { KsResponse, GenericResponse } from '../../../@models/ResponseStatus';
import { GenericResponseModel } from '../../../@models/projectDesigner/common';
import { DeleteBlockViewModel, FilterLibraryModel, CBCBlocDeleteModel } from '../../../@models/projectDesigner/library';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { OrganizationLibraryRequestViewModel, AddToUserLibraryModel } from '../../../@models/projectDesigner/common';
import { TransactionTypeDataModel } from '../../../@models/transaction';
import { DesignerService } from './designer.service';

@Injectable({
    providedIn: 'root'
})


export class BlockService {

   
    constructor(private http: HttpClient, private appConfig: AppliConfigService, private sharedService : ShareDetailService,private designerService: DesignerService,) {
        
     }

    public getBlockAttributes() {
        //let projectId=null;
        if(!this.designerService.isLibrarySection)
        {
          let projectId = this.sharedService.getORganizationDetail().projectId;
        return this
            .http
            .get<BlockAttribute>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblockattributes/'+ projectId);
        }
        else
        {
            return this
            .http
            .get<BlockAttribute>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblockattributes');
        }
    }
    public getBlockMasterdata() {
        return this
            .http
            .get<BlockAttribute>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblockmasterdata');
    }
    public getBlockTransactionTypes() {
        let projectId = this.sharedService.getORganizationDetail().projectId;
        return this
            .http
            .get<TransactionTypeDataModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblocktransactiontypes/'+ projectId);
    }
    public getBlockFilterDropdownData(request?: any){
        return this
        .http
        .post<BlockFilterDataModel>(this.appConfig.ApiProjectDesignUrl() + '/api/block/blockfilter', request);
    }

    // being use for Template & Deliverable filter
    public getBlockFilterDropdownMenu(request : any){
        return this
        .http
        .post<BlockFilterDataModel>(this.appConfig.ApiProjectDesignUrl() + '/api/filter/blockfilter', request);
    }


    public blockSelectedFilter(request:BlockFilterRequestDataModel){
        
        return this
        .http
        .post<BlockDetailsResponseViewModel>(this.appConfig.ApiProjectDesignUrl()+'/api/block/templateblocks',request);
    }
    public DeliverableSelectedFilter(request:DeliverableRequestViewModel){
        
        return this
        .http
        .post<BlockDetailsResponseViewModel>(this.appConfig.ApiProjectDesignUrl()+'/api/filter/deliverableblocks',request);
    }
    public LibrarySelectedFilter(request:FilterLibraryModel){
        return this
        .http
        .post<BlockDetailsResponseViewModel>(this.appConfig.ApiProjectDesignUrl()+'/api/filter/libraryblocks',request);
    }

    public createBlock(request: BlockRequest) {
        return this
            .http
            .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/createblock', request);
    }

    public getBlockTypes() {
        return this
            .http
            .get<BlockType[]>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblocktype');
    }
    public deleteBlocks(request:DeleteBlockViewModel, CBCRequest:CBCBlocDeleteModel) {
        return this.http.post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/deleteblock', request);
    }

    public removeCBCBlocks(CBCRequest:CBCBlocDeleteModel)
    {
        return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/removecbcblock', CBCRequest);
    }

    public getCBCReferenceProjects(CBCRequest:CBCBlocDeleteModel)
    {
        return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getcbcreferenceprojects', CBCRequest);
    }

    public notifyProjectLeadsForCBCDelete(CBCRequest:CBCBlocDeleteModel)
    {
        return this.http.post<boolean>(this.appConfig.ApiProjectDesignUrl() + '/api/block/notifyleadsforcbcdelete', CBCRequest);
    }

    public getBlockDetail(blockId: string){
        return this
            .http
            .get<BlockAttributeDetail>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblockdetails/' + blockId);
    }

    public updateBlock(request: BlockAttributeRequest) {
        return this
            .http
            .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/updateblockcontent', request);
    }
    public updateBlockAttribute(request: BlockAttributeRequest) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/updateblockattribute', request);
    }
    
    public importBlocksFromFile(importingFile : any)
    {
      return this
        .http
        .post<BlockRequest[]>(this.appConfig.ApiProjectDesignUrl() + '/api/blockimport/importblocksfromfile', importingFile);
    }

    public copyBlocksStacks(blocksStacks : BlockStackViewModel[]) {
        return this
        .http
        .post<GenericResponseModel>(this.appConfig.ApiProjectDesignUrl() + '/api/Common/copyblocksstacks', blocksStacks);
    }

    public saveImportedBlocks(request:BlockRequest[]){
        if(!this.designerService.isLibrarySection)
        {
        return this
        .http
        .post<KsResponse>(this.appConfig.ApiProjectDesignUrl()+'/api/blockimport/saveimportedblocks',request);
        }
        else
        {
        return this
        .http
        .post<KsResponse>(this.appConfig.ApiProjectDesignUrl()+'/api/blockimport/saveimportedlibraryblocks',request);
        }
    }

    public copyToLibrary(addToUserLibrary: AddToUserLibraryModel) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/library/adduserlibrary', addToUserLibrary);
    }

    public AddToOrganizationLibrary(requestViewModel: OrganizationLibraryRequestViewModel) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/library/addblockstoorganizationlibrary', requestViewModel);
    }

    public copyBlocksStacksAsReference(payload : any) {
        return this
        .http
        .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/Common/pasteasreferenceintemplate', payload);
    }

    public copyBlocksStacksAsReferenceForDeliverable(payload : any) {
        return this
        .http
        .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/Common/pasteasreferenceindeliverable', payload);
    }

    public getParentBlockId(request : TemplateDeliverableRequestModel) {
        return this
        .http
        .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/templatedeliverable/getrootlevelparent', request);
    }


}