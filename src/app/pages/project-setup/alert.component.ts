import { Component, OnInit, Input, ChangeDetectorRef,ChangeDetectionStrategy } from '@angular/core';

import { Alert, AlertType } from '../../@models/alert'
import { AlertService } from '../../shared/services/alert.service';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
    moduleId: module.id,
    selector: 'alert',
    templateUrl: 'alert.component.html',
//    template:'<nb-alert status="success"  *ngFor="let alert of alerts"  closable (close)="onClose()">' + 
//    'You have been successfully authenticated!' + 
//     	 '</nb-alert>',
 styleUrls:['./alert.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AlertComponent {
    @Input() id: string;

    private dialogTemplate : any;

    constructor(private alertService: AlertService,private cd: ChangeDetectorRef, private dialog: MatDialog) { 
        this.alertService.getAlert(this.id).subscribe((alert: Alert) => {
            if (!alert.message) {
                // clear alerts when an empty alert is received
                return;
            }
            // add alert to array
            //this.alerts.push(alert);
            

            cd.detectChanges();
            cd.markForCheck();
            //this.changeDetector.detectChanges();
        });
    }

    ngOnInit() {
        
    }

    removeAlert(alert: Alert) {
        this.cd.detectChanges();
        this.cd.markForCheck();
    }

    cssClass(alert: Alert) {
        if (!alert) {
            return;
        }

        // return css class based on alert type
        switch (alert.type) {
            case AlertType.Success:
                return 'alert alert-success';
            case AlertType.Error:
                return 'alert alert-danger';
            case AlertType.Info:
                return 'alert alert-info';
            case AlertType.Warning:
                return 'alert alert-warning';
        }
    }
}