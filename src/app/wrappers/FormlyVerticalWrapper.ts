import { ChangeDetectorRef, Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { Subscription } from 'rxjs';
import { DataSharedService } from '../services/data-shared.service';

@Component({
  selector: 'formly-vertical-wrapper',
  template: `
  <span *ngIf="to['additionalProperties']['tooltipPosition'] == 'top' && to['additionalProperties']?.tooltip">
  <span *ngIf="to['additionalProperties']?.tooltip && !to['additionalProperties']?.tooltipWithoutIcon || false" nz-tooltip [nzTooltipTitle]="to['additionalProperties']?.tooltip">
  <span nz-icon [nzType]="to['additionalProperties']['tooltipIcon'] ?  to['additionalProperties']['tooltipIcon'] : 'question-circle'" [class]="to['additionalProperties']['toolTipClass']" nzTheme="outline"></span></span>
  </span>

  <div class="pr-1" [dir]="to['additionalProperties']?.formatAlignment || 'ltr'">
    <div [class]='to["additionalProperties"]?.labelPosition'>
      <span *ngIf="to['additionalProperties']?.tooltipPosition == 'left'">
      <span *ngIf="to['additionalProperties']?.tooltip && !to['additionalProperties']?.tooltipWithoutIcon || false" nz-tooltip [nzTooltipTitle]="to['additionalProperties']?.tooltip">
        <span nz-icon [nzType]="to['additionalProperties']['tooltipIcon'] ?  to['additionalProperties']['tooltipIcon'] : 'question-circle'" [class]="to['additionalProperties']['toolTipClass']" nzTheme="outline"></span>
      </span>
      </span>
      <label [attr.for]="id" [class]="to['additionalProperties']?.wrapperLabelClass ? to['additionalProperties']?.wrapperLabelClass + ' ' + to['additionalProperties']?.labelPosition : 'label-style relative col-form-label ' + to['additionalProperties']?.labelPosition + ' pl-1'" *ngIf="to.label" [style.background-color]="to['labelBackgroundColor']" [style.color]="to['labelColor']">
        <span>
          <span class="mr-1 mb-1">
            <st-icon *ngIf="to['additionalProperties']?.titleIcon" [type]="to['additionalProperties']?.iconType || 'outline'" [icon]="to['additionalProperties']?.titleIcon" [hoverIconColor]="to['additionalProperties']?.hoverIconColor || ''" [size]="to['additionalProperties']?.iconSize" [color]="to['additionalProperties']?.iconColor"></st-icon>
          </span>
          <st-task-report class="close-icon mr-2 !top-[50%] !left-[2%]" *ngIf="to['issueReport'] && to['issueReport']?.length > 0 " [item]="to" [screenName]="to['screenName']"
                [type]="'pages'"></st-task-report>
          <span *ngIf="to.required">*</span>
          <span [class]="to['additionalProperties']?.labelClassName">{{to.label | translate}}</span>
        </span>
        <span *ngIf="to['additionalProperties']?.tooltipPosition == 'right' || to['additionalProperties']?.tooltipPosition == undefined">
        <span *ngIf="to['additionalProperties']?.tooltip && !to['additionalProperties']?.tooltipWithoutIcon || false" nz-tooltip [nzTooltipTitle]="to['additionalProperties']?.tooltip">
          <span nz-icon [nzType]="to['additionalProperties']['tooltipIcon'] ?  to['additionalProperties']['tooltipIcon'] : 'question-circle'" [class]="to['additionalProperties']['toolTipClass']" nzTheme="outline"></span>
        </span>
        </span>
      </label>
    </div>
    <div [class]="to['additionalProperties']?.wrapperInputClass ? to['additionalProperties']?.wrapperInputClass : 'mt-1 pl-2'">
      <ng-template #fieldComponent></ng-template>
    </div>
    <div *ngIf="hasError" class="text-red-500 text-sm block pl-2">
    <span *ngIf="to['additionalProperties']?.requiredMessage">{{to['additionalProperties']?.requiredMessage}}</span>
      <!-- <formly-validation-message [field]="field"></formly-validation-message> -->
    </div>
  </div>
  `,
})
export class FormlyVerticalWrapper extends FieldWrapper {
  constructor(public dataSharedService: DataSharedService, private cd: ChangeDetectorRef) {
    super();
  }
  requestSubscription: Subscription;
  hasError: boolean = false;
  ngOnInit(): void {
    this.to;
    this.requestSubscription = this.dataSharedService.formlyShowError.subscribe({
      next: (res: any) => {
        if (res) {
          this.hasError = JSON.parse(JSON.stringify(res));
          this.cd.detectChanges(); // Mark component for change detection
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
    if (this.field.formControl) {
      this.field.formControl.statusChanges.subscribe(() => {

        if (this.field.formControl) {
          this.hasError = this.field.formControl.invalid;
        }
      });
    }
  }
  ngOnDestroy(): void {
    this.dataSharedService.formlyShowError.next(false)
    this.requestSubscription.unsubscribe();
  }
}
