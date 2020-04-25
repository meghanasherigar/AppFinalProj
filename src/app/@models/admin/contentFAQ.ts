export class Category
{
    id: string;
    description: string;
    colourCode: number;
    questions: Question[];
    editable: boolean;
    collapsed: boolean;
    checked ?: boolean;
}
export class Question
{
    id: string;
    description: string;
    colourCode: number;
    editable: boolean;
    collapsed: boolean;
    answer ? : Answer;
    checked ?: boolean;
}
export class Answer
{
    id: string;
    description: string;
    editable: boolean;
    collapsed: boolean;
}
export class FAQ_Category
{
    categoryid:string;
    categorydescription:string;
    questionlist:FAQ_Question[];
}
export class FAQ_Question
{
    id:string;
    question:string;
    answer:string;
    isactive:boolean;
    ispublished:boolean;
}
export class FAQLastModified
{
    userName: string;
    lastModifiedOn: Date;
    publishedBy: string;
    publishedOn: Date;
    isPublishedUser: boolean;
}
export class CategoryQuestionsDetails
{
    categoryList : string[] = [];
    questionsList : string[] = [];
}