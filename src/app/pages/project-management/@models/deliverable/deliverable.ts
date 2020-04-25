export class Deliverable {
}


export class DeliverableReport
{
    public deliverableName: string;
    public milestoneId:string;
    public reportTierId: string;
    public projectId: string;
    public countryId: string;
    public taxableYearEnd: string;
    public targetIssueDate: string;
    public statutoryDueDate: string;
    public filingRequirement:boolean;
    public localTPRequirement:string;
    public cbcNotificationDueDate:string;
    public comments:string;
    public fiscalYear:string;
    public deliverableReportIds?:string[];
}

export class CreateDeliverableMasterResponse 
{
    public reportType: reportTier;
    //Default values-- To be confirmed with business team
    public taxableYearEnd: string;
    public targetDeliverableIssueDate: string;
}

export class reportTier
{
    id: string;
    tier: string;
} 

export class editDeliverableReportDate
{
    public cbcNotificationDueDate:string;
    public targetIssueDate: string;
    public statutoryDueDate: string;
}

export class country
{
  id:string;
  country:string;
}
export class milestone
 {
    id:string;
    value :number;
    description:string;
 }
  
export class pagination
{
    pageIndex:number;
    pageSize:number;
    SearchText?:string;
    sortColumn:string;
    sortDirection:string;
}

  export class deliverableFilterViewModel extends pagination
  {
    projectId: string;
    deliverableName?: string[];
    countries?: string[];
    reportTiers?:string[];
    cbcNotificationStartDate?: string;
    cbcNotificationEndDate?: string;
    milestones?:string[];
    targetDeliverableIssueStartDate?: string;
    targetDeliverableIssueEndDate?: string;
    statutoryDueDateStartDate?: string;
    statutoryDueDateEndDate?: string;
    taxableYearStartDate?: string;
    taxableYearEndDate?: string;
  }

  export class deliverableFilterResponse {
    deliverableName: string[];
    cbcNotificationStartDate: string;
    cbcNotificationEndDate: string;
    targetDeliverableIssueStartDate: string;
    targetDeliverableIssueEndDate: string;
    statutoryDueDateStartDate: string;
    statutoryDueDateEndDate: string;
    taxableYearStartDate: string;
    taxableYearEndDate: string;
    countries:country[];
    reportTiers:reportTier[];
    milestones:milestone[];
  }

  export class GetDateModel {
    Year: number;
    Month: number;
    Day: number;
  }