import { Injectable } from '@angular/core';
import { IconViewSection } from '../../../../../../../@models/common/eventConstants';


@Injectable({
  providedIn: 'root'
})


export class ThemeService {
  allThemeOptions: any = [];

  constructor() { }

  //section to select only template / deliverable and disable the other one. -- starts
  enableDisableTemplatedDeliverable(tempDelList) {
    let isTemplateExists = tempDelList.filter(id => id.text == IconViewSection.Templates && id.internalChildren.filter(child => child.internalChecked == true && child.internalDisabled == false).length > 0);
    let isDeliverableExists = tempDelList.filter(id => id.text == IconViewSection.Deliverables && id.internalChildren.filter(child => child.internalChecked == true && child.internalDisabled == false).length > 0);

    if (isTemplateExists && isTemplateExists.length > 0) {
      tempDelList.filter(id => id.text == IconViewSection.Deliverables && id.internalChildren.forEach(child => {
        child.internalDisabled = true;
        
        if (child.internalChildren) {
          child.internalChildren.forEach(subChild => {
            subChild.internalDisabled = true;
          });
        }
      }));
      tempDelList.filter(id => id.text == IconViewSection.Templates && id.internalChildren.forEach(child => { if (child.internalChecked == false) child.internalDisabled = false }));
    }
    if (isDeliverableExists && isDeliverableExists.length > 0) {
      tempDelList.filter(id => id.text == IconViewSection.Templates && id.internalChildren.forEach(child => child.internalDisabled = true));
      tempDelList.filter(id => id.text == IconViewSection.Deliverables && id.internalChildren.forEach(child => { 
        if (child.internalChecked == false) child.internalDisabled = false;

        if (child.internalChildren) {
          child.internalChildren.forEach(subChild => {
            if (subChild.internalChecked == false) subChild.internalDisabled = false;
          });
        }
      }));
    }

    if (isTemplateExists.length == 0 && isDeliverableExists.length == 0) {
      isTemplateExists = tempDelList.filter(id => id.text == IconViewSection.Templates && id.internalChildren.filter(child => child.internalChecked == false).length > 0);
      isDeliverableExists = tempDelList.filter(id => id.text == IconViewSection.Deliverables && id.internalChildren.filter(child => child.internalChecked == false).length > 0);

      if (isTemplateExists.length > 0)
        tempDelList.filter(id => id.text == IconViewSection.Templates && id.internalChildren.forEach(child => { if (child.internalChecked == false) child.internalDisabled = false }));

      if (isDeliverableExists.length > 0)
        tempDelList.filter(id => id.text == IconViewSection.Deliverables && id.internalChildren.forEach(child => { 
          if (child.internalChecked == false) child.internalDisabled = false 
          if (child.internalChildren) {
            child.internalChildren.forEach(subChild => {
              if (subChild.internalChecked == false) subChild.internalDisabled = false;
            });
          }
        }));
    }
  }
  //section to select only template / deliverable and disable the other one. -- ends

}