import { Industry } from '../organization';

export class ProjectDetails{
    fiscalYear : string;
    projectId : string;
    projectName : string;
    industry : Industry[];
    organizationId : string;
}