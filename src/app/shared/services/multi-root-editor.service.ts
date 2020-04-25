import { Injectable } from '@angular/core';
import MultirootEditor from '../../../assets/@ckeditor/ckeditor5-build-classic';
import { resolve } from 'url';
import { EventAggregatorService } from './event/event.service';
import { eventConstantsEnum } from '../../@models/common/eventConstants';
import { EditorFormatOptionsViewModel } from '../../@models/projectDesigner/common';
import { StorageService } from '../../@core/services/storage/storage.service';
import { TranslateService } from '@ngx-translate/core';



@Injectable({
    providedIn: 'root',
})
export class MultiRootEditorService {

    constructor(private _eventService: EventAggregatorService,
        private storageService: StorageService, private translate: TranslateService) {
    }

    isTrackChangesEnabled: boolean = true; // Mohammad to fix the issue on making true.

    createInstance(sourceElement, saveCallBack, currentUserId, users, trackChangesSuggesstions, commentThreads, hashTags, definedcolors, sideBarId, language) {
        if (this.isTrackChangesEnabled) {

            return MultirootEditor.createInstance(sourceElement, saveCallBack, hashTags, definedcolors, language).then(newEditor => {
                if (sideBarId) {
                    for (let i = 0; i < document.getElementsByClassName(sideBarId).length; i++) {
                        document.getElementsByClassName(sideBarId)[i].innerHTML = '';
                    }
                }

                const usersPlugin = newEditor.plugins.get('Users');
                for (const user of users) {
                    usersPlugin.addUser(user);
                }

                const trackChangesPlugin = newEditor.plugins.get('TrackChanges');
                for (const suggestion of trackChangesSuggesstions) {
                    trackChangesPlugin.addSuggestion(suggestion);
                }

                const commentsPlugin = newEditor.plugins.get('Comments');
                for (const commentThread of commentThreads) {
                    commentsPlugin.addCommentThread(commentThread);
                }

                usersPlugin.defineMe(currentUserId);

                const initialData = {};
                // Create initial data object containing data from all roots.
                for (const rootName of Object.keys(sourceElement)) {
                    initialData[rootName] = this.getDataFromElement(sourceElement[rootName])
                }

                newEditor.data.init(initialData);
                if (document.querySelector('#toolbar-menu'))
                    document.querySelector('#toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
                return newEditor;
            });
        }
        else {
            return MultirootEditor.create1(sourceElement, saveCallBack, hashTags, definedcolors, this.translate.currentLang).then(newEditor => {
                if (document.querySelector('#toolbar-menu'))
                    document.querySelector('#toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
                return newEditor;
            });
        }
    }

    getDataFromElement(el) {
        if (el != null) {
            if (el instanceof HTMLTextAreaElement) {
                return el.value;
            }
            return el.innerHTML;
        }
    }

    getLoggedInUserDetails() {
        let _userContext = JSON.parse(this.storageService.getItem("currentUser"));
        let loggedInUserDetails: any = {};
        loggedInUserDetails.id = _userContext.profile.email;
        loggedInUserDetails.name = _userContext.profile.given_name + ' ' + _userContext.profile.family_name;
        return loggedInUserDetails;
    }

    getAllUsersFromSuggestions(suggestions, users) {
        if (suggestions.length > 0) {
            suggestions.forEach(item => {
                let _user: any = {};
                _user.id = item.authorId;
                _user.name = item.name;
                if (users.filter(id => id.id == item.authorId).length == 0)
                    users.push(_user);
            });
        }
        return users;
    }

    getAllUsersFromCommentThreads(commmentThreads, users) {
        if (commmentThreads.length > 0) {
            commmentThreads.forEach(item => {
                item.comments.forEach(item1 => {
                    let _user: any = {};
                    _user.id = item1.authorId;
                    _user.name = item1.name;
                    if (users.filter(id => id.id == item1.authorId).length == 0)
                        users.push(_user);
                })
            });
        }
        return users;
    }

    //while saving document view with track changes and comments need to add blockId to track change or suggestion in order to add at block / content level.
    getTrackChangesAndComments(content, suggestionsData, commentThreadsData, suggestions, commentThreads, loggedInUserName, blockId) {
        if (this.isTrackChangesEnabled) {
            let payload: any = {};
            //region for saving track changes -- starts
            let _trackChangesSuggestion: any = [];
            suggestionsData.forEach(item => {
                let existingSuggestions = suggestions.filter(id => id.id == item.id);

                if (existingSuggestions.length > 0) {
                    item.name = existingSuggestions[0].name;
                    _trackChangesSuggestion.push(item);
                }
                else {
                    item.name = loggedInUserName;
                    if (content.indexOf(item.id) != -1) {
                        item.blockId = blockId;
                        _trackChangesSuggestion.push(item);
                    }
                }
            });

            payload.trackChanges = _trackChangesSuggestion.length > 0 ? JSON.stringify(_trackChangesSuggestion) : null;
            //region for saving track changes -- edns

            //region for saving comments -- starts
            let _commentTreads: any = [];
            commentThreadsData.forEach(item => {
                item.comments.forEach(subItem => {
                    if (commentThreads.length > 0) {
                        commentThreads.forEach(_comment => {
                            if (_comment.threadId == item.threadId) {
                                let existingComments = _comment.comments.filter(cid => cid.commentId == subItem.commentId);
                                if (existingComments.length > 0 && existingComments[0].name)
                                    subItem.name = existingComments[0].name;
                                else
                                    subItem.name = loggedInUserName;
                            }
                        })
                    }
                    else {
                        subItem.name = loggedInUserName;
                    }
                    subItem.blockId = blockId;
                });

                if ((item.threadId && content.indexOf(item.threadId) != -1) || (item.id && content.indexOf(item.id) != -1)) {
                    item.blockId = blockId;
                    _commentTreads.push(item);
                }
            });
            payload.comments = _commentTreads.length > 0 ? JSON.stringify(_commentTreads) : null;
            //region for saving comments --ends

            return payload;
        }
    }

    //while loading document view prepares the suggestion list and comments list with users in order to show on right side.
    setTrackChangesAndComments(currentBlock, suggestions, commentThreads, users) {
        let response = new EditorFormatOptionsViewModel();
        if (this.isTrackChangesEnabled) {
            if (currentBlock.trackChangesSuggestions != null)
                suggestions = [].concat(suggestions, JSON.parse(currentBlock.trackChangesSuggestions));

            if (currentBlock.commentThreads != null)
                commentThreads = [].concat(commentThreads, JSON.parse(currentBlock.commentThreads));

            if (currentBlock.titleTrackChanges != null)
                suggestions = [].concat(suggestions, JSON.parse(currentBlock.titleTrackChanges));

            if (currentBlock.titleCommentThreads != null)
                commentThreads = [].concat(commentThreads, JSON.parse(currentBlock.titleCommentThreads));

            if (currentBlock.footNotes.length > 0) {
                currentBlock.footNotes.forEach(footNote => {
                    if (footNote.footNotesTrackChanges != null)
                        suggestions = [].concat(suggestions, JSON.parse(footNote.footNotesTrackChanges));

                    if (footNote.footNotesCommentThreads != null)
                        commentThreads = [].concat(commentThreads, JSON.parse(footNote.footNotesCommentThreads));
                });
            }


            let showTrackChanges: boolean = false;
            if (suggestions.length > 0 || commentThreads.length > 0) {
                showTrackChanges = true;
            }
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableTrackChanges).publish(showTrackChanges);

            //get all users from the suggestion list
            this.getAllUsersFromSuggestions(suggestions, users);
            this.getAllUsersFromCommentThreads(commentThreads, users);

            response.suggestions = suggestions;
            response.commentThreads = commentThreads;
            response.users = users;
            return response;
        }
    }

    //compares the existing suggestion list with new one and update the new one when there is an change
    compareSuggestions(suggestions, newSuggestions, id) {
        let _newSuggestList = newSuggestions != null ? JSON.parse(newSuggestions) : [];
        suggestions = suggestions.filter(item => item.blockId != id);
        let _newSuggestions = _newSuggestList.filter(item => item.blockId == id);
        suggestions = [].concat(suggestions, _newSuggestions);
        return suggestions;
    }

    //compares the existing comments list with new one and update the new one when there is an change
    compareCommentThreads(commentThreads, newCommentThreads, id) {
        let _newCommentList = newCommentThreads != null ? JSON.parse(newCommentThreads) : [];
        commentThreads = commentThreads.filter(item => item.blockId != id);
        let _newComments = _newCommentList.filter(item => item.blockId == id);
        commentThreads = [].concat(commentThreads, _newComments);
        return commentThreads;
    }
}
