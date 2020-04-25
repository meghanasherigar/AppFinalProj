import { Injectable } from '@angular/core';
import { DocumentMapperModel } from '../../@models/projectDesigner/documentMapper';



@Injectable({
    providedIn: 'root',
})
export class DocumentMapper {

    constructor() {
    }

    documentMapper(item: DocumentMapperModel, itemToMap) {
        this.mapContent(item, itemToMap);
        this.mapTitle(item, itemToMap);
        this.mapTrackChanges(item, itemToMap);
        this.mapComments(item, itemToMap);
        this.mapFootNotes(item, itemToMap);
    }

    private mapContent(item: DocumentMapperModel, itemToMap) {
        if (itemToMap.content) {
            item.content = itemToMap.content;
            item.contentFormatApplied = itemToMap.contentFormatApplied;
        }
    }

    private mapTitle(item: DocumentMapperModel, itemToMap) {
        if (itemToMap.title)
            item.title = itemToMap.title;

        if (itemToMap.documentTitle) {
            item.documentTitle = itemToMap.documentTitle;
            item.titleFormatApplied = itemToMap.titleFormatApplied;
        }
    }

    private mapTrackChanges(item: DocumentMapperModel, itemToMap) {
        if (itemToMap.trackChangesSuggestions && itemToMap.trackChangesSuggestions != "")
            item.trackChangesSuggestions = itemToMap.trackChangesSuggestions;
        else
            item.trackChangesSuggestions = null;

        if (itemToMap.titleTrackChanges && itemToMap.titleTrackChanges != "")
            item.titleTrackChanges = itemToMap.titleTrackChanges;
        else
            item.titleTrackChanges = null;
    }

    private mapComments(item: DocumentMapperModel, itemToMap) {
        if (itemToMap.commentThreads && itemToMap.commentThreads != "")
            item.commentThreads = itemToMap.commentThreads;
        else
            item.commentThreads = null;

        if (itemToMap.titleCommentThreads && itemToMap.titleCommentThreads != "")
            item.titleCommentThreads = itemToMap.titleCommentThreads;
        else
            item.titleCommentThreads = null;
    }

    private mapFootNotes(item: DocumentMapperModel, itemToMap) {
        if (itemToMap.footNotes)
            item.footNotes = itemToMap.footNotes;
    }
}
