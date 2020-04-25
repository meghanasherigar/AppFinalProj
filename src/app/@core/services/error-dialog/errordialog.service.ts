import { Injectable } from '@angular/core';

@Injectable()
export class ErrorDialogService {

    constructor() { }
    // Implement the logic for the error here 
    // Notification message would be better option
    showError(error:any)
    {
      console.log('Error--->>>', error);
    }
}