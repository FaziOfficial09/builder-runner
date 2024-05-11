import { Component, Input, OnInit } from '@angular/core';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'st-builder-menu',
  templateUrl: './builder-menu.component.html',
  styleUrls: ['./builder-menu.component.scss']
})
export class BuilderMenuComponent implements OnInit {
  @Input() data: any;
  hoverActiveShow: any;
  isActiveShow: any;
  menuData: any[] = [];
  isCollapsed = false;
  ngOnInit(): void {
    this._dataSharedService.isMenuCollapsed = this.isCollapsed;
    document.documentElement.style.setProperty('--dynamic-menu-hover-color', this.data['hoverBgColor']);

  }
  constructor(private socketService: SocketService,
    private _dataSharedService: DataSharedService) {
    this.processData = this.processData.bind(this);
  }
  processData(data: any) {
    const icons = this.data.options;
    if (data?.data?.length > 0) {
      let children: any = [];
      let getNextNode = this.data['appConfigurableEvent'].find((a: any) => a.level == 0);
      if (getNextNode)
        children = [{
          id: 1,
          title: 'demo',
          icon: icons?.[1] ? icons?.[1]?.icon : 'home',
          children: []
        }]
      const transformedData = data?.data.map((item: any) => (
        {
          ...item,
          id: item.id,
          title: item.name,
          level: 0,
          expandable: true,
          icon: icons?.[0] ? icons?.[0]?.icon : 'home',
          children: children
        }));
      this.menuData = transformedData;
    }
    return data;
  }
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
    this._dataSharedService.isMenuCollapsed = this.isCollapsed;

  }
  menuClickChild(value: any) {
    const { event, menu } = value;
    this.menuClick(event, menu)
  }
  menuClick(event: MouseEvent, menu: any) {
    this.isActiveShow = menu.id;
    this.loadChildren(menu);
    this.modelBind(menu);
    event.stopPropagation();
  }
  subClick(event: MouseEvent, menu: any) {
    event.stopPropagation();
    if (menu.children?.[0]?.title == 'demo') {
      // menu.children = [];
      this.loadChildren(menu);
    }
    this.modelBind(menu);
  }
  modelBind(node: any) {
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
  }
  subClickEmit(value: any) {
    const { event, menu } = value;
    this.subClick(event, menu)
  }

  loadChildren(node: any) {
    const icons = this.data.options;
    let getComponentTargetId = this.data['appConfigurableEvent'].find((a: any) => a.level == node.level && a.targetid != '' && a.targetid != 'null');
    if (getComponentTargetId) {
      const event = {
        component: getComponentTargetId,
        value: node.id,
        data:this.data,
      }
      this._dataSharedService.gridLoadById.next(event);
      // return;
    }

    let getNextNode = this.data['appConfigurableEvent'].find((a: any) => a.level == node.level && (a.targetid == '' || a.targetid == 'null' || a.targetid == undefined));
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
          let children: any = [];
          let getNextNode = this.data['appConfigurableEvent'].find((a: any) => a.level == (node.level + 1) && (a.targetid == '' || a.targetid == 'null'));
          if (getNextNode)
            children = [{
              id: 1,
              title: 'demo',
              icon: icons?.[1] ? icons?.[1]?.icon : 'home',
              children: []
            }]
          const transformedData = res.data.map((item: any) => ({
            ...item,
            id: item.id,
            title: item.name,
            level: node.level + 1,
            expandable: true,
            icon: icons?.[node.level + 1] ? icons?.[node.level + 1]?.icon : "appstore"
          }));
          if (getNextNode) {
            const updatedData = transformedData?.map((item: any) => ({
              ...item,
              children: children
            }));
            node['children'] = updatedData
          } else
            node.children = transformedData;
        }
      },
      error: (err) => {
        node.children = [];
        console.error(err);
      }
    })
  }

}
