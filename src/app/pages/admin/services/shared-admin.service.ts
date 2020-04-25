import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedAdminService {
  sourceElement: any = {};
  newEditor: any;
  currentIndex: number = 0;
  imageName = new BehaviorSubject<boolean>(false);
  imageNameFlag=this.imageName.asObservable();
  enableDeleteButton  = new BehaviorSubject<boolean>(false);
  enableDeleteButtonflag = this.enableDeleteButton.asObservable();

constructor() { }

  setImageNameFlag(status) {
    this.imageName.next(status);
  }
  setenableDeleteButton(flag: boolean) {
    this.enableDeleteButton.next(flag);
  }

}
