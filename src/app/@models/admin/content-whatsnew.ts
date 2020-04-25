export class Category
{
    id: string;
    description: string;
    questions: Question[];
    editable: boolean;
    collapsed: boolean;
}
export class CkEditor {
    selectedEditor:number;
    editorMode:boolean;
  }
export class Question
{
    id: string;
    question: string;
    answer: string;
    editable: boolean;
    collapsed: boolean;
    colourcode: number;
    publishedadmin: boolean;
    publishedQuestion: boolean;
    publishedAnswer: boolean;
    publishedAdmin: boolean;
    PublishedUser: boolean;
    isactive:boolean;
    ispublished:boolean;
}

export class WhatsNew_Category
{
    categoryid:string;
    categorydescription:string;
    questionlist:WhatsNew_Question[];
}
export class WhatsNew_Question
{
    id:string;
    question:string;
    answer:string;
    publishedQuestion: boolean;
    publishedAnswer: boolean;
    publishedAdmin: boolean;
    PublishedUser: boolean;
    isactive:boolean;
    ispublished:boolean;
    colourcode: number;
}

export class WhatsNewLastModified {

    userName:string;
    lastModifiedOn:Date;
    publishedBy: string;
    publishedOn: Date;
    isPublishedUser: boolean;
}