import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { AuditTrailLogDomainModel, AuditTrailLogFilterViewModel, AuditTrailLogFilterMenuViewModel } from '../../../@models/audit-trail/audit-trail';
import { KsResponse, KfsResponse } from '../../../@models/ResponseStatus';


@Injectable({
    providedIn: 'root',
})

export class AuditTrailService {

    constructor(private http: HttpClient, private appConfig: AppliConfigService){}
    logFilterViewModel:AuditTrailLogFilterViewModel; 

    public getFilterMenu(projectId) {
        return this.http.get<AuditTrailLogFilterMenuViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/audittrail/' + projectId);
    }

    public getAllAuditTrailLogs(auditTrailLogFilter: AuditTrailLogFilterViewModel){
        return this.http.post<AuditTrailLogDomainModel[]>(this.appConfig.ApiProjectSetupUrl() + '/api/audittrail/getall', auditTrailLogFilter).toPromise();
    }

    public download(logFilterViewModel) {
        return this.http.post(this.appConfig.ApiProjectSetupUrl() + '/api/audittrail/download', logFilterViewModel, { responseType: 'arraybuffer' });
    }

    public delete(Ids: string[]) {
        return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/audittrail/delete', Ids);
    }
} 