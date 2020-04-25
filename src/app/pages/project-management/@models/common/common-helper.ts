import { fileExtensions } from '../Project-Management-Constants';

export function downloadFile(data, fileName) {
    try {
        const buffer:any= convertbase64toArrayBuffer(data);
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        }
        else {
            let a = document.createElement("a");
            document.body.appendChild(a);
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
        }
    }
    catch(err)
    {
        console.error(err);
        console.error(`Error while downloading file`);
    }
}


export function downloadFileFromTask(data, fileName) {
    try {

        const lastINdex = fileName.lastIndexOf('.');
        const filetype = getFileContentType(fileName.substr(lastINdex, fileName.length));
        const blob = new Blob([data], { type: filetype });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        }
        else {
            let a = document.createElement("a");
            document.body.appendChild(a);
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
        }
    }
    catch(err)
    {
        console.error(err);
        console.error(`Error while downloading file`);
    }
}

function getFileContentType(extension): string {
    let fileType
    switch (extension) {  
        case fileExtensions.PDF:
            fileType = 'application/pdf'
        break;
        case fileExtensions.ZIP:
            fileType = 'application/zip'
        break;
        case fileExtensions.DOC:
            fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break;
        case fileExtensions.EXCEL:
            fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break;
        default:
            fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }
    
    return fileType
}


export function convertbase64toArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
