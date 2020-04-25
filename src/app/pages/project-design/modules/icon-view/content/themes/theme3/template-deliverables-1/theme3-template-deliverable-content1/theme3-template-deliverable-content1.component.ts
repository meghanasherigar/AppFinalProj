import { Component, OnInit, Input } from '@angular/core';
import { SelectedSection } from '../../../../../../../../../@models/projectDesigner/theming';

@Component({
  selector: 'ngx-theme3-template-deliverable-content1',
  templateUrl: './theme3-template-deliverable-content1.component.html',
  styleUrls: ['./theme3-template-deliverable-content1.component.scss']
})
export class Theme3TemplateDeliverableContent1Component implements OnInit {

  @Input("selectedSection") selectedSection : string;
  @Input("section") section: string;
  _selectedSection = SelectedSection;
  constructor() { }
  
  ngOnInit() {
  }

}
