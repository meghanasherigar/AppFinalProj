import { NbMenuItem } from '@nebular/theme';
import { StorageKeys, StorageService } from '../../@core/services/storage/storage.service';
import { UserSetting } from '../../@models/user';
import { RoleService } from '../../shared/services/role.service';

export class AdminMenus {
  static storageService: StorageService = new StorageService();
  constructor(public roleservice:RoleService) { }

  public static getUserAccess(): UserSetting {
      return JSON.parse(AdminMenus.storageService.getItem(StorageKeys.USERSETTING));
  }
}

export class DDMenuItem extends NbMenuItem {
  ddData?: any;
  ddUrl?: string;
  children?: DDMenuItem[];
}

export const ADMIN_MENU_ITEMS: DDMenuItem[] = [
  {
    data: 'menuItems.AdminUsageReport',
    title: 'Usage Report',
    icon: 'usageReport',
    ddUrl: '/#/pages/admin/adminMain/(usageReportMain//level2Menu:uageReportLevel2Menu//leftNav:leftNav)',
    ddData: ['pages/admin/adminMain', { outlets: { primary: 'usageReportMain', level2Menu: 'uageReportLevel2Menu', leftNav: 'leftNav' } }],
    hidden: (AdminMenus.getUserAccess().isGlobalAdmin) ? false : true
  },
  {
    data: 'menuItems.ManageAdmin',
    title: 'Administrators',
    icon: 'nb-person',
    ddUrl: '/#/pages/admin/adminMain/(manageAdminComponent//level2Menu:adminLevel2Menu//leftNav:leftNav)',
    ddData: ['pages/admin/adminMain', { outlets: { primary: 'manageAdminComponent', level2Menu: 'adminLevel2Menu', leftNav: 'leftNav' } }],
    hidden: (AdminMenus.getUserAccess().isGlobalAdmin) ? false : true
  },
  {
    data:'menuItems.AdminContent',
    title: 'Content',
    icon: 'nb-bar-chart',
    hidden: (AdminMenus.getUserAccess().isGlobalAdmin) ? false : true,
    children: [ {
      data:'menuItems.FAQ',
      title: 'FAQ',
      icon: 'nb-bar-chart',
      ddUrl: '/#/pages/admin/adminMain/(FAQMain//level2Menu:FAQLevel2Menu//leftNav:leftNav)',
      ddData: ['pages/admin/adminMain', { outlets: { primary: 'FAQMain', level2Menu: 'FAQLevel2Menu', leftNav: 'leftNav' } }],
      hidden: (AdminMenus.getUserAccess().isGlobalAdmin) ? false : true
    },
    
    {
      data:'menuItems.PrivacyPolicy',
      title: 'Privacy Policy',
      icon: 'nb-bar-chart',
      ddUrl: '/#/pages/admin/adminMain/(PrivacyPolicy//level2Menu:PrivacyPolicyLevel2Menu//leftNav:leftNav)',
      ddData: ['pages/admin/adminMain', { outlets: { primary: 'PrivacyPolicy', level2Menu: 'PrivacyPolicyLevel2Menu', leftNav: 'leftNav' } }],
      hidden: (AdminMenus.getUserAccess().isGlobalAdmin) ? false : true    
    },
    {
      data:'menuItems.TermsOfUse',
      title: 'Terms of Use',
      icon: 'nb-bar-chart',
      ddUrl: '/#/pages/admin/adminMain/(TermsOfUse//level2Menu:TermsofUseLevel2Menu//leftNav:leftNav)',
      ddData: ['pages/admin/adminMain', { outlets: { primary: 'TermsOfUse', level2Menu: 'TermsofUseLevel2Menu', leftNav: 'leftNav' } }],
      hidden: (AdminMenus.getUserAccess().isGlobalAdmin) ? false : true   
    },
    {
      data:'menuItems.WhatsNew',
      title: 'Whats New',
      icon: 'nb-bar-chart',
      ddUrl: '/#/pages/admin/adminMain/(whatsNewContent//level2Menu:WhatsNewLevel2Menu//leftNav:leftNav)',
      ddData: ['pages/admin/adminMain', { outlets: { primary: 'whatsNewContent', level2Menu: 'WhatsNewLevel2Menu', leftNav: 'leftNav' } }],
      hidden: (AdminMenus.getUserAccess().isGlobalAdmin) ? false : true
    }],
  },
  {
    data:'menuItems.AdminLibrary',
    title: 'Library',
    icon: 'library',
    children: [{
      data:'menuItems.GlobalLibrary',
      title: 'Global Library',
      icon: '',
      ddUrl: '/#/pages/admin/adminMain/(globalLibraryMain//level2Menu:EditorLevel2MenuLibrary//topmenu:libraryviewtopmenu//leftNav:leftNav)',
      ddData: ['pages/admin/adminMain', { outlets: { primary: 'globalLibraryMain', level2Menu: 'EditorLevel2MenuLibrary', topmenu: 'libraryviewtopmenu', leftNav: 'leftNav' } }],
      hidden: (AdminMenus.getUserAccess().isGlobalAdmin) ? false : true
    },
    {
      data:'menuItems.CountryLibrary',
      title: 'Country Library',
      icon: '',
      ddUrl: '/#/pages/admin/adminMain/(countryLibraryMain//level2Menu:EditorLevel2MenuLibrary//topmenu:libraryviewtopmenu//leftNav:leftNav)',
      ddData: ['pages/admin/adminMain', { outlets: { primary: 'countryLibraryMain', level2Menu: 'EditorLevel2MenuLibrary', topmenu: 'libraryviewtopmenu', leftNav: 'leftNav' } }],
      hidden: (AdminMenus.getUserAccess().isCountryAdmin) ? false : true      
    },
    {
      data:'menuItems.BlockSuggestions',
      title: 'Suggestions',
      icon: '',
      ddUrl: '/#/pages/admin/adminMain/(blockSuggestionMain//level2Menu:blockSuggestionLevel2Menu//leftNav:leftNav)',
      ddData: ['pages/admin/adminMain', { outlets: { primary: 'blockSuggestionMain', level2Menu: 'blockSuggestionLevel2Menu', leftNav: 'leftNav' } }],
      hidden: false       
    }
    ]
  }

];
