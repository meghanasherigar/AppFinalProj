import {Component, OnInit} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;
import { Location } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  loading = '...';
  intervalId;
  profile;
  profileLoading = false;
  logoutLoading = false;
  apiLoading = false;
  apiResponse;
  //private alive = true;
  constructor(
    private themeService: NbThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    public authService: AuthService
        ) {
  }

  ngOnInit() {
    this.showLoding();
}

ngOnDestroy() {
    this.hideLoding();
}
getProfile(): void {
  this.profileLoading = true;
  this.authService.getProfile().subscribe(profile => {
      this.profile = [];
      Object.keys(profile).forEach((key) => {
          if (typeof profile[key] === 'string') {
              this.profile.push({
                  label: key,
                  value: profile[key]
              });
          }
      });
      this.profileLoading = false;
  });
}

callAPI():void{
  this.apiLoading = true;
  this.authService.callAPI().subscribe(apiResponse => {
      this.apiResponse = apiResponse;

      // console.log(apiResponse[0]);
      // Object.keys(apiResponse[0]).forEach((key) => {
      //     //console.log(apiResponse[key]);
      //     if(typeof apiResponse[key] === 'string'){
      //         this.apiResponse.push({
      //             label:key,
      //             value:apiResponse[key]
      //         });
      //     }
      // });
      this.apiLoading = false;        
  });
}

logout(): void {
  this.logoutLoading = true;
  this.authService.logout();
}

private showLoding(){
  this.intervalId = setInterval(() => {
      if (this.loading === '...') {
          this.loading = '';
      } else {
          this.loading += '.';
      }
  }, 500);
  
}
private hideLoding(){
  clearInterval(this.intervalId);        
}

  // ngOnDestroy() {
  //   this.alive = false;
  // }
}
