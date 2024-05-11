import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {
  @Input() treeData: any;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
  }
  common(data: any) {
    console.log(data);
  }
  processData(data: any) {
    if (data?.data?.length > 0) {
      const transformedData = data?.data.map((item:any) => ({
        key: item.key,
        id: item.id,
        title: item.title,
        expanded: item.expanded,
        expand: item.expand,
        expandable: item.expandable,
        childrenid: item.childrenid.map((childId:any, index:any) => ({
            id: childId,
            title: item.childrentitle[index],
            expanded: false,
            expand: false,
            expandable: true,
        }))
    }));
      this.treeData.nodes = transformedData
    }
    return data;
  }
}
