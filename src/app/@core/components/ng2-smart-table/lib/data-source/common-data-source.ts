import { LocalDataSource } from './local/local.data-source';

export class CommonDataSource extends LocalDataSource {
     
    constructor(data: Array<any> = []) {
        super();
    
        this.data = data;
      }
    

     prepareData(data: Array<any>): Array<any> {
        data = super.filter(data);
        this.filteredAndSorted = data.slice(0);
        return super.paginate(data);
      }
}