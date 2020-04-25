import { auditTrailModel } from '../../pages/project-management/@models/tasks/task';

export class AuditTrailLogDomainModel {
    id: string;
    projectId: string;
    project: ProjectAuditLogModel;
    entity: EntityAuditLogModel;
    transaction: TransactionAuditLogModel;
    blockStack: BlockStackAuditModel;
    infoRequest: InfoRequestAuditModel;
    auditTrail : auditTrailModel;
}
export class AuditTrailLogFilterMenuViewModel {
    actionBy: FilterViewModel[];
    actionMinimumDate: Date;
    actionMaximumDate: Date;
}
export class FilterViewModel {
    id: string;
    name: string;
}
export class AuditTrailLogFilterViewModel {
    projectId: string;
    actionBy: string[];
    actionMinimumDate: Date;
    actionMaximumDate: Date;
}
export class EditFieldAuditDomainModel{
    fieldName: string;
    oldValue: string;
    newValue: string;
}
export class UserBasicDomainModel{
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
}
export class ProjectAuditLogModel {
    id: string;
    organizationName: string;
    projectName: string;
    action: string;
    edit: EditFieldAuditDomainModel[];
}
export class EntityAuditDomainModel{
    entityName: string;
    country: string;
    taxableYearEnd: string;
    action: string;
    edit: EditFieldAuditDomainModel[];
    approvedBy: UserBasicDomainModel;
    approvedOn: Date;
}
export class EntityAuditLogModel extends EntityAuditDomainModel {
    id: string;
}
export class TransactionAuditLogModel extends EntityAuditDomainModel{
    id: string;
    name: string;
    counterPartEntityName: string;
    counterPartCountry: string;
    counterPartTaxableYearEnd: Date;
}
export class BlockStackAuditModel {
    id: string;
    title: string;
    templateDeliverableName: string;
    description: string;
    action: string;
    approvedBy: UserBasicDomainModel;
    approvedOn: Date;
    isStack: boolean;
}
export class InfoRequestAuditModel {
    id: string;
    name: string;
    sendTo: UserBasicDomainModel;
    action: string;
    templateDeliverableName: string;
    edit: EditFieldAuditDomainModel[];
}

export enum ActionTypes {
    create = 'Create',
    edit = 'Edit',
    delete = 'Delete',
    sendIR = 'SendIR',
    reSendIR = 'ReSendIR',
    forward = 'Forward',
    sendBackToAssignee = 'SendBackToAssignee',
    sendBackToReview = 'SendBackToReview',
    pullBack = 'PullBack',
    finalize = 'Finalize',
    reminder = 'Reminder',
    sendBackToQuestionReview = 'SendBackToQuestionReview'
}

export const ActionMessages = {
    creted: "created by",
    edited: "edited by",
    deleted: "deleted by",
    sentIR: "information request sent by",
    reSendIR: "information request resent by",
    forward: "forwarded by",
    sendBackToAssignee: "sent back to Assignee by",
    sendBackToReview: "sent back to review by",
    pullBack: "pullback by",
    finalize: "finalized by",
    reminder: "reminder by",
    sendBackToQuestionReview: "sent back to question review by"
}
