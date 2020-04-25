import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-not-authorise',
  templateUrl: './not-authorise.component.html',
  styleUrls: ['./not-authorise.component.scss']
})
export class NotAuthoriseComponent implements OnInit {

  constructor(private menuService: NbMenuService, private translate: TranslateService) { }

  ngOnInit() {
  }

  goToHome() {
    this.menuService.navigateHome();
  }

}
