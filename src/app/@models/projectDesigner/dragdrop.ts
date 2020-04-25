
/**
 * Node for to-do item
 */
export class TodoItemNode {
    id: string;
    level: number;
    previousId: string;
    blockId: string;
    parentId: string;
    isStack: boolean;
    isRemoved: boolean;
    title: string;
    description: string;
    blocks: TodoItemNode[];
    hasChildren: boolean;
  }
  
  /** Flat to-do item node with expandable and level information */
  export class TodoItemFlatNode {
    id: string;
    blockId: string;
    item: string;
    previousId: string;
    level: number;
    expandable: boolean;
    isStack: boolean;
    description: string;
    parentId: string;
    nodeIndex: number;
    uId:string;
  }

// /**
//  * Node for to-do item
//  */
// export class TodoItemNode {
//     children: TodoItemNode[];
//     item: string;
//   }
  
//   /** Flat to-do item node with expandable and level information */
//   export class TodoItemFlatNode {
//     item: string;
//     level: number;
//     expandable: boolean;
//   }