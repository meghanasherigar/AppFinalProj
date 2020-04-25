import { BlockDetailsResponseViewModel } from './block';
import { TemplateViewModel } from './template';
import { DeliverablesInput } from './deliverable';
import { Designer } from './designer';

export enum Theme {
  Theme1,
  Theme2,
  Theme3,
  Theme4
}
export const ThemeConstant= {
  Theme1:"Theme1",
  Theme2:"Theme2",
  Theme3:"Theme3",
  Theme4:"Theme4"
}

export const ThemeSection = {
  Theme3_1: 'Theme3.1',
  Theme3_2: 'Theme3.2',
  Theme3_3: 'Theme3.3',
  Theme2_1: 'Theme2.1',
  Theme2_2: 'Theme2.2',
  Theme2_3: 'Theme2.3',
  Theme1_1: 'Theme1.1',
  Theme1_2: 'Theme1.2',
  Theme1_3: 'Theme1.3',
}

export const SelectedSection = {
  Templates : 'Templates',
  Deliverables : 'Deliverables',
  Library : 'Library'
}

export const Themes = [  
  {
    name: 'Theme1',
    value: Theme.Theme4,
    checked: false,
    theme_options: [
      { name: 'Libraries/Block Collection', value: 'Theme1.1', checked: false },
      { name: 'Templates/Deliverables', value: 'Theme1.2', checked: false },
      { name: 'Templates/Deliverables', value: 'Theme1.3', checked: false }
    ]
  },
  {
    name: 'Theme2',
    value: Theme.Theme2,
    checked: false,
    theme_options: [
      { name: 'Libraries/Block Collection', value: 'Theme2.1', checked: false },
      { name: 'Libraries/Block Collection', value: 'Theme2.2', checked: false },
      { name: 'Templates/Deliverables', value: 'Theme2.3', checked: false }
    ]
  },
  {
    name: 'Theme3',
    value: Theme.Theme3,
    checked: false,
    theme_options: [
      { name: 'Templates/Deliverables', value: 'Theme3.1', checked: false },
      { name: 'Templates/Deliverables', value: 'Theme3.2', checked: false },
      { name: 'Templates/Deliverables', value: 'Theme3.3', checked: false }
    ]
  },
  {
    name: 'Theme1_old',
    value: Theme.Theme1,
    checked: true,
    theme_options: [
      { name: 'Libraries/Block Collection', value: 'Theme1.1', checked: true },
      { name: 'Templates/Deliverables', value: 'Theme1.2', checked: true },
      { name: 'Templates/Deliverables', value: 'Theme1.3', checked: true }
    ]
  }  
];

export class ThemeOptions {
  name: string;
  data: ThemeCollection;
  tempDelList: any = [];
  library : any;
  designerService = new Designer();
}

export class SelectedBlockDisplayType {
  name: string;
  value:number;
  checked: false;
}

export class ThemeCollection {
  template : TemplateViewModel;
  deliverable : DeliverablesInput;
  library : any;
  blocks: BlockDetailsResponseViewModel[];
}

export class ThemingContext {
  themeOptions: ThemeOptions[];
  selectedDisplayType: SelectedBlockDisplayType;
  theme: Theme;
}
