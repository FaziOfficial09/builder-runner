import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ListInterface } from '../../model/list/list.model';
import { Movement, MovementIntf } from '../../model/card/movement';
import { Card, CardInterface } from '../../model/card/card.model';
import { DOCUMENT } from '@angular/common';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { Subject, Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

@Component({
  selector: '[st-lists]',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListsComponent implements OnInit {
  @Input() kanban: any;
  @Input() mappingId: any;
  @Input() screenLink: any;
  @Input() editScreenLink: any;
  @Input() dropListIndex: any;
  @Input() lane: any;
  @Input() list: any;
  @Input() kanbanData: any;
  @Input() listIndex: any;
  @Output() moveCardAcrossList: EventEmitter<MovementIntf> = new EventEmitter<MovementIntf>();
  @Output() taskDeleteEmit: EventEmitter<MovementIntf> = new EventEmitter<MovementIntf>();
  @Output() newCardAdded: EventEmitter<Card> = new EventEmitter<CardInterface>();
  @Output() deleteList: EventEmitter<number> = new EventEmitter<number>();
  @Output() taskSubmitEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeDropIndex: EventEmitter<any> = new EventEmitter<any>();
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  loader: boolean = false;
  isVisible = false;
  DrawerType: any = 'add';
  startDragIndex: any;
  private cardCount = 0;
  dropCardIndex: any;
  private subscriptions: Subscription = new Subscription();
  private destroy$: Subject<void> = new Subject<void>();
  constructor(private elementRef: ElementRef, @Inject(DOCUMENT) private document: Document, public dataSharedService: DataSharedService,
    private toastr: NzMessageService, private modal: NzModalService, ) {
  }

  ngOnInit() {
  }

  addNewCard() {
    const card = new Card(this.cardCount++ + '', 'header ' + this.cardCount, 'summary ' + this.cardCount, 'sample desc');
    this.list['cards'] = [];
    this.list.cards.push(card);
    this.newCardAdded.emit(card);
  }


  allowCardReplacement(dragEvent: DragEvent) {
    if (dragEvent.dataTransfer)
      dragEvent.dataTransfer.dropEffect = 'move';
    dragEvent.preventDefault();
    const elements: Element[] = this.document.elementsFromPoint(dragEvent.x, dragEvent.y);
    const cardElementBeingDroppedOn = elements.find(x => x.tagName.toLowerCase() === 'st-card-summary');
    const listElementBeingDroppedOn = elements.find(x => x.tagName.toLowerCase() === 'st-lists');
    if (listElementBeingDroppedOn && listElementBeingDroppedOn.getAttribute('listIndex')) {
      this.dropListIndex = parseInt(listElementBeingDroppedOn.getAttribute('listIndex') ?? '', 10);
      // this.dataSharedService.removeKanbanListIndex.next(this.dropListIndex);
      this.dropCardIndex = cardElementBeingDroppedOn === undefined ? undefined :
        parseInt(cardElementBeingDroppedOn.getAttribute('cardIndex') ?? '', 10);
      if (dragEvent.dataTransfer) {
        const data = JSON.parse(dragEvent.dataTransfer.getData('text'));
        const listIndexDragged = parseInt(data.listIndex, 10);
        this.dropListIndex = listIndexDragged == this.dropListIndex ? '' : this.dropListIndex;
      }
    }
  }



  dropCard(dragEvent: DragEvent) {

    if (dragEvent.dataTransfer) {
      const data = JSON.parse(dragEvent.dataTransfer.getData('text'));
      const elements: Element[] = this.document.elementsFromPoint(dragEvent.x, dragEvent.y);
      const cardElementBeingDroppedOn = elements.find(x => x.tagName.toLowerCase() === 'st-card-summary');
      const listElementBeingDroppedOn = elements.find(x => x.tagName.toLowerCase() === 'st-lists');
      if (listElementBeingDroppedOn && listElementBeingDroppedOn.getAttribute('listIndex')) {
        const listIndexDroppedOn = parseInt(listElementBeingDroppedOn.getAttribute('listIndex') ?? '', 10);
        const cardIndexDroppedOn = cardElementBeingDroppedOn === undefined ? undefined :
          parseInt(cardElementBeingDroppedOn.getAttribute('cardIndex') ?? '', 10);
        const listIndexDragged = parseInt(data.listIndex, 10);
        const cardIndexDragged = parseInt(data.cardIndex, 10);

        if (listIndexDragged === listIndexDroppedOn) {
          // same list just re-organize the cards
          const cardDragged = this.list.cards.splice(cardIndexDragged, 1);
          if (cardIndexDroppedOn)
            this.list.cards.splice(cardIndexDroppedOn, 0, ...cardDragged);
        } else {
          this.moveCardAcrossList.emit(new Movement(listIndexDragged, listIndexDroppedOn, cardIndexDragged, cardIndexDroppedOn));
        }
      }

    }
  }
  requestSubscription: Subscription;
  responseData: any;
  nodes: any[] = [];
  openDrawer(type?: any, EditData?: any) {
    debugger
    this.responseData = [];
    if (this.screenLink) {
      this.isVisible = true;
      let screenLink: any;
      if (type == 'add') {
        this.DrawerType = 'Add';
        screenLink = this.kanbanData?.screenLink;
      }
      else if (type == 'edit' || type == 'detail') {
        this.DrawerType = type == 'edit' ? 'Update' : 'Detail';
        this.mappingId = EditData?.id;
        screenLink = type == 'edit' ? this.kanbanData?.editScreenLink : this.kanbanData?.detailScreenLink;
      }
      if (screenLink == undefined || screenLink == '') {
        this.toastr.warning('No screen Link found', { nzDuration: 3000 });
        return;
      }
      this.loader = true
      // this.requestSubscription = this.applicationService.getNestCommonAPIById('cp/Builder', screenLink).subscribe({
      //   next: (res: any) => {
      //     try {
      //       if (res.isSuccess) {
      //         if (res.data.length > 0) {
      //           this.screenId = res.data[0].screenBuilderId;
      //           const data = JSON.parse(res.data[0].screenData);
      //           this.responseData = data;
      //           res.data[0].screenData = this.applicationService.jsonParseWithObject(this.applicationService.jsonStringifyWithObject(this.responseData));
      //           this.nodes = [];
      //           this.nodes.push(res);

      //         }
      //         this.loader = false;
      //       } else {
      //         this.toastr.error(res.message, { nzDuration: 3000 });
      //         this.loader = false;
      //       }
      //     } catch (err) {
      //       this.loader = false;
      //       this.toastr.warning('An error occurred: ' + err, { nzDuration: 3000 });
      //       console.error(err); // Log the error to the console
      //     }
      //   },
      //   error: (err) => {
      //     this.loader = false;
      //     this.toastr.warning('Required Href ' + err, { nzDuration: 3000 });
      //     console.error(err); // Log the error to the console
      //   }
      // });
    } else {
      this.toastr.error("Screen Link is not found please provide screen link first", { nzDuration: 3000 });
    }
  }
  handleClose(): void {
    this.isVisible = false;
    this.dataSharedService.drawerVisible = false;
    if (this.dataSharedService.isSaveData)
      this.taskSubmitEmit.emit(true)
  }
  edit(item: any) {
    this.openDrawer(item?.type, item?.detail)
  }

  showDeleteConfirm(item: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this record?',
      nzOkText: 'Yes',
      nzClassName: 'deleteRow',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.delete(item),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
  delete(item: any) {
    item['listIndex'] = this.listIndex;
    this.taskDeleteEmit.emit(item);
  }
  ngOnDestroy(): void {
    try {
      if (this.requestSubscription) {
        this.requestSubscription.unsubscribe();
      }

      if (this.subscriptions) {
        this.subscriptions.unsubscribe();
      }

      this.destroy$.next();
      this.destroy$.complete();
    } catch (error) {
      console.error('Error in ngOnDestroy:', error);
    }
  }
  drop(event: CdkDragDrop<any[]>, groupedByValue?: any) {
    debugger
    let isMovingInsideTheSameList = event.previousContainer === event.container;
    if (isMovingInsideTheSameList) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    else {
      let previouData = JSON.parse(JSON.stringify(event.previousContainer.data));
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      if (previouData[event.previousIndex]) {
        let obj: any = {
          detail: previouData[event.previousIndex].dataObj,
          value: groupedByValue
        }
        this.moveCardAcrossList.emit(obj);
      }
    }
  }
}
