import { Component, OnInit, Input } from '@angular/core';
import { SelectedSection } from '../../../../../../../../../@models/projectDesigner/theming';

@Component({
  selector: 'ngx-theme1-template-deliverable-content',
  templateUrl: './theme1-template-deliverable-content.component.html',
  styleUrls: ['./theme1-template-deliverable-content.component.scss']
})
export class Theme1TemplateDeliverableContentComponent implements OnInit {
  @Input("selectedSection") selectedSection : string;
  @Input("section") section: string;
  _selectedSection = SelectedSection;
  
  constructor() { }

  ngOnInit() {
  }

}
