import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-no-access',
  templateUrl: './no-access.component.html',
  styleUrls: ['./no-access.component.scss']
})
export class NoAccessComponent implements OnInit {

  constructor(private menuService: NbMenuService, private translate: TranslateService) { }

  ngOnInit() {
  }

  goToHome() {
    this.menuService.navigateHome();
  }

}
