import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    data: 'menuItems.IoTDashboard',
    title: 'IoT Dashboard',
    icon: 'nb-home',
    link: '/pages/iot-dashboard',
  },
  {
    title: 'FEATURES',
    data: 'menuItems.FEATURES',
    group: true,
  },
  {
    title: 'Users',
    data: 'menuItems.Users',
    icon: 'nb-person',
    children: [
      {
        title: 'User Create',
        data: 'menuItems.UserCreate',
        link: '/pages/user/create',
      },
    ],
  },
  {
  title: 'Whats New',
  data: 'menuItems.WhatsNew',
  link: '/pages/home/whatsnew',
  icon: 'nb-partlysunny',
  },
  {
    title: 'Home',
    data: 'menuItems.Home',
    link: '/pages/home'
  },
  {
    title: 'ProjectDesigner',
    data: 'menuItems.ProjectDesigner',
    link: '/pages/project-design/projectdesignMain'
  },
  {
    title: 'Project Setup',
    icon: 'nb-person',
    data: 'menuItems.ProjectSetup',
    children: [
      {
        title: 'File Upload',
        link: '/pages/project-setup/upload',
        data: 'menuItems.FileUpload',
      },
      {
        title: 'Manage Entities',
        link: '/pages/project-setup/manageEntities',
        data: 'menuItems.ManageEntities',
      },
      {
        title: 'Manage Transactions',
        link: '/pages/project-setup/manageTransactions',
        data: 'menuItems.manageTransactions',
      }
    ],
    }
];
