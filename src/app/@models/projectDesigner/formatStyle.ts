export class DocumentLayoutStyle {
  projectId : string;
  layoutName : string = "";
  isDefault : boolean;
  isActive : boolean;
  isInternalUser : boolean;
  isTemplate : boolean;
  templateOrDeliverableId : string = "";
  id: string;
  styles : DocumentStyle[];
  isNew : boolean = false;
  isGlobalTemplate : boolean = null;
}

export class DocumentStyle{
  name : string;
  styleOn : string;
  properties : any = {};
}

export const FormatOptions = {
  fontFamily: 'fontName',
  fontSize: 'fontSize',
  fontColor: 'color',
  fontBackgroundColor: 'highlightColor',
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  alignment: 'alignment',
  multiple: 'Multiple'
}

export enum Underline {
  None = 0,
  Single = 1
}

export enum Alignment {
  left = 0,
  center = 1,
  right = 2,
  justify = 3
}

export const StyleOn = {
  Heading1: "Heading 1",
  Heading2: "Heading 2",
  Heading3: "Heading 3",
  Heading4: "Heading 4",
  Heading5: "Heading 5",
  Body: "Body",
  Bullet: "Bullet"
}

export const DefineColorSection = {
  fulldocumentView: "Full Document View",
  formatStyling:"Format Styling"
}