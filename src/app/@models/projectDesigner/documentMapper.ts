export class DocumentMapperModel {
    title: string;
    blockId: string;
    indentation: string;
    indentationLevel: number;
    documentTitle: string;
    footNotes: any = [];
    content: string;
    isStack: boolean;
    isLoaded: boolean;
    isReference: boolean;
    isAppendixBlock: boolean;
    uId: string;
    isLocked: boolean;
    isPageBreak: string;
    trackChangesSuggestions: string = null;
    titleTrackChanges: string = null;
    titleCommentThreads: string = null;
    commentThreads: string = null;
    titleFormatApplied : boolean;
    contentFormatApplied : boolean;
}