import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HomeComponent} from './home.component';
import {CreateOrganizationProjectComponent} from './create-organization-project/create-organization-project.component' 
import { Routes, RouterModule } from '@angular/router';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { VeiwAllNotificationComponent } from './veiw-all-notification/veiw-all-notification.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';

const routes: Routes = [{
  path: '',
  component: HomeComponent
}, 
{
  path: 'veiw-all-notification',
  component: VeiwAllNotificationComponent,
},
{
  path: 'terms-of-use',
  component: TermsOfUseComponent,
},

];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PipesModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
