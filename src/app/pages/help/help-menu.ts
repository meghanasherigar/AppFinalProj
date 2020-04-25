import { NbMenuItem } from '@nebular/theme';

export class DDMenuItem extends NbMenuItem {
  ddData?: any;
  ddUrl?: string;
}

export const HELP_MENU_ITEMS: DDMenuItem[] = [
  
      {
        data:'menuItems.MANUAL',
        title: 'User Manual',
        icon: 'nb-bar-chart',
        ddUrl: '/#/pages/help/helpMain/(UserManual//level2Menu:userManualLevel2Menu//leftNav:leftNav)',
        ddData: ['pages/help/helpMain', { outlets: { primary: 'UserManual', level2Menu: 'userManualLevel2Menu', leftNav: 'leftNav' } }],
      },
      {
      data:'menuItems.FAQ',
      title: 'FAQ',
      icon: 'nb-bar-chart',
      ddUrl: '/#/pages/help/helpMain/(FAQMain//level2Menu:FAQLevel2Menu//leftNav:leftNav)',
      ddData: ['pages/help/helpMain', { outlets: { primary: 'FAQMain', level2Menu: 'FAQLevel2Menu', leftNav: 'leftNav' } }],
    },
    {
      data:'menuItems.WhatsNew',
      title: "What"+"'"+"s New",
      icon: 'nb-bar-chart',
      ddUrl: '/#/pages/help/helpMain/(whatsNewContentFaq//level2Menu:WhatsNewLevel2Menu//leftNav:leftNav)',
      ddData: ['pages/help/helpMain', { outlets: { primary: 'whatsNewContentFaq', level2Menu: 'WhatsNewLevel2Menu', leftNav: 'leftNav' } }],
    }
];
