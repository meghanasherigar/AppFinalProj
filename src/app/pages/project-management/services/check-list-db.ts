import { BlockReportItemNode } from "../@models/blocks/block";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class TreeViewChecklistDatabase {
  dataChange = new BehaviorSubject<BlockReportItemNode[]>([]);

  get data(): BlockReportItemNode[] { return this.dataChange.value; }

  /** Add an item to to-do list */
  insertItem(parent: BlockReportItemNode, name: string): BlockReportItemNode {
    if (!parent.blocks) {
      parent.blocks = [];
    }
    const newItem = { title: name } as BlockReportItemNode;
    parent.blocks.push(newItem);
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemAbove(node: BlockReportItemNode, name: string): BlockReportItemNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = { title: name } as BlockReportItemNode;
    if (parentNode != null) {
      parentNode.blocks.splice(parentNode.blocks.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: BlockReportItemNode, name: string): BlockReportItemNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = { title: name } as BlockReportItemNode;
    if (parentNode != null) {
      parentNode.blocks.splice(parentNode.blocks.indexOf(node) + 1, 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  getParentFromNodes(node: BlockReportItemNode): BlockReportItemNode {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: BlockReportItemNode, node: BlockReportItemNode): BlockReportItemNode {
    if (currentRoot.blocks && currentRoot.blocks.length > 0) {
      for (let i = 0; i < currentRoot.blocks.length; ++i) {
        const child = currentRoot.blocks[i];
        if (child === node) {
          return currentRoot;
        } else if (child.blocks && child.blocks.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  updateItem(node: BlockReportItemNode, name: string) {
    node.title = name;
    this.dataChange.next(this.data);
  }

  deleteItem(node: BlockReportItemNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: BlockReportItemNode, to: BlockReportItemNode): BlockReportItemNode {
    const newItem = this.insertItem(to, from.title);
    if (from.blocks) {
      from.blocks.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: BlockReportItemNode, to: BlockReportItemNode): BlockReportItemNode {
    const newItem = this.insertItemAbove(to, from.title);
    if (from.blocks) {
      from.blocks.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: BlockReportItemNode, to: BlockReportItemNode): BlockReportItemNode {
    const newItem = this.insertItemBelow(to, from.title);
    if (from.blocks) {
      from.blocks.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  deleteNode(nodes: BlockReportItemNode[], nodeToDelete: BlockReportItemNode) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.blocks && node.blocks.length > 0) {
          this.deleteNode(node.blocks, nodeToDelete);
        }
      });
    }
  }
}