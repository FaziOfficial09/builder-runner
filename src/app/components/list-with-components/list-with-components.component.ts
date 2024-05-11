import { Component, OnInit , Input } from '@angular/core';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'st-list-with-components',
  templateUrl: './list-with-components.component.html',
  styleUrls: ['./list-with-components.component.scss']
})
export class ListWithComponentsComponent implements OnInit {
  @Input() listData : any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  @Input() mappingId: any;
  constructor() { }

  ngOnInit(): void {

  }

}
