import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectSetupComponent } from './project-setup.component';
import { UploadScreenComponent } from './upload-screen/upload-screen.component';
import {ManageEntitiesComponent} from './entity/manage-entities/manage-entities.component';
import {ManageTransactionsComponent} from './transaction/manage-transactions/manage-transactions.component';
import { ManageUsersComponent } from './users/manage-users/manage-users.component';
import { PipesModule } from '../../shared/pipes/pipes.module';

const routes: Routes = [{
  path: '',
  component: ProjectSetupComponent,
  children: [
    {
      path: 'upload',
    component: UploadScreenComponent,
    },
    {
      path: 'whatsnew',
      component: UploadScreenComponent,
      outlet:'toolbar'
    },
    {
      path: 'manageEntities',
      component: ManageEntitiesComponent,
    },
    {
      path: 'manageTransactions',
      component: ManageTransactionsComponent,
    },
    {
      path: 'manageUsers',
      component: ManageUsersComponent,
    }
  ],
  
}
];

@NgModule({
  imports: [PipesModule],
  exports: [RouterModule],
  providers: [PipesModule],
})
export class ProjectSetupRoutingModule { }
