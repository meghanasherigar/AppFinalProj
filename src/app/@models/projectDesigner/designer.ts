import { BlockDetails, BlockAttributeDetail, BlockRequest } from './block';
import { TemplateViewModel } from './template';
import { StackAttributeDetail } from './stack';
import { DeliverableViewModel, EntityViewModel } from './deliverable';
import { DeleteBlockViewModel, LibraryDropdownViewModel, FilterLibraryModel } from './library';
import { BehaviorSubject } from 'rxjs';
import { DeliverableRoleViewModel } from '../userAdmin';

export class Designer {
  isExtendedIconicView: boolean = false;
  blockDetails: BlockDetails = null;
  templateDetails: TemplateViewModel = null;
  blockAttributeDetail: BlockAttributeDetail = null;
  blockList: BlockDetails[] = [];
  expandedNodes: BlockDetails[] = [];
  stackAttributeDetail: StackAttributeDetail = null;
  deliverableDetails: DeliverableViewModel = null;
  entityDetails: EntityViewModel[] = [];
  isTemplateSection: boolean = false;
  isDeliverableSection: boolean = false;
  deleteblock: DeleteBlockViewModel = null;
  isLibrarySection: boolean = false;
  isCopied: boolean = false;
  libraryDetails: LibraryDropdownViewModel = null;
  blocksToBeCopied: BlockDetails[] = [];
  selectedFilterProjectYear = [];
  selectedFilterblockStatus = [];
  selectedFilterblockOrigin = [];
  selectedFiltertitle = [];
  selectedFilterDescription=[];
  selectedFilterBlockCreator = [];
  selectedFilterblockState = [];
  selectedFilterindustry = [];
  selectedblockType = [];
  LoadAllBlocksDocumentView: boolean = false;
  showIconFlag: boolean = false;
  selectedStackLevel = [];
  selectedStackType = [];
  selectedStackTransactionType = [];
  filterLibraryModel: FilterLibraryModel = new FilterLibraryModel();
  canEditAttributeFlag: boolean = true;
  selectedEntityRights: DeliverableRoleViewModel[] = [];
  selectedEntityIds: any = [];
  assignToBlockList: any = [];
}
export enum SubMenus {
  Editor = 1,
  Insert,
  Layout,
  Review,
  Tasks,
  InformationRequest,
  AnswerTag,
  ViewAbbreviations
}

export enum Menus {
  Block = 1,
  Templates_Deliverables,
  Appendices,
  InformationRequest
}

export const FullDocumentViewConst = {
  'ariallabel': 'aria-label',
  'headerSection': 'headerSection',
  'footerSection': 'footerSection',
  'splitKeyword': ', '
}
export const FontFamily = [
  { name: 'Arial', value: 'Arial,Arial Black, Gadget,Helvetica, sans-serif' },
  { name: 'Comic Sans MS', value: "Comic Sans MS, cursive" },
  { name: 'Courier New, Courier, monospace', value: 'Courier New, Courier, monospace' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Impact', value: 'Impact, Charcoal' },
  { name: 'Lucida Console', value: 'Lucida Console", Monaco, monospace' },
  { name: 'Lucida Sans Unicode', value: 'Lucida Sans Unicode, Lucida Grande, sans-serif' },
  { name: 'MS PGothic', value: 'MS PGothic' },
  { name: 'Palatino Linotype', value: 'Palatino Linotype,Book Antiqua, Palatino, serif' },
  { name: 'STHeiti Light (华文细黑)', value: 'STHeiti Light (华文细黑)' },
  { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, Times, serif' },
  { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Wingdings', value: 'Wingdings' },
]

export const BlockTypeConst = {
  'CoveredTransactionsBlock': 'Covered Transactions Block'
}

export const TransactionModel = {
  "TypeOfTransaction": "Type of transaction",
  "Counterparty": "Counterparty",
  "TaxJurisdictionCounterParty": "Tax jurisdiction",
  "RelationshipCounterParty": "Relationship",
  "AmountPaid": "Amount",

}

export const coverPage = {
  "contentType": "coverpage" 
}