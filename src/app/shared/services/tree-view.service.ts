import { Injectable, Inject, Injector } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TreeviewI18n } from 'ngx-treeview';
import { TreeViewConstant } from '../../@models/common/eventConstants';
import { stringify } from 'querystring';
@Injectable({
    providedIn: 'root',
})

export class TreeViewService {

    static default: any = {};

    constructor(private translate: TranslateService) {
        TreeViewService.default = {};
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.setDefaultText();
        }); 
        this.setDefaultText();
    }

    static getText(selection, treeViewConstant): string {
        let defaultText = TreeViewService.getDefaultText(treeViewConstant);
        if (selection) {
            switch (selection.checkedItems.length) {
                case 0:
                    return defaultText
                case 1:
                    return selection.checkedItems[0].text;
                default:
                    return selection.checkedItems.length + " " + TreeViewService.default.opitonsSelected;
            }
        } else {
            return defaultText;
        }
    }

    setDefaultText() {
        TreeViewService.default.IndustryText = this.translate.instant('screens.Shared.TreeText.defaultIndustry');
        TreeViewService.default.TemplateText = this.translate.instant('screens.Shared.TreeText.templates');
        TreeViewService.default.DeliverableText = this.translate.instant('screens.Shared.TreeText.deliverables');
        TreeViewService.default.TemplateDeliverableText = this.translate.instant('screens.Shared.TreeText.templateDeliverables');
        TreeViewService.default.SelectText = this.translate.instant('screens.Shared.TreeText.select');
        TreeViewService.default.opitonsSelected = this.translate.instant('screens.Shared.TreeText.optionsSelected');
    }

    static getTemplateDeliverableText(selection, treeViewConstant): string {
        let defaultText = TreeViewService.getDefaultText(treeViewConstant);
        if (selection) {
            switch (selection.length) {
                case 0:
                    return defaultText
                case 1:
                    return selection[0].text;
                default:
                    return selection.length + " " + TreeViewService.default.opitonsSelected;
            }
        } else {
            return defaultText;
        }
    }

    static getDefaultText(treeViewConstant) {
        if (TreeViewConstant.defaultIndustry == treeViewConstant) {
            return TreeViewService.default.IndustryText;
        }
        if (TreeViewConstant.templateDeliverables == treeViewConstant) return TreeViewService.default.TemplateDeliverableText;
        if (TreeViewConstant.templates == treeViewConstant) return TreeViewService.default.TemplateText;
        if (TreeViewConstant.deliverables == treeViewConstant) return TreeViewService.default.DeliverableText;
        if (TreeViewConstant.select == treeViewConstant) return TreeViewService.default.SelectText;
    }
}
