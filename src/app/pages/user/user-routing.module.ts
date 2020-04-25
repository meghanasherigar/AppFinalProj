import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserComponent } from './user.component';
import { CreateUserComponent } from './create-user/create-user.component';


const routes: Routes = [{
  path: '',
  component: UserComponent,
  children: [
    {
      path: 'create',
      component: CreateUserComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule { }
