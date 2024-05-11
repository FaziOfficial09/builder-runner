import { Component, Input, OnInit } from '@angular/core';
import { List, ListInterface } from '../../model/list/list.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'st-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  @Input() mappingId: any;
  @Input() kanbanData: any;
  lists: ListInterface[];
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  status: any = [];
  originalKanbanData: any;
  loader: boolean = false;
  dropListIndex: any;
  requestSubscription: Subscription;
  constructor(private toastr: NzMessageService, public dataSharedService: DataSharedService, private socketService: SocketService) {
    this.processData = this.processData.bind(this);
  }

  ngOnInit() {
    if (this.kanbanData?.eventActionconfig && Object.keys(this.kanbanData.eventActionconfig).length > 0) {
      this.loader = true
    } else {
      this.loader = false
    }
    this.originalKanbanData = JSON.parse(JSON.stringify(this.kanbanData))
    this.lists = this.kanbanData.kanbanSave;

    // Assuming this.kanbanData?.id is a string
    const localStorageKey = this.kanbanData?.id + '_status';
    const storedStatus = localStorage.getItem(localStorageKey);

    // Check if storedStatus is not null before parsing
    if (storedStatus !== null) {
      this.status = JSON.parse(storedStatus);
    } else {
      this.status = this.status;
    }

    this.selectedGroupBy = localStorage.getItem(this.kanbanData?.id + '_groupBy') || 'status';
  }

  addList() {

    if (this.lists === undefined) {
      this.lists = [];
    }
    const newList: ListInterface = new List();
    // newList.position = this.lists.length + 1;
    // newList.name = `List (${newList.position})`;

    this.lists.push(newList);
    this.toastr.success('Board add!', { nzDuration: 3000 });
  }

  // moveCardAcrossList(movementInformation: MovementIntf) {
  //   if (this.kanbanData.kanlistArray.some((item: any) => item.key == this.selectedGroupBy && !item?.allowDragnDrop)) {
  //     this.toastr.warning('Not allow drag n drop on this ' + this.selectedGroupBy, { nzDuration: 3000 });
  //     return;
  //   }
  //   const cardMoved = this.kanbanData.children[movementInformation.fromListIdx].children.splice(movementInformation.fromCardIdx ?? 0, 1);
  //   this.kanbanData.children[movementInformation.toListIdx].children.splice(movementInformation?.toCardIdx ?? 0, 0, ...cardMoved);
  //   cardMoved[0].dataObj[this.selectedGroupBy] = this.status[movementInformation.toListIdx];
  //   this.handleEventDrop(cardMoved[0].dataObj);
  // }
  moveCardAcrossList(data: any) {
    debugger
    if (this.kanbanData.kanlistArray.some((item: any) => item.key == this.selectedGroupBy && !item?.allowDragnDrop)) {
      this.toastr.warning('Not allow drag n drop on this ' + this.selectedGroupBy, { nzDuration: 3000 });
      return;
    }
    data.detail[this.selectedGroupBy] = data.value;
    this.handleEventDrop(data.detail);
  }
  handleEventDrop(obj: any) {
    let findClickApi = this.kanbanData?.appConfigurableEvent?.find((item: any) => item.rule.includes('put'));
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId == this.dataSharedService.currentMenuLink);
    if (!checkPermission?.updates && this.dataSharedService.currentMenuLink != '/ourbuilder') {
      alert("You did not have permission");
      return;
    }
    if (!findClickApi) {
      return;
    }

    const url = findClickApi._id ? `knex-query/executeDelete-rules/${findClickApi._id}` : '';

    if (!url) {
      return;
    }
    const model = {
      screenId: this.screenName,
      postType: 'put',
      modalData: obj
    };
    this.loader = true;
    // this.applicationServices.addNestCommonAPI(url, model).subscribe({
    //   next: (res) => {
    //     if (res) {
    //       this.loader = false;
    //       this.toastr.success('Update Successfully', { nzDuration: 3000 });
    //     }
    //     this.loader = false;
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.toastr.error('An error occurred', { nzDuration: 3000 });
    //     this.loader = false;
    //   }
    // });
  }
  saveBoard() {
    // const boardModel = new BoardModel();
    this.kanbanData.kanbanSave = this.lists;
    this.toastr.success('Save successfully!', { nzDuration: 3000 });
    // this.localService.saveBoard(boardModel);
  }

  deleteList(listIndex: number) {
    this.lists.splice(listIndex, 1);
    this.toastr.error('Delete !', { nzDuration: 3000 });

  }
  kandanListData: any[] = [];
  selectedGroupBy: string = 'status';
  // kanlistArray: any[] = [];
  processData(data: any) {
    try {
      if (data?.data?.length > 0) {
        this.kandanListData = data?.data;
        let firstObjectKeys = Object.keys(data?.data?.[0]);
        let tableKey = firstObjectKeys.map(key => ({ key, isShow: true, allowDragnDrop: false }));

        if (this.kanbanData['kanlistArray']) {
          if (this.kanbanData['kanlistArray'].length > 0) {
            if (JSON.stringify(this.kanbanData['kanlistArray']) !== JSON.stringify(tableKey)) {
              const updatedData = tableKey.filter(updatedItem =>
                !this.kanbanData['kanlistArray'].some((headerItem: any) => headerItem.key === updatedItem.key)
              );
              updatedData.forEach(updatedItem => {
                this.kanbanData['kanlistArray'].push({ id: this.kanbanData['kanlistArray'].length + 1, key: updatedItem.key });
              });
            }
          }
        } else {
          this.kanbanData['kanlistArray'] = tableKey;
        }

        if (window.location.href.includes('/pages')) {
          const uniqueStatus = [...new Set(this.kandanListData.map(item => item[this.selectedGroupBy]))];
          this.status = uniqueStatus;

          if (data?.data.length > 0)
            this.checkDynamicSection(data?.data);
        }

        this.loader = false;
      } else {
        this.toastr.error("Need not reload", { nzDuration: 3000 });
        this.loader = false;
      }

      return data;
    } catch (error) {
      console.error("An error occurred in processData:", error);
      this.toastr.error("An error occurred in kanban", { nzDuration: 3000 });
      this.loader = false;
      return data;
    }
  }

  dataDisplay(ite: any) {
    this.kanbanData = this.originalKanbanData;
    this.selectedGroupBy = ite;
    const uniqueStatus = [...new Set(this.kandanListData.map(item => item[ite]))];
    this.status = uniqueStatus;
    localStorage.setItem(this.kanbanData?.id + '_status', JSON.stringify(this.status));
    localStorage.setItem(this.kanbanData?.id + '_groupBy', this.selectedGroupBy);
    this.checkDynamicSection(this.kandanListData);
  }
  checkDynamicSection(dataList: any[]) {
    let kanbanS = JSON.parse(JSON.stringify(this.kanbanData));
    let kanbdanD = JSON.parse(JSON.stringify(this.kanbanData));
    if (this.kanbanData) {
      this.status.forEach((res: any, index: number) => {
        let filterData = dataList.filter(a => a[this.selectedGroupBy] == res);
        let latestKanbanData: any = [];
        if (filterData.length > 0)
          latestKanbanData = this.recursiveCheck(kanbdanD, filterData);
        let updateRecord = JSON.parse(JSON.stringify(kanbanS));
        if (index == 0) {
          this.kanbanData.children = [];
          updateRecord.children[0].title = res;
          updateRecord.children[0].children = latestKanbanData;
          this.kanbanData.children = [updateRecord.children[0]]
        }
        else {
          updateRecord.children[0].title = res;
          updateRecord.children[0].children = latestKanbanData;
          this.kanbanData.children.push(updateRecord.children[0])
        }

        this.updateNodes1();
      })
    }
  }
  recursiveCheck(data: any, dataList: any) {
    let result: any;
    if (Array.isArray(data)) {
      data.forEach((element: any) => {
        result = this.recursiveCheck(element, dataList);
      });
    }
    else if (typeof data === 'object' && data !== null) {
      if (data.type) {
        if (data.type === 'sections' || data.type === 'div' || data.type === 'cardWithComponents' || data.type === 'timelineChild') {
          if (data.mapApi) {
            return this.makeDynamicSections(dataList, data);
          }
        } else if (data.type === 'listWithComponents' || data.type === 'mainTab' || data.type === 'mainStep') {
          if (data.children) {
            data.children.forEach((item: any) => {
              if (item.mapApi) {
                return this.makeDynamicSections(dataList, item);
              }
            });
          }
        }
      }
      if (data.children) {
        result = this.recursiveCheck(data.children, dataList);
      }
    }
    return result;
  }
  makeDynamicSections(data: any, selectedNode: any) {
    let checkFirstTime = true;
    let tabsAndStepper: any = [];
    if (data.length > 0) {
      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        let newNode: any = {};
        if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'div' || selectedNode.type == 'listWithComponentsChild' || selectedNode.type == 'cardWithComponents' || selectedNode.type === 'timelineChild') {
          newNode = JSON.parse(JSON.stringify(selectedNode?.children));
        } else {
          newNode = JSON.parse(JSON.stringify(selectedNode?.children?.[1]?.children?.[0]));
        }
        if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'div' || selectedNode.type === 'timelineChild' || selectedNode.type == 'listWithComponentsChild' || selectedNode.type == 'cardWithComponents') {
          if (selectedNode.tableBody) {
            selectedNode.tableBody.forEach((element: any) => {
              if (newNode.length) {
                newNode.forEach((j: any) => {
                  const keyObj = this.findObjectByKey(j, element.fileHeader);
                  if (keyObj && element.defaultValue) {
                    const updatedObj = this.dataReplace(keyObj, item, element);
                    j = this.replaceObjectByKey(j, keyObj.key, updatedObj);
                    if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'listWithComponentsChild') {
                      j['mapping'] = true;
                    }
                  }
                });
              }
            });
          }
        } else if (selectedNode.type != 'tabs' && selectedNode.type != 'step' && selectedNode.type != 'div' && selectedNode.type != 'listWithComponentsChild' && selectedNode.type != 'listWithComponentsChild' && selectedNode.type != 'cardWithComponents') {
          if (selectedNode.tableBody) {
            selectedNode.tableBody.forEach((element: any) => {
              const keyObj = this.findObjectByKey(newNode, element.fileHeader);
              if (keyObj && element.defaultValue) {
                const updatedObj = this.dataReplace(keyObj, item, element);
                newNode = this.replaceObjectByKey(newNode, keyObj.key, updatedObj);
              }
            });
          }
        }
        if (checkFirstTime) {
          if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'div' || selectedNode.type == 'listWithComponentsChild' || selectedNode.type == 'cardWithComponents' || selectedNode.type == 'timelineChild') {
            {
              let newSelected = JSON.parse(JSON.stringify(selectedNode));
              newSelected['dataObj'] = data[index];
              newSelected.children = newNode;
              selectedNode = JSON.parse(JSON.stringify(newSelected));
            }
          } else if (selectedNode.children[1]) {
            selectedNode.children[1].children = [];
            selectedNode?.children[1]?.children?.push(newNode);
          }
          tabsAndStepper.push(selectedNode)
          this.updateNodes();
          checkFirstTime = false
        }
        else {
          if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'listWithComponentsChild') {
            if (newNode.length) {
              newNode.forEach((k: any) => {
                if (k.mapping) {
                  tabsAndStepper.push(k);
                }
              });
            }
            if (index == data.length - 1) {
              if (tabsAndStepper.length) {
                tabsAndStepper.forEach((j: any) => {
                  selectedNode?.children?.push(j);
                });
              }
              let unMapped = selectedNode?.children.filter((child: any) => child.mapping == undefined);
              let mapped = selectedNode?.children.filter((child: any) => child.mapping);
              selectedNode.children = mapped;
              if (unMapped.length) {
                unMapped.forEach((element: any) => {
                  selectedNode.children.push(element);
                });
              }
              selectedNode.children.forEach((k: any) => {
                delete k.mapping
              });
            }
          } else if (selectedNode.type == 'div' || selectedNode.type == 'timelineChild' || selectedNode.type == 'cardWithComponents') {
            let newSelected = JSON.parse(JSON.stringify(selectedNode));
            newSelected.children = newNode;
            newSelected['dataObj'] = item;
            let newData = JSON.parse(JSON.stringify(newSelected));
            tabsAndStepper.push(newData);
            // if (index == data.length - 1) {
            //   let checkPushOrNot = true
            //   if ((selectedNode.type == 'div' || selectedNode.type == 'cardWithComponents' || selectedNode.type == 'timelineChild') && checkPushOrNot) {
            //     if (tabsAndStepper) {
            //       this.pushObjectsById(this.kanbanData, tabsAndStepper, selectedNode.id);
            //       checkPushOrNot = false;
            //     }
            //   }
            // }
          } else if (selectedNode.children[1]) {
            selectedNode?.children[1]?.children?.push(newNode);
          }
        }
      }
      this.updateNodes();
    }
    // if (tabsAndStepper.length > 0)
    // tabsAndStepper.push(selectedNode);
    return tabsAndStepper;
  }
  updateNodes() {
    // this.kanbanData.children[0].children = [...this.kanbanData.children[0].children];
  }
  updateNodes1() {
    this.kanbanData = JSON.parse(JSON.stringify(this.kanbanData))
  }
  pushObjectsById(targetArray: any[], sourceArray: any[], idToMatch: string): void {
    for (let i = 0; i < targetArray.length; i++) {
      const item = targetArray[i];

      // Check if the current item's id matches the id to match
      if (item.id === idToMatch) {
        // Find the index of the matched item in the target array
        const index = targetArray.indexOf(item);

        // Check if the item was found in the target array
        if (index !== -1) {
          // Splice the source array into the target array at the next index
          targetArray.splice(index + 1, 0, ...sourceArray);
          return; // Stop processing as the operation is complete
        }
      }

      // If the current item has children, recursively search within them
      if (item.children && item.children.length > 0) {
        this.pushObjectsById(item.children, sourceArray, idToMatch);
      }
    }
  }
  findObjectByKey(data: any, key: any) {
    if (data) {
      if (data.key && key) {
        if (data.key === key) {
          return data;
        }
        if (data.children && data.children.length > 0) {
          for (let child of data.children) {
            let result: any = this.findObjectByKey(child, key);
            if (result !== null) {
              return result;
            }
          }
        }
      }
    }
    return null;
  }
  dataReplace(node: any, replaceData: any, value: any): any {
    let typeMap: any = this.dataSharedService.typeMap;

    const type = node.type;
    const key = typeMap[type];
    if (node.type == 'avatar') {
      if (Array.isArray(replaceData[value.defaultValue])) {
        let nodesArray: any = [];
        replaceData[value.defaultValue].forEach((i: any) => {
          let newNode = JSON.parse(JSON.stringify(node));
          newNode.src = i;
          nodesArray.push(newNode);
        });
        return nodesArray;
      }
    }
    else if (node.type == "tag") {
      if (Array.isArray(replaceData[value.defaultValue])) {
        node.options = replaceData[value.defaultValue];
        return node;
      }
    }
    else {
      if (key) {
        node[key] = replaceData[value.defaultValue];
      }
      return node;
    }
  }
  replaceObjectByKey(data: any, key: any, updatedObj: any) {
    if (data.key === key) {
      return updatedObj;
    }
    for (let i = 0; i < data.children.length; i++) {
      const child = data.children[i];
      if (child.key === key) {
        if (Array.isArray(updatedObj) && child.type == 'avatar') {
          let check = data.children.filter((a: any) => a.type == "avatar");
          if (check.length != 1) {
            // let getFirstAvatar = JSON.parse(JSON.stringify(check[0]));
            let deleteAvatar = check.length - 1;
            for (let index = 0; index < deleteAvatar; index++) {
              const element = data.children.filter((a: any) => a.type == "avatar");;
              const idx = data.children.indexOf(element[0]);
              data.children.splice(idx as number, 1);
            }
            let lastAvatarIndex = data.children.filter((a: any) => a.type == "avatar");
            let idx = data.children.indexOf(lastAvatarIndex[0]);
            data.children.splice(idx, 1);
            updatedObj.forEach((i: any) => {
              data.children.splice(idx + 1, 0, i);
              idx = idx + 1;
            });
          }
          else {
            let lastAvatarIndex = data.children.filter((a: any) => a.type == "avatar");
            let idx = data.children.indexOf(lastAvatarIndex[0]);
            data.children.splice(idx, 1);
            updatedObj.forEach((i: any) => {
              data.children.splice(idx + 1, 0, i);
              idx = idx + 1;
            });
          }
        }
        else {
          data.children[i] = updatedObj;
        }
        return data;
      }
      const result = this.replaceObjectByKey(child, key, updatedObj);
      if (result !== null) {
        return data;
      }
    }
    return null;
  }
  recallApi(event?: any) {
    this.dropListIndex = '';
    const { id, actionLink, data, headers, parentId, page, pageSize } = this.kanbanData.eventActionconfig;
    if (id) {
      let pagination = ''
      if (page && pageSize) {
        pagination = `?page=${localStorage.getItem('tablePageNo') || 1}&pageSize=${localStorage.getItem('tablePageSize') || 10}`
      }
      this.loader = true;
      const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', id, parentId, localStorage.getItem('tablePageNo') || 1, localStorage.getItem('tablePageSize') || 10, data, headers);
      this.dataSharedService.saveDebugLog('recallApi',RequestGuid)
      this.socketService.Request(jsonData);
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;

            this.processData(res);
            this.loader = false;
          }
        },
        error: (error: any) => {
          console.error(error);
          this.loader = false;
          this.toastr.error("An error occurred", { nzDuration: 3000 });
        }
      })
    }
  }
  delete(data: any) {
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId == this.dataSharedService.currentMenuLink);
    if (!checkPermission?.deletes && this.dataSharedService.currentMenuLink != '/ourbuilder') {
      alert("You did not have permission");
      return;
    }
    const model = {
      screenId: this.screenName,
      postType: 'delete',
      modalData: data
    };
    if (this.kanbanData?.appConfigurableEvent && this.kanbanData?.appConfigurableEvent?.length > 0) {
      // Find the 'delete' event in appConfigurableEvent
      const findClickApi = this.kanbanData.appConfigurableEvent.find((item: any) => item.rule.includes('delete'));
      if (findClickApi) {
        this.loader = true;
        const url = `knex-query/executeDelete-rules/${findClickApi._id}`;
        if (url) {
          const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('5007', findClickApi.id);
          const jsonData1 = {
            postType: 'post',
            modalData: model, metaInfo: jsonData.metaInfo
          };
          this.dataSharedService.saveDebugLog('DeleteBoard',RequestGuid)
          this.socketService.Request(jsonData1);
          this.socketService.OnResponseMessage().subscribe({
            next: (res) => {
              if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
                res = res.parseddata.apidata;
                this.loader = false;
                if (res.isSuccess) {
                  if (this.kanbanData.children[data.listIndex].children.length > 1) {
                    this.kanbanData.children[data.listIndex].children.splice(data.index, 1);
                  } else {
                    this.kanbanData.children.splice(data.listIndex, 1)
                  }

                  // Data successfully deleted
                  // this.recallApi();
                  this.toastr.success("Delete Successfully", { nzDuration: 3000 });
                }
              }

            },
            error: (err) => {
              this.loader = false;
              this.toastr.error(`An error occurred ${err}`, { nzDuration: 3000 });
            }
          });
        }
      }
    }
  }
}
