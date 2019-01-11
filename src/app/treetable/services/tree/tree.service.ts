import { Injectable } from '@angular/core';
import { Node, NodeInTree } from '../../models';
import * as _ from 'lodash';
import { Option, some, none } from 'fp-ts/lib/Option';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  traverse<T>(root: Node<T>, f: (node: Node<T>) => void): void {
    this._traverse(root, (node: Node<T>) => {
      f(node);
      return true;
    });
  }

  searchById<T>(root: Node<T>, id: string): Option<NodeInTree<T>> {
    let matchingNode: Node<T>;
    const pathToRoot: {[k: string]: Node<T>} = {};
    this._traverse(root, (node: Node<T>) => {
      node.children.forEach(child => {
        pathToRoot[child.id] = node;
      });
      if (node.id === id) {
        matchingNode = node;
      }
      return node.id !== id;
    });
    return matchingNode ? some({
      ...matchingNode,
      pathToRoot: this.buildPath(id, pathToRoot)
    }) : none;
  }

  private _traverse<T>(root: Node<T>, f: (node: Node<T>) => boolean): void {
    if (!f(root)) {
      return;
    }
    root.children.forEach(c => this._traverse(c, f));
  }

  getNodeDepth<T>(root: Node<T>, node: Node<T>): number {
    return this.searchById(root, node.id).fold(-1, n => n.pathToRoot.length);
  }

  flatten<T>(root: Node<T>): Node<T>[] {
    const result = [_.cloneDeep(root)];
    for (let i = 0; i < result.length; i++) {
      const node = result[i];
      if (node.children) {
        result.splice(result.indexOf(node) + 1, 0, ...node.children);
      }
    }
    return result;
  }

  private buildPath<T>(id: string, pathMap: {[k: string]: Node<T>}): Node<T>[] {
    const pathToRoot = [];
    let key = id;
    while (key) {
      if (pathMap[key]) {
        pathToRoot.push(pathMap[key]);
        key = pathMap[key].id;
      } else {
        key = null;
      }
    }
    return pathToRoot;
  }

}