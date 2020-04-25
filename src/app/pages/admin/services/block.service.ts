import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { BlockAttribute, BlockRequest, BlockType, BlockAttributeDetail, BlockAttributeRequest, BlockFilterDataModel, BlockFilterRequestDataModel, BlockPublish, BlockStackViewModel } from '../../../@models/projectDesigner/block'
import { KsResponse, GenericResponse } from '../../../@models/ResponseStatus';
import { DeleteBlockViewModel, LibraryBlockPromoteDemote } from '../../../@models/projectDesigner/library';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { GenericResponseModel } from '../../../@models/projectDesigner/common';

@Injectable({
    providedIn: 'root'
})


export class BlockService {

    constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

    public getBlockAttributes() {
        return this
            .http
            .get<BlockAttribute>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblockattributes');
    }
    public getBlockFilterDropdownData() {
        return this
            .http
            .get<BlockFilterDataModel>(this.appConfig.ApiProjectDesignUrl() + '/api/block/blockfilter');
    }
    public blockSelectedFilter(request: BlockFilterRequestDataModel) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/filtertemplateblocks', request);
    }
    public DeliverableSelectedFilter(request: BlockFilterRequestDataModel) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/filtertemplateblocks', request);
    }

    // promoteDemoteOECDLibraryBlock

    public promoteDemoteLibraryBlock(request: LibraryBlockPromoteDemote, action) {
        const URL = this.promoteDemoteUrls(request, action);
        // const URL = (request.IsOECDTemplate && action === 2) ? '/api/block/demoteoecdtemplateblock' : '/api/block/promoteoecdtemplateblock';
        return this.http.post(this.appConfig.ApiProjectDesignUrl() + URL, request, {observe: 'response'});
    }

    promoteDemoteUrls(payload, action) {
        let url;
        if(payload.IsOECDTemplate && action === 2) {
            url = '/api/block/demoteoecdtemplateblock';
        } else if (payload.IsOECDTemplate && action === 1) {
            url = '/api/block/promoteoecdtemplateblock';
        } else if (payload.IsCountryTemplate && action === 1) {
            url = '/api/block/promotecountrytemplateblock';
        } else {
            url = '/api/block/demotecountrytemplateblock';
        }
        return url;
    }

    public createBlock(request: BlockRequest) {
        return this
            .http
            .post<GenericResponseModel>(this.appConfig.ApiProjectDesignUrl() + '/api/block/createblock', request);
    }

    public getBlockTypes() {
        return this
            .http
            .get<BlockType[]>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblocktype');
    }
    public deleteBlocks(request: DeleteBlockViewModel) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/deleteblock', request);
    }

    public getBlockDetail(blockId: string) {
        return this
            .http
            .get<BlockAttributeDetail>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblockdetailsforadmin/' + blockId);
    }

    public updateBlock(request: BlockAttributeRequest) {
        return this
            .http
            .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/updateblockcontent', request);
    }
    public updateBlockAttribute(request: BlockAttributeRequest) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/updateblockattributeforadmin', request);
    }

    public importBlocksFromFile(importingFile: any) {
        return this
            .http
            .post<BlockRequest[]>(this.appConfig.ApiProjectDesignUrl() + '/api/blockimport/importlibraryblockfromfile', importingFile);

    }

    public saveImportedBlocks(request: BlockRequest[]) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/blockimport/saveimportedlibraryblocks', request);
    }

    public publishBlocks(request: BlockPublish) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/publishlibraryblock', request);
    }

    public copyToLibrary(copiedBlockIdList: []) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/library/adduserlibrary', copiedBlockIdList);
    }

    public copyBlocksStacks(blocksStacks: BlockStackViewModel[]) {
        return this
            .http
            .post<GenericResponseModel>(this.appConfig.ApiProjectDesignUrl() + '/api/Common/copyblocksstacks', blocksStacks);
    }

    public addSuggestionBlocksToDefaultTemplate(request: any) {
        return this
            .http
            .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/template/addsuggestionblocktodefaulttemplate', request);
    }
    public getBlockContent(blockId: string) {
        let headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
        const requestOptions: Object = {
            responseType: 'text'
        }
        return this
            .http
            .get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblockcontent/' + blockId, requestOptions);
    }


}