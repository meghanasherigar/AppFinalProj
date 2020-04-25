import { NbMenuItem } from '@nebular/theme';

export const SUPER_ADMIN_MENU_ITEMS: NbMenuItem[] = [
    {
        data: 'menuItems.AppUsers',
        title: 'App Users',
        icon: 'nb-person',
        url: '/#/pages/super-admin/superAdminMain/(AppUsers//level2Menu:AppUsersLevel2Menu//leftNav:superAdminLeftNav)',
    },
];
