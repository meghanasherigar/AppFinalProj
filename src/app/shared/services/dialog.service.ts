import { Injectable } from '@angular/core';
import { DialogTypes, Dialog } from '../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';



@Injectable({
    providedIn: 'root',
})
export class DialogService {

    constructor(private dialog : MatDialog) {
        
    }

    Open(type : DialogTypes, message: string){
        var dialog = new Dialog();
        dialog.Type = type;
        dialog.Message = message;

        this.dialog.open(ConfirmationDialogComponent, {
            data: dialog
          });
    }
    
}
