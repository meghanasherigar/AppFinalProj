import { TranslateService } from '@ngx-translate/core';


export enum Menus {
  Deliverable = 1,
  Block,
  Task,
  Visualization
}
export class PojectManageMentMenu {
  constructor(public translate: TranslateService) { }

  MenuList() {
      return [
        {
          id: Menus.Deliverable,
          url: '/#/pages/project-management/ProjectManagementMain/(Deliverable//level2Menu:DeliverableLevel2Menu//topmenu:ProjectManagementTopMenu)',
          disable: false,
          text: this.MenusText().Deliverable,
          hidden: false
        },
        {
          id: Menus.Block,
          url: '/#/pages/project-management/ProjectManagementMain/(Blocks//level2Menu:BlocksLevel2Menus//topmenu:ProjectManagementTopMenu)',
          disable: false,
          text: this.MenusText().BLock,
          hidden: false
        },
        {
          id: Menus.Task,
          url: '/#/pages/project-management/ProjectManagementMain/(tasks//level2Menu:TaskLevel2Menu//topmenu:ProjectManagementTopMenu)',
          disable: false,
          text: this.MenusText().Task,
          hidden: false
        },
        {
          id: Menus.Visualization,
          url: '/#/pages/project-management/ProjectManagementMain/(Visualization//level2Menu:VisualizationLevel2Menu//topmenu:ProjectManagementTopMenu)',
          disable: false,
          text: this.MenusText().Visualization,
          hidden: false
        }
      
      ]
  }

  MenusText() {
    return {
        Deliverable:  this.translate.instant('screens.Project-Management.Menus.Deliverable'),
        BLock: this.translate.instant('screens.Project-Management.Menus.Blocks'),
        Task: this.translate.instant('screens.Project-Management.Menus.Tasks'),
        Visualization: this.translate.instant('screens.Project-Management.Menus.Visualization')
      }
  }
}