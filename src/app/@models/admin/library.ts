export const libraryActions = 
{
    "CreateQuestion" : "CreateQuestion",
    "toggleCreateQuestion": "toggleCreateQuestion",
    "Watermark": "Watermark",
    "PageColor": "PageColor",
    "Orientation":"Orientation",
    "PageSize" : "PageSize",
    "Header": "Header",
    "Footer":"Footer",
    "headerSection":"headerSection",
    "footerSection": "footerSection"

}
export const definedColors = [
        {
            color: 'rgb(0,0,0)',
            label: 'Black - rgb(0,0,0) '
        },
        {
            color: 'rgb(255, 255, 255)',
            label: 'White - rgb(255, 255, 255)',
            hasBorder: true
        },

        {
            color: 'rgb(255,0,0)',
            label: 'Red - rgb(255,0,0)'
        },
        {
            color: 'rgb(0,255,0)',
            label: 'Lime - rgb(0,255,0)'
        },
        {
            color: 'rgb(0,0,255)',
            label: 'Blue - rgb(0,0,255)'
        },
        {
            color: 'rgb(255,255,0)',
            label: 'Yellow - rgb(255,255,0)'
        },
        {
            color: 'rgb(0,255,255)',
            label: 'Cyan / Aqua - rgb(0,255,255)'
        },
        {
            color: 'rgb(255,0,255)',
            label: 'Magenta / Fuchsia - rgb(255,0,255)'
        },
        {
            color: 'rgb(192,192,192)',
            label: 'Silver - rgb(192,192,192)'
        },
        {
            color: 'rgb(128,128,128)',
            label: 'Grey - rgb(128,128,128)'
        },
        {
            color: 'rgb(128,0,0)',
            label: 'Maroon - rgb(128,0,0)'
        },
        {
            color: 'rgb(128,128,0)',
            label: 'Olive - rgb(128,128,0)'
        },
        {
            color: 'rgb(0,128,0)',
            label: 'Green - rgb(0,128,0)'
        },
        {
            color: 'rgb(128,0,128)',
            label: 'Purple - rgb(128,0,128)'
        },
        {
            color: 'rgb(0,128,128)',
            label: 'Teal - rgb(0,128,128)'
        },
        {
            color: 'rgb(0,0,128)',
            label: 'Navy - rgb(0,0,128)'
        }
    ]
export class libraryBlocksModel
{
    blockSelectCount: any;
    isStack: boolean;
    isCategory: boolean;
}
export class OECDOrganizationViewModel{
    projectId : string;
    oecdCountryTemplateId: string;
    oecdGlobalTemplateId: string;
}