import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl, TreeControl } from '@angular/cdk/tree';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable, merge, of } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'st-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent {
  @Input() treeListData: any;
  selectedNodes = '';
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  dataSource: any;

  constructor(private socketService: SocketService, public _dataSharedService: DataSharedService,) {
    this.processData = this.processData.bind(this);
  }
  ngOnInit() {
    this.dataSource = new DynamicDatasource(this.treeControl, this.treeListData.nodes, this.treeListData, this.socketService, this._dataSharedService);
  }
  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  selectedNode(node: any) {
    debugger

    this.selectedNodes = node.id;
    if (node) {
      const newData: any = [];
      Object.keys(node).forEach(key => {
        if (key.includes('.')) {
          newData.push(
            { key: key, value: node[key] }
          );
        }
      });
      if (newData.length > 0)
        this._dataSharedService.makeModel.next(newData);
    }

    let getComponentTargetId = this.treeListData['appConfigurableEvent'].find((a: any) => a.level == node.level && a.targetid != '');
    if (getComponentTargetId) {
      const event = {
        component: this.treeListData,
        value: node.id
      }
      this._dataSharedService.gridLoadById.next(event);
      return;
    }

    let getNextNode = this.treeListData['appConfigurableEvent'].find((a: any) => a.level == node.level);
    if (!getNextNode)
      return;

  }
  processData(data: any) {
    if (data?.data?.length > 0) {
      const transformedData = data?.data.map((item: any) => ({
        ...item,
        id: item.id,
        label: item.name,
        level: 0,
        expandable: true
      }));
      this.dataSource = new DynamicDatasource(this.treeControl, transformedData, this.treeListData, this.socketService, this._dataSharedService);
    }
    return data;
  }
}


interface FlatNode {
  expandable: boolean;
  id: number;
  label: string;
  level: number;
  loading?: boolean;
}

class DynamicDatasource implements DataSource<FlatNode> {
  private flattenedData: BehaviorSubject<FlatNode[]>;
  private childrenLoadedSet = new Set<FlatNode>();

  constructor(
    private treeControl: TreeControl<FlatNode>,
    initData: FlatNode[],
    private treeListData: any,
    private socketService: SocketService,
    public _dataSharedService: DataSharedService
  ) {
    this.flattenedData = new BehaviorSubject<FlatNode[]>(initData);
    treeControl.dataNodes = initData;
  }

  connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    const changes = [
      collectionViewer.viewChange,
      this.treeControl.expansionModel.changed.pipe(tap(change => this.handleExpansionChange(change))),
      this.flattenedData.asObservable()
    ];
    return merge(...changes).pipe(map(() => this.expandFlattenedNodes(this.flattenedData.getValue())));
  }

  expandFlattenedNodes(nodes: FlatNode[]): FlatNode[] {
    const treeControl = this.treeControl;
    const results: FlatNode[] = [];
    const currentExpand: boolean[] = [];
    currentExpand[0] = true;

    nodes.forEach(node => {
      let expand = true;
      for (let i = 0; i <= treeControl.getLevel(node); i++) {
        expand = expand && currentExpand[i];
      }
      if (expand) {
        results.push(node);
      }
      if (treeControl.isExpandable(node)) {
        currentExpand[treeControl.getLevel(node) + 1] = treeControl.isExpanded(node);
      }
    });
    return results;
  }

  handleExpansionChange(change: SelectionChange<FlatNode>): void {
    if (change.added) {
      change.added.forEach(node => this.loadChildren(node));
    }
  }

  loadChildren(node: any): void {
    if (node) {
      const newData: any = [];
      Object.keys(node).forEach(key => {
        if (key.includes('.')) {
          newData.push(
            { key: key, value: node[key] }
          );
        }
      });
      if (newData.length > 0)
        this._dataSharedService.makeModel.next(newData);
    }

    if (this.childrenLoadedSet.has(node)) {
      return;
    }

    let getComponentTargetId = this.treeListData['appConfigurableEvent'].find((a: any) => a.level == node.level && a.targetid != '' && a.targetid != 'null');
    if (getComponentTargetId) {
      const event = {
        component: this.treeListData,
        value: node.id
      }
      this._dataSharedService.gridLoadById.next(event);
      return;
    }

    let getNextNode = this.treeListData['appConfigurableEvent'].find((a: any) => a.level == node.level);
    if (!getNextNode)
      return;

    node.loading = true;
    const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', getNextNode.id, node.id);
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res) => {
        // this.dataSharedService.queryId = '';
        if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          node.loading = false;
          const flattenedData = this.flattenedData.getValue();
          const index = flattenedData.indexOf(node);
          const transformedData = res.data.map((item: any) => ({
            ...item,
            id: item.id,
            label: item.name,
            level: node.level + 1,
            expandable: true
          }));
          if (index !== -1) {
            flattenedData.splice(index + 1, 0, ...transformedData);
            this.childrenLoadedSet.add(node);
          }
          this.flattenedData.next(flattenedData);
        }
      },
      error: (err) => {
        console.error(err);
        // this.toastr.error("An error occurred in mapping", { nzDuration: 3000 });
      }
    })
  }

  disconnect(): void {
    this.flattenedData.complete();
  }
}
