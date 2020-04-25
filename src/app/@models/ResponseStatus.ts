export class KsResponse {
    public status: ResponseStatus;
    public errorMessages: string[];
    public tag: string;
}

export enum ResponseStatus {
    None,
    Sucess,
    Failure,
    Information
}
export class KfsResponse extends KsResponse {
    public fileName: string;
    public content: string;
}

export abstract class ResponseType{
    public static Mismatch='Mismatch';
    public static Error='Error';
}

export class GenericResponse extends KsResponse {
    public errorMessages: string[];
    public result: any;
    public isSuccess: false;
    public responseType:string;
    public responseData:any;
}