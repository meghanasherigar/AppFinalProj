import { NbMenuItem } from '@nebular/theme';

export class DDMenuItem extends NbMenuItem {
  ddData?: any;
  ddUrl?: string;
}

export const PROJECT_SETUP_MENU_ITEMS: DDMenuItem[] = [
  {
    data: 'menuItems.Users',
    title: 'Users',
    icon: 'nb-bar-chart',
    ddUrl: '/#/pages/project-setup/projectSetupMain/(usersMain//level2Menu:usersLevel2Menu//leftNav:leftNav)',
    ddData: ['pages/project-setup/projectSetupMain', { outlets: { primary: 'usersMain', level2Menu: 'usersLevel2Menu', leftNav: 'leftNav' } }],
  },
  {
    data: 'menuItems.Entities',
    title: 'Entities',
    icon: 'nb-bar-chart',
    ddUrl: '/#/pages/project-setup/projectSetupMain/(entitiesMain//level2Menu:entitiesLevel2Menu//leftNav:leftNav)',
    ddData: ['pages/project-setup/projectSetupMain', { outlets: { primary: 'entitiesMain', level2Menu: 'entitiesLevel2Menu', leftNav: 'leftNav' } }],
  },
  {
    data: 'menuItems.Transaction',
    title: 'Transactions',
    icon: 'nb-bar-chart',
    ddUrl: '/#/pages/project-setup/projectSetupMain/(transactionMain//level2Menu:transactionLevel2Menu//leftNav:leftNav)',
    ddData: ['pages/project-setup/projectSetupMain', { outlets: { primary: 'transactionMain', level2Menu: 'transactionLevel2Menu', leftNav: 'leftNav' } }],
  },
  {
    data: 'menuItems.FileUpload',
    title: 'File Upload',
    icon: 'nb-bar-chart',
    ddUrl: '/#/pages/project-setup/projectSetupMain/(uploadMain//level2Menu:uploadLevel2Menu//leftNav:leftNav)',
    ddData: ['pages/project-setup/projectSetupMain', { outlets: { primary: 'uploadMain', level2Menu: 'uploadLevel2Menu', leftNav: 'leftNav' } }],
  },
  {
    data: 'menuItems.AuditTrail',
    title: 'Audit Trail',
    icon: 'nb-bar-chart',
    ddUrl: '/#/pages/project-setup/projectSetupMain/(auditTrailMain//level2Menu:auditTrailLevel2Menu//leftNav:leftNav)',
    ddData: ['pages/project-setup/projectSetupMain', { outlets: { primary: 'auditTrailMain', level2Menu: 'auditTrailLevel2Menu', leftNav: 'leftNav' } }],
  },
  {
    data: 'menuItems.ProjectSetting',
    title: 'Project Settings',
    icon: 'nb-bar-chart',
    ddUrl: '/#/pages/project-setup/projectSetupMain/(ProjectSettingMain//level2Menu:ProjectSettingLevel2Menu//leftNav:leftNav)',
    ddData: ['pages/project-setup/projectSetupMain', { outlets: { primary: 'ProjectSettingMain', level2Menu: 'ProjectSettingLevel2Menu', leftNav: 'leftNav' } }],
  }
];
