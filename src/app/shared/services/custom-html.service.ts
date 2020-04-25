import { Injectable } from '@angular/core';
import { EditorInfo } from '../../@models/projectDesigner/common';



@Injectable({
    providedIn: 'root',
})
export class CustomHTML {

    constructor() {
    }
    groupBy(list, item) {
        return list.reduce((r, v, i, a, k = item(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
    }

    querySelectorAll(nodeList, className) {
        var i, results = [];
        for (i = 0; i < nodeList.length; i++) {
            if ((" " + nodeList[i].className + " ").indexOf(" " + className + " ") > -1) {
                results.push(nodeList[i]);
            }
        }
        return results;
    }

    //method to get the resized width of ckeidtor multi root table
    multiRootEditorGetResizedWidth(id, content) {
        var emptyDivContainer = document.createElement('div');
        emptyDivContainer.innerHTML = content;

        if (document.querySelector('[aria-label*="' + id + '"]')) {
            for (let index = 0; index < document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure').length; index++) {
                if (document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure')[index].getElementsByTagName('table').length > 0) {
                    let ths = emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('th');

                    if (document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure')[index].getElementsByTagName('table').length > 0) {
                        for (let thIndex = 0; thIndex < ths.length; thIndex++) {
                            document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('th')[thIndex].style.width =
                                emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('th')[thIndex].style.width
                        }
                    }

                    let tds = emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('td');

                    if (document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure')[index].getElementsByTagName('table').length > 0) {
                        for (let tdIndex = 0; tdIndex < tds.length; tdIndex++) {
                            document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('td')[tdIndex].style.width =
                                emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('td')[tdIndex].style.width
                        }
                    }
                }
            }
        }
    }

    multiRootEditorSetResizedWidth(id, content) {
        //section to capture the resized table width for saving -- starts
        var emptyDivContainer = document.createElement('div');
        emptyDivContainer.innerHTML = content;

        for (let index = 0; index < emptyDivContainer.getElementsByTagName('figure').length; index++) {
            if (emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table').length > 0) {
                emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].style.borderCollapse = "collapse";
                let ths = emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('th');

                if (document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure')[index].getElementsByTagName('table').length > 0) {
                    for (let thIndex = 0; thIndex < ths.length; thIndex++) {
                        emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('th')[thIndex].style.border = "1px solid black";
                        emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('th')[thIndex].style.width =
                            document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('th')[thIndex].style.width;
                    }
                }

                let tds = emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('td');

                if (document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure')[index].getElementsByTagName('table').length > 0) {
                    for (let tdIndex = 0; tdIndex < tds.length; tdIndex++) {
                        emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('td')[tdIndex].style.border = "1px solid black";
                        emptyDivContainer.getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('td')[tdIndex].style.width =
                            document.querySelector('[aria-label*="' + id + '"]').getElementsByTagName('figure')[index].getElementsByTagName('table')[0].getElementsByTagName('td')[tdIndex].style.width;
                    }
                }
            }
        }

        return emptyDivContainer.innerHTML;
    }

    addEditorIdOnCommentTrackChangesModification(editordata, suggestions, commentThreads, suggestionsData, commentThreadsData) {
        let blockIdsModified = [];

        //section to check if any modifications done only in track changes and comments -- starts
        if (suggestionsData.length != suggestions.length) {
            if (suggestionsData.length == 0) {
                suggestions.forEach(item => { if (blockIdsModified.filter(id => id != item.blockId).length == 0) blockIdsModified.push(item.blockId) });
            }
            else {
                let result = this.filterListByAnotherList(suggestions, suggestionsData, "id", "blockId", false);
                if (result.length > 0)
                    result.forEach(item => { if (blockIdsModified.filter(id => id != item).length == 0) blockIdsModified.push(item) });
            }
        }

        suggestionsData.forEach(item => {
            let result = suggestions.filter(item1 => item1.id == item.id && item1.hasComments != item.hasComments);
            if (result.length > 0 && blockIdsModified.filter(id => id != result[0].blockId).length == 0)
                blockIdsModified.push(result[0].blockId)
        })

        //section to check if any modifications done only in track changes and comments -- ends

        //section when there is an change like deleting a complete comment thread -- starts
        if (commentThreadsData.length != commentThreads.length) {
            if (commentThreadsData.length == 0) {
                commentThreads.forEach(item => { if (blockIdsModified.filter(id => id != item.blockId).length == 0) blockIdsModified.push(item.blockId) });
            }
            else {
                let result = this.filterListByAnotherList(commentThreads, commentThreadsData, "threadId", "blockId", false);
                if (result.length > 0)
                    result.forEach(item => { if (blockIdsModified.filter(id => id != item).length == 0) blockIdsModified.push(item) });
            }
        }
        //section when there is an change like deleting a complete comment thread -- ends

        //section when there is an any reply comment for an existing comment thread -- starts
        let _oldComments: any = [];
        let _newComments: any = [];
        commentThreadsData.forEach(item => {
            let existingComments = commentThreads.filter(item1 => item1.threadId == item.threadId);
            if (existingComments.length > 0) {
                item.comments.forEach(item => item.blockId = existingComments[0].blockId);
            }
            _newComments = [].concat(_newComments, item.comments)
        });
        commentThreads.forEach(item => _oldComments = [].concat(_oldComments, item.comments));

        if (_oldComments.length != _newComments.length) {
            let result = this.filterListByAnotherList(_oldComments, _newComments, "commentId", "blockId", false);
            if (result.length > 0)
                result.forEach(item => { if (blockIdsModified.filter(id => id != item).length == 0) blockIdsModified.push(item) });

            result = this.filterListByAnotherList(_newComments, _oldComments, "commentId", "blockId", false);
            if (result.length > 0)
                result.forEach(item => { if (item && blockIdsModified.filter(id => id != item).length == 0) blockIdsModified.push(item) });
        }
        //section when there is an any reply comment for an existing comment thread -- ends

        if (blockIdsModified.length > 0) {
            blockIdsModified.forEach(item => {
                let editors = document.querySelectorAll('[aria-label*="' + item + '"]');
                editors.forEach(data => {
                    var objRoot = new EditorInfo();
                    let item = data.getAttribute('aria-label');
                    var rootname = item.split(", ");
                    if (rootname.length == 2) {
                        objRoot.rootName = rootname[1];
                        if (editordata.filter(id => id.rootName.trim() == objRoot.rootName.trim()).length == 0)
                            editordata.push(objRoot);
                    }
                });

            })
        }
    }


    //method to filter two array objects
    filterListByAnotherList(list1, list2, property, resultProperty, isEquals) {
        let result = [];
        if (!isEquals) {
            list1.forEach(item => {
                if (list2.filter(item1 => item1[property] == item[property]).length == 0)
                    result.push(item[resultProperty]);
            })
        }
        return result;
    }
}
