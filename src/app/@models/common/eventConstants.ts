export const EventConstants = {
    AdminUsageReport: 'AdminUsageReport',
    AdminView: 'AdminView',
    ManageEntity: 'ManageEntity',
    EntityFilter: 'EntityFilter',
    EntityDownload: 'EntityDownload',
    EntityCRUD: 'EntityCRUD',
    ManageTransaction: 'ManageTransaction',
    TransactionFilter: 'TransactionFilter',
    TransactionDownload: 'TransactionDownload',
    TransactionCRUD: 'TransactionCRUD',
    OrganizationMenuFilter: 'OrganizationMenuFilter',
    ProjectMenuFilter: 'ProjectMenuFilter',
    FileUploadFilter: 'FileUploadFilter',
    ManageFileUpload: 'ManageFileUpload',
    ToggleManageFileUpload: 'ToggleManageFileUpload',
    UsageReportFilter: 'UsageReportFilter',
    ContentFAQ: 'ContentFAQ',
    ContentWhatsNew: 'ContentWhatsNew',
    ManageAdmin: 'ManageAdmin',
    HomeMenuEnableDisableIcons: 'HomeMenuEnableDisableIcons',
    RedirectToViewHidden: 'RedirectToViewHidden',
    GetOrganizations: 'GetOrganizations',
    ManageAdminEnableDisableIcons: 'ManageAdminEnableDisableIcons',
    ManageAdminFilter: 'ManageAdminFilter',
    ContentToolbarFAQ: 'ContentToolbarFAQ',
    PrivacyPolicy: 'PrivacyPolicy',
    PrivayPolicyToolbar: 'PrivayPolicyToolbar',
    GlobalLibraryToolbar: 'GlobalLibraryToolbar',
    TermsOfUse: 'TermsOfUse',
    DownloadFileStart:'DownloadFileStart',
    DownloadFileStop:'DownloadFileStop',
    DownloadFileStartUserScreen:'DownloadFileStartUserScreen',
    DownloadFileStopUserScreen:'DownloadFileStopUserScreen',
    TermsOfUseToolbar: 'TermsOfUseToolbar',
    ContentToolbarWhatsNew: 'ContentToolbarWhatsNew',
    ManageUserManual: 'ManageUserManual',
    DownloadUserManualStart:'DownloadUserManualStart',
    DownloadUserManualStop:'DownloadUserManualStop',
    ProjectUser: 'ProjectUser',
    ProjectUserEnableDisableIcons: 'ProjectUserEnableDisableIcons',
    ProjectUserEnableDisableReSendIcons: 'ProjectUserEnableDisableReSendIcons',
    ProjectUserSendEmailList: 'ProjectUserSendEmailList',
    DisplayTheme1: 'DisplayTheme1',
    DisplayTheme2: 'DisplayTheme2',
    DisplayTheme3: 'DisplayTheme3',
    DisplayTheme4: 'DisplayTheme4',
    TemplateDetails: 'TemplateDetails',
    ViewAttribute: 'ViewAttribute',
    TemplateSection: 'TemplateSection',
    blockfilter: 'blockfilter',
    ProjectTabAccess: 'ProjectTabAccess',
    ProjectUserDownload: 'ProjectUserDownload',
    ProjectUserFilter: 'ProjectUserFilter',
    ProjectUserFilterRefresh: 'ProjectUserFilterRefresh',
    ProjectDesignerTabAccess: 'ProjectDesignerTabAccess',
    ProjectManagementTabAccess: 'ProjectManagementTabAccess',
    NotificationEnableDisableIcons: 'NotificationEnableDisableIcons',
    NotificationFilter: 'NotificationFilter',
    NotificationUser: 'NotificationUser',
    DeliverableSection: 'DeliverableSecttion',
    LibrarySection: 'LibrarySection',
    ManageLibrarySection: 'ManageLibrarySection',
    UserDataCallBack: 'UserDataCallBack',
    DisAbleIcon: 'disAbleIcon',
    ActivateMenu: 'ActivateMenu',
    Global: "Global",
    Country: "Country",
    Organization: "Organization",
    Personal: "Personal",
    User: "User",
    BlockCollection: "Blocks",
    DocumentViewToolBar: 'DocumentViewToolBar',
    DocumentView: 'DocumentView',
    ProjectInContext: 'ProjectInContext',
    BlockView: "BlockView",
    BlockStaffingIcon: "BlockStaffingIcon",
    ProjectSettingsSave: "ProjectSettingsSave",
    ProjectSettingsValueAnyChange:"ProjectSettingsValueAnyChange",
    SendEmail: "SendEmail",
    Unassociated: "Unassociated"
}

export const ColorCode =
{
    White: "White",
    Teal: "Teal",
    Grey: "Grey"
}

export const TableTypeCommands =
{
    InsertTableRowBelow: 'insertTableRowBelow',
    InsertTableRowAbove: 'insertTableRowAbove'
}

export const DragNodeConst = {
    above: "above",
    below: "below",
    center: "center"
}

export const NavigationSource =
{
    MyTask: "MyTask"
}

export const TreeViewConstant = {
    defaultIndustry : "defaultIndustry",
    templateDeliverables : "templateDeliverables",
    templates:"templates",
    deliverables:"deliverables",
    select : "select",
}

export const IconViewSection = {
    LibraryBlockSuggestion: "LibraryBlockSuggestion",
    BlockImporterPdf: "BlockImporterPdf",
    BlockImporter: "BlockImporter",
    Template: "Template",
    LoadSelectedTheme: "LoadSelectedTheme",
    Add: "Add",
    Remove: "Remove",
    Templates: "Templates",
    Deliverables: "Deliverables"
}

export const AdminSection = {
  globalLibrary : "globalLibraryMain",
  countryLibrary : "countryLibraryMain"  
}

export var eventConstantsEnum = {
    "emptyGuid": "000000000000000000000000",
    "projectDesigner": {
        "common":{
            "refreshBlocks" : "projectDesigner.common.refreshBlocks",
            "refreshBlocksUId" : "projectDesigner.common.refreshBlocksUId",
            "enableCreateBlock": "projectDesigner.iconicViewDeliverableSection.enableCreateBlock"
        },
        "templateSection": {
            "manageTemplates": "projectDesigner.templateSection.manageTemplates"
        },
        "deliverablesTab": {
            "manageDeliverables": "projectDesigner.deliverablesTab.manageDeliverables"
        },
        "generationHistory":
        {
            "reportHistory": "projectDesigner.templateSection.reportHistory",
            "reportHistoryToolbar": "projectDesigner.templateSection.reportHistoryToolbar",
        },
        "deliverableGroup":
        {
            "toggleIcons": "toggleIcons",
            "deleteGroup": "deleteGroup",
            "editGroup": "editGroup",
            "actionEdit": "actionEdit",
            "actionDelete": "actionDelete",
            "actionAdd": "actionAdd",
            "actionFilter":"actionFilter",
            "performAction":"performAction"
        },
        "blockImporter": {
            "displayBlocks": "projectDesigner.region.blockImporter.displayBlocks",
            "addBlock": "projectDesigner.region.blockImporter.addBlock",
            "importBlocks": "projectDesigner.region.blockImporter.importBlocks",
            "nextStep": "projectDesigner.region.blockImporter.nextStep",
            "disableNext": "projectDesigner.region.blockImporter.nextStep",
            "cancelBlockImporter": "projectDesigner.region.blockImporter.cancelBlockImporter",
            "editBlockExtendedViewGlobal": "projectDesigner.region.blockImporter.editBlockExtendedViewGlobal",
            "editBlockExtendedViewCountry": "projectDesigner.region.blockImporter.editBlockExtendedViewCountry",

        },
        "region": {
            "selectedSection": "projectDesigner.region.selectedSection"
        },
        "blockedit": {
            "suggestBlockEdit": "projectDesigner.blockedit.suggestBlockEdit",
            "isDuplicateTag": "projectDesigner.blockedit.isDuplicateTag"
        },
        "iconicViewTemplateSection": {
            "editBlockAttributes": "projectDesigner.iconicViewTemplateSection.editBlockAttributes",
            "editBlockExtendedView": "projectDesigner.iconicViewTemplateSection.editBlockExtendedView",
            "templateDetails": "projectDesigner.iconicViewTemplateSection.templateDetails",
            "libraryDetails": "projectDesigner.iconicViewTemplateSection.libraryDetails",
            "libraryChange": "projectDesigner.iconicViewTemplateSection.libraryChange",
            "deliverableDetails": "projectDesigner.iconicViewTemplateSection.deliverableDetails",
            "deliverableDetailsFilter": "projectDesigner.iconicViewTemplateSection.deliverableDetailsFilter",
            "loadTemplate": "projectDesigner.iconicViewTemplateSection.loadTemplate",
            "message": "projectDesigner.iconicViewTemplateSection.message",
            "iconExtendedView": "projectDesigner.iconicViewTemplateSection.iconExtendedView",
            "updateHeader": "projectDesigner.iconicViewTemplateSection.updateHeader",
            "entityDeliverable": "projectDesigner.iconicViewTemplateSection.entityDeliverable",
            "disableDropdown": "projectDesigner.iconicViewTemplateSection.disableDropdown",
            "popOver": "projectDesigner.iconicViewTemplateSection.hidePopOver",
            "popup": "projectDesigner.iconicViewTemplateSection.popup",
            "selectAllTemp": "projectDesigner.iconicViewTemplateSection.selectAllTemp",
            "selectAll": "projectDesigner.iconicViewTemplateSection.selectAll",
            "enableIcon": "projectDesigner.iconicViewTemplateSection.enableIcon",
            "enableIconD": "projectDesigner.iconicViewTemplateSection.enableIconD",
            "disableDeleteForLockedBlock":"projectDesigner.iconicViewTemplateSection.disableDeleteForLockedBlock",
            "searchDeliverableDetails": "projectDesigner.iconicViewTemplateSection.searchDeliverableDetails",
            "loadLibrary": "projectDesigner.iconicViewTemplateSection.loadLibrary",
            "indentation": "projectDesigner.iconicViewTemplateSection.indentation",
            "deleteblock": "projectDesigner.iconicViewTemplateSection.deleteblock",
            "manageLibrary": "projectDesigner.iconicViewTemplateSection.manageLibrary",
            "filterIcon": "projectDesigner.iconicViewTemplateSection.filterIcon",
            "filterIconD": "projectDesigner.iconicViewTemplateSection.filterIconD",

            "filterIconL": "projectDesigner.iconicViewTemplateSection.filterIconL",
            "deletedLibrary": "projectDesigner.iconicViewTemplateSection.deletedLibrary",
            "documentHeaderType": "projectDesigner.iconicViewLibrarySection.documentHeaderType",
            "documentFooterType": "projectDesigner.iconicViewLibrarySection.documentFooterType",
            "deleteHeader": "projectDesigner.iconicViewLibrarySection.deleteHeader",
            "deleteFooter": "projectDesigner.iconicViewLibrarySection.deleteFooter",
            "addFootNote": "projectDesigner.iconicViewLibrarySection.addFootNote",
            "reloadHeaderFooterByTemplateId": "projectDesigner.iconicViewLibrarySection.reloadHeaderFooterByTemplateId",
            "deleteAll": "projectDesigner.iconicViewLibrarySection.deleteAll",
            "docViewSelectedNodeTemplate": "projectDesigner.iconicViewLibrarySection.docViewSelectedNodeTemplate",
            "docViewSelectedNodeDeliverables": "projectDesigner.iconicViewLibrarySection.docViewSelectedNodeDeliverables",
            "docViewSelectedNodeLibrary": "projectDesigner.iconicViewLibrarySection.docViewSelectedNodeLibrary",
            "editorBlockAttributes": "projectDesigner.iconicViewLibrarySection.editorBlockAttributes",
            "templateDetailsAttr": "projectDesigner.iconicViewLibrarySection.templateDetailsAttr",
            "addBlocksPartialMerge": "projectDesigner.iconicViewLibrarySection.addBlocksPartialMerge"

        },
        "iconicViewDeliverableSection": {
            "enableIcon": "projectDesigner.iconicViewDeliverableSection.enableIcon",
            "disableDropdown": "projectDesigner.iconicViewDeliverableSection.disableDropdown",
            "selectAll": "projectDesigner.iconicViewDeliverableSection.selectAll",
            "copyDeliverable": "projectDesigner.iconicViewTemplateSection.copyDeliverable",
            "loadDeliverable": "projectDesigner.iconicViewTemplateSection.loadDeliverable",
            "getDeliverables": "projectDesigner.iconicViewDeliverableSection.getDeliverables",
            "updateHeader": "projectDesigner.iconicViewDeliverableSection.updateHeader",
        },
        "documentView": {
            "toggleAnswerTag": "projectDesigner.documentView.toggleAnswerTag",
            "action": "projectDesigner.documentView.action",
            "adminAction": "projectDesigner.documentView.adminAction",
            "selectedAdminLibaryDropdown":"projectDesigner.documentView.selectedAdminLibaryDropdown",
            "hideQuestionList": "projectDesigner.documentView.hideQuestionList",
            "enableIconD": "projectDesigner.iconicViewTemplateSection.enableIconD",
            "DismisFindReplace": "projectDesigner.iconicViewTemplateSection.dismissFindReplace",
            "searchDeliverableDetails": "projectDesigner.iconicViewTemplateSection.searchDeliverableDetails",
            "loadLibrary": "projectDesigner.iconicViewTemplateSection.loadLibrary",
            "changelibrarydropdown": "projectDesigner.iconicViewTemplateSection.changelibrarydropdown",
            "blockStaffingRoles": "projectDesigner.iconicViewTemplateSection.accessRights",
            "loadTemplate": "projectDesigner.iconicViewTemplateSection.loadTemplate",
            "InsertAction": "projectDesigner.iconicViewTemplateSection.insertAction",
            "loadDeliverable": "projectDesigner.iconicViewTemplateSection.loadDeliverable",
            "loadAbbreviations": "projectDesigner.documentView.loadAbbreviations",
            "deleteAbbreviations": "projectDesigner.documentView.deleteAbbreviations",
            "searchAbbreviations": "projectDesigner.documentView.searchAbbreviations",
            "insertLayoutToolbarIcons": "projectDesigner.documentView.insertLayoutToolbarIcons",
            "createAnswer": "projectDesigner.documentView.createAnswer",
            "createButtonAnswer": "projectDesigner.documentView.createButtonAnswer",
            "projectVariableFilter": "projectDesigner.documentView.projectVariableFilter",
            "tabSelection": "projectDesigner.documentView.tabSelection",
            "systemTabSelection": "projectDesigner.documentView.systemTabSelection",
            "systemTagDefaultActive": " projectDesigner.documentView.systemTagDefaultActive",
            "answerTagDefaultTabActive": " projectDesigner.documentView.answerTagDefaultTabActive",
            "actionRequest": "projectDesigner.documentView.actionRequest",
            "refreshFilterMenu": "projectDesigner.documentView.refreshFilterMenu",
            "entityVariableFilter": "projectDesigner.documentView.entityVariableFilter",
            "enableIconImportTransaction": "projectDesigner.documentView.enableIconImportTransaction",
            "answerTagFilter": "projectDesigner.documentView.answerTagFilter",
            "deleteInfoRequests": "projectDesigner.documentView.deleteInfoRequests",
            "sendremindericon": "projectDesigner.documentView.sendremindericon",
            "projectVariableRefreshFilter": "projectDesigner.documentView.projectVariableRefreshFilter",
            "enableTrackChanges": "projectDesigner.documentView.enableTrackChanges",
            "loadQuestionsByTemplateOrDeliverableId": "projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId",
            "loadSuggestionsCreateQuestion": "projectDesigner.documentView.loadSuggestionsCreateQuestion",
            "loadQuestionsByLibrary": "projectDesigner.documentView.loadQuestionsByLibrary",
            "displayQuestionList": "projectDesigner.documentView.displayQuestionList",
            "isEnableDocContentLUReadOnly": "projectDesigner.documentView.isEnableDocContentLUReadOnly",
            "showOrHideProjectManagment": "projectDesigner.documentView.showOrHideProjectManagment",
            "pageBreak": "projectDesigner.documentView.formater.pageBreak",
            "ApplyParagraphSpacing": "projectDesigner.documentView.ApplyParagraphSpacing",
            "ApplyCrossReference": "projectDesigner.documentView.ApplyCrossReference",
            "AddBookmark": "projectDesigner.documentView.AddBookmark",
            "ReloadParagraphSpacing" : "projectDesigner.documentView.ReloadParagraphSpacing",
            "ReloadAddBookMark": "projectDesigner.documentView.ReloadAddBookMark", 
            "bookmarkList": "projectDesigner.documentView.bookmarkList", 
            "ReloadApplyCrossReference": "projectDesigner.documentView.ReloadApplyCrossReference", 
            "EnableDisableFormatPainter": "projectDesigner.documentView.EnableDisableFormatPainter",
            "EnableAnswerTagCreateIcon": "projectDesigner.documentView.EnableAnswerTagCreateIcon",
            "FormatPainterAddClass": "projectDesigner.documentView.FormatPainterAddClass",
            "Layout":
            {
                "blockSecHide": "projectDesigner.documentView.formater.blockSecHide",
                "pageColor": "projectDesigner.documentView.formater.pageColor",
                "waterwark": "projectDesigner.documentView.formater.watermark",
                "pageOrientation": "projectDesigner.documentView.formater.pageOrientation",
                "pageSize": "projectDesigner.documentView.formater.pageSize",
                "pageMargin": "projectDesigner.documentView.formater.pageMargin",
                "customMargin": "projectDesigner.documentView.formater.customMargin",
                "tableOfContentType": "projectDesigner.iconicViewLibrarySection.tableOfContentType",
                "removeTableOfContent": "projectDesigner.iconicViewLibrarySection.removeTableOfContent",
                "applyLayoutStyleToContent": "projectDesigner.documentView.Layout.applyLayoutStyleToContent",
                "updateLayoutStyleToContent": "projectDesigner.documentView.Layout.updateLayoutStyleToContent",
                "changeLayoutStyle": "projectDesigner.documentView.Layout.changeLayoutStyle",
                "toggleStylePanel": "projectDesigner.documentView.Layout.toggleStylePanel",
                "setStyleForNewLayout": "projectDesigner.documentView.Layout.setStyleForNewLayout",
                "refreshTemplateBlocks": "projectDesigner.documentView.Layout.refreshTemplateBlocks",
                "updateDefinedColor": "projectDesigner.documentView.Layout.updateDefinedColor",
                "highlight_Pageborder": "projectDesigner.documentView.Layout.highlight_Pageborder",
                "refreshTemplateBlocksUId":  "projectDesigner.documentView.Layout.refreshTemplateBlocksUId"
            },
            "insert" : {
                "pageBreak": "projectDesigner.documentView.insert.pageBreak"
            },
            "infogathering":
            {
                "selectquestions": "projectDesigner.documentView.infoGathering.createInfo.selectQuestions",
                "spliceQuestions": "projectDesigner.documentView.infoGathering.createInfo.spliceQuestions",
                "saveAsProgress": "projectDesigner.iconicViewTemplateSection.saveAsProgress",
                "currentCreateInfoStep": "projectDesigner.documentView.infoGathering.createInfo.currentStep",
                "createInfo": "projectDesigner.documentView.infoGathering.createInfo.ceateInfo",
                "nextStep": "projectDesigner.documentView.infoGathering.createInfo.nextClick",
                "blockType": "projectDesigner.documentView.infoGathering.createInfo.blockType",
                "questionsLoaded": "projectDesigner.documentView.infoGathering.createInfo.questionsLoaded",
                "questionsEntityLoaded": "projectDesigner.documentView.infoGathering.createInfo.entityQuestionsLoaded",
                "loadcoverpage": "projectDesigner.documentView.infoGathering.loadcoverpage",
                "blockContentLoaded": "projectDesigner.documentView.infoGathering.createInfo.blockContentLoaded",
                "loadInfoRequestView": "projectDesigner.documentView.infoGathering.answerInfo.loadInfoRequestView",
                "saveInfoRequest": "projectDesigner.documentView.infoGathering.answerInfo.saveInfoRequest",
                "requestLevel2Details": "projectDesigner.documentView.infoGathering.answerInfo.requestLevel2Details",
                "loadBlockTypes": "projectDesigner.documentView.infoGathering.answerInfo.loadBlockTypes",
                "populateQuestions": "projectDesigner.documentView.infoGathering.populateQuestions",
                "loadInfoGathering": "projectDesigner.documentView.infoGathering.loadInfoGathering",
                "clearCoverPage": "projectDesigner.documentView.infoGathering.createInfo.clearCoverPage",
                "clearInfoPreview": "projectDesigner.documentView.infoGathering.createInfo.clearInfoPreview",
                "loadQuestionAnswerAfterSave": "projectDesigner.documentView.infoGathering.loadQuestionAnswerAfterSave",
                "sendMail": "projectDesigner.documentView.infoGathering.sendMail",
                "sendChatMessage": "projectDesigner.documentView.infoGathering.sendChatMessage",
                "editChatMessage": "projectDesigner.documentView.infoGathering.editChatMessage",
                "deleteChatMessage": "projectDesigner.documentView.infoGathering.deleteChatMessage",
                "afterEditMessage": "projectDesigner.documentView.infoGathering.afterEditMessage",
                "editMessageSelected": "projectDesigner.documentView.infoGathering.editMessageSelected",
                "deleteMessageSelected": "projectDesigner.documentView.infoGathering.deleteMessageSelected",
                "pageNameUpdated": "projectDesigner.documentView.infoGathering.pageNameUpdated",
                "loadQuestionsAfterPageNameUpdation": "projectDesigner.documentView.infoGathering.loadQuestionsAfterPageNameUpdation",
                "reloadPageSection": "projectDesigner.documentView.infoGathering.reloadPageSection",
                "percentagecalculation": "projectDesigner.documentView.infoGathering.percentagecalculation",
            },
        },
        "iconicViewLibrarySection": {
            "enableIcon": "projectDesigner.iconicViewLibrarySection.enableIcon",
            "updateHeader": "projectDesigner.iconicViewLibrarySection.updateHeader",
            "loadLibrary": "projectDesigner.iconicViewLibrarySection.loadLibrary",
        },
        "appendixSection": {
            "loadAppendix": "projectDesigner.appendixSection.loadAppendix",
            "enableIcon": "projectDesigner.appendixSection.enableIcon"
        },
    },
    "notification": {
        "loadNotifications": "notification.loadNotifications",
        "Reload":"Reload",
        "AutoRefresh":"AutoRefresh"
    },
    "projectSetUp": {
        "auditTrail": {
            "auditTrailFilter": "projectSetUp.auditTrail.auditTrailFilter",
            "enableDisableIcons": "projectSetUp.auditTrail.enableDisableIcons",
            "loadAction": "projectSetUp.auditTrail.loadAction",
            "refreshPage": "projectSetUp.auditTrail.refreshPage"
        }
    },
     "adminModule": {
        "ApplyParagraphSpacing": "projectDesigner.documentView.ApplyParagraphSpacing",
        "insert": {
            "highlight_Pageborder": "adminModule.insert.highlight_Pageborder",
            "pageBreak": "adminModule.insert.pageBreak",
            "selectBlock_pagebreak": "adminModule.insert.selectBlock_pagebreak"
        }
    },
    "superAdmin": {
        "appUsers": {
            "addAppUser": "superAdmin.appUsers.addAppUser",
            "loadAppUsers": "superAdmin.appUsers.loadAppUsers",
            "uploadAppUser":"superAdmin.appUsers.uploadAppUser",
        },
    }
}

export const buttonClasses = [
    'btn-outline-primary',
    'btn-outline-secondary',
    'btn-outline-success',
    'btn-outline-danger',
    'btn-outline-warning',
    'btn-outline-info',
    'btn-outline-light',
    'btn-outline-dark',
];
