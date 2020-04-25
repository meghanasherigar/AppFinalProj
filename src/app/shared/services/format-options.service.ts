import { Injectable } from '@angular/core';
import { EditorInfo } from '../../@models/projectDesigner/common';
import { Alignment, FormatOptions, Underline, StyleOn } from '../../@models/projectDesigner/formatStyle';
import { LineSpaceRule, ParagraphSpacing } from '../../@models/projectDesigner/block';



@Injectable({
    providedIn: 'root',
})
export class FormatStylingOptions {

    constructor() {
    }

    removeHtmlTagByName(data, tagName) {
        var match = new RegExp(tagName, "ig");
        data.innerHTML = data.innerHTML.replace(match, "");
    }

    applyStyle(selectedLayoutStyle) {
        let alignment: any = Alignment;
        let underline: any = Underline;
        selectedLayoutStyle.styles.forEach(style => {
            let formattedStyleProperty: any = {};
            for (var i = 0; i < Object.keys(style.properties).length; i++) {
                if (Object.values(style.properties)[i] == null) continue;
                if (Object.keys(style.properties)[i] == FormatOptions.fontFamily)
                    formattedStyleProperty["font-family"] = Object.values(style.properties)[i].toString().split(',')[0];
                if (Object.keys(style.properties)[i] == FormatOptions.fontSize && parseInt(Object.values(style.properties)[i].toString()) != 0)
                    formattedStyleProperty["font-size"] = parseInt(Object.values(style.properties)[i].toString()) + "px";
                if (Object.keys(style.properties)[i] == FormatOptions.fontColor && Object.values(style.properties)[i] != null)
                    formattedStyleProperty["color"] = "rgb(" + Object.values(style.properties)[i]["r"] + ", " + Object.values(style.properties)[i]["g"] + ", " + Object.values(style.properties)[i]["b"] + ")";
                if (Object.keys(style.properties)[i] == FormatOptions.fontBackgroundColor && Object.values(style.properties)[i] != null)
                    formattedStyleProperty["background-color"] = "rgb(" + Object.values(style.properties)[i]["r"] + ", " + Object.values(style.properties)[i]["g"] + ", " + Object.values(style.properties)[i]["b"] + ")";
                if (Object.keys(style.properties)[i] == FormatOptions.bold && Object.values(style.properties)[i] == true)
                    formattedStyleProperty["font-weight"] = 600;
                if (Object.keys(style.properties)[i] == FormatOptions.italic && Object.values(style.properties)[i] == true)
                    formattedStyleProperty["font-style"] = "italic";
                if (Object.keys(style.properties)[i] == FormatOptions.underline)
                    formattedStyleProperty["text-decoration"] = underline[parseInt(Object.values(style.properties)[i].toString())];;
                if (Object.keys(style.properties)[i] == FormatOptions.alignment)
                    formattedStyleProperty["text-align"] = alignment[parseInt(Object.values(style.properties)[i].toString())];;
            }
            style.formattedStyleProperty = formattedStyleProperty;
        });
        return selectedLayoutStyle;
    }

    translateHTML(content, layoutStyle, styleOn, isIndentation = false) {
        let style = layoutStyle.styles.filter(item => item.styleOn == styleOn)[0];
        let tagsTobeRemoved = "<strong>|</strong>|<i>|</i>|<u>|</u>";
        let element = document.createElement('div');
        element.innerHTML = content;
        var match = new RegExp(tagsTobeRemoved, "ig");
        element.innerHTML = element.innerHTML.replace(match, "");

        //create p tag for title if no formatting is being applied
        if ((style.styleOn != StyleOn.Body && style.styleOn != StyleOn.Bullet && element.querySelectorAll('p').length == 0)) {
            let paragraph = document.createElement('p');
            paragraph.innerHTML = element.innerHTML;
            element.innerHTML = paragraph.outerHTML;
        }

        this.translate('p', element, style, isIndentation);
        this.translate('th', element, style);
        this.translate('td', element, style);

        let bulletstyle = layoutStyle.styles.filter(item => item.styleOn == StyleOn.Bullet)[0];
        this.translate('li', element, bulletstyle);

        return element.innerHTML;
    }

    translate(tagName, element, style, isIndentation = false) {
        let alignment: any = Alignment;

        element.querySelectorAll(tagName).forEach(item => {
            let spel = document.createElement('span');
            spel.innerHTML = item.innerHTML;
            item.innerHTML = spel.outerHTML;
            item.querySelectorAll('span').forEach(spanitem => {
                spanitem["style"].color = style.properties.color != null ? "rgb(" + style.properties.color['r'] + "," + style.properties.color['g'] + "," + style.properties.color['b'] + ")" : 'black';
                spanitem["style"].backgroundColor = style.properties.highlightColor != null ? "rgb(" + style.properties.highlightColor['r'] + "," + style.properties.highlightColor['g'] + "," + style.properties.highlightColor['b'] + ")" : 'transparent';
                spanitem["style"].fontFamily = style.properties.fontName;
                spanitem["style"].fontWeight = style.properties.bold ? 'bold' : 'normal';
                spanitem["style"].fontStyle = style.properties.italic ? 'italic' : 'normal';
                spanitem["style"].textDecoration = style.properties.underline == Underline.Single ? 'underline' : 'none';
                spanitem["style"].fontSize = (style.properties.fontSize && style.properties.fontSize != 0) ? style.properties.fontSize + 'px' : '';
            });
            item["style"].textAlign = alignment[style.properties.alignment];

            if (style.properties.paragraphSpacing && style.properties.paragraphSpacing != null) {
                item["style"].marginTop =  style.properties.paragraphSpacing.spaceBefore ? style.properties.paragraphSpacing.spaceBefore + 'pt' : '';
                item["style"].marginBottom = style.properties.paragraphSpacing.spaceAfter?  style.properties.paragraphSpacing.spaceAfter + 'pt' : '';
                item["style"].marginLeft = style.properties.paragraphSpacing.leftIndentation ? style.properties.paragraphSpacing.leftIndentation + 'cm' : '';
                item["style"].marginRight = style.properties.paragraphSpacing.rightIndentation ? style.properties.paragraphSpacing.rightIndentation + 'cm' : '';

                if (style.properties.paragraphSpacing.lineSpacingRule) {
                    if (style.properties.paragraphSpacing.lineSpacingRule == LineSpaceRule.Exactly)
                        item["style"].lineHeight = ParagraphSpacing.ExactlyValue;
                    if (style.properties.paragraphSpacing.lineSpacingRule == LineSpaceRule.Multiple)
                        item["style"].lineHeight = style.properties.paragraphSpacing.lineSpacing * ParagraphSpacing.MultipleValue + 'em';
                }
                else
                    item["style"].lineHeight = '';
            }
            else {
                item["style"].marginTop = '';
                item["style"].marginLeft = '';
                item["style"].marginRight = '';
                item["style"].marginBottom = '';
                item["style"].lineHeight = '';
            }

            if(isIndentation && item["style"].marginTop == '') item["style"].marginTop = '13px';
        });
    }

    setLayoutStyleForEmptyContent(editor, layoutStyle) {
        if (!layoutStyle) return false;
        let alignment: any = Alignment;
        let style = layoutStyle.styles.filter(item => item.styleOn == StyleOn.Body)[0];
        if (style.properties.bold) editor.execute('bold', true);
        if (style.properties.italic) editor.execute('italic', true);
        if (style.properties.underline == Underline.Single) editor.execute('underline', true);
        if (style.properties.fontSize != "" && style.properties.fontSize != null) editor.execute('fontSize', { value: style.properties.fontSize });
        if (style.properties.fontName != "" && style.properties.fontName != null) editor.execute('fontFamily', { value: style.properties.fontName });
        if (style.properties.color != null) editor.execute('fontColor', { value: "rgb(" + style.properties.color['r'] + "," + style.properties.color['g'] + "," + style.properties.color['b'] + ")" });
        if (style.properties.highlightColor != null) editor.execute('fontBackgroundColor', { value: "rgb(" + style.properties.highlightColor['r'] + "," + style.properties.highlightColor['g'] + "," + style.properties.highlightColor['b'] + ")" });
        editor.execute('alignment', { value: alignment[style.properties.alignment] });
    }
}
