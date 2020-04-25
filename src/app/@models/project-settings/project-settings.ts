export class ProjectSettings {
    public projectId:string;
    public currentSettings:CurrentSettings[];    
}


export class CurrentSettings
{
    public id:string;
    public name:string;
    public type:number;
    public description:string;
    public value:number;
}