import { ChangeDetectorRef, Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { Subscription } from 'rxjs';
import { DataSharedService } from '../services/data-shared.service';

@Component({
  selector: 'formly-horizontal-wrapper',
  template: `
   <span *ngIf="to['additionalProperties']?.tooltip && to['additionalProperties']?.tooltipPosition == 'top' && !to['additionalProperties']?.tooltipWithoutIcon" nz-tooltip [nzTooltipTitle]="to['additionalProperties']?.tooltip">
  <span nz-icon [nzType]="to['additionalProperties']['tooltipIcon'] ?  to['additionalProperties']['tooltipIcon'] : 'question-circle'" [class]="to['additionalProperties']['toolTipClass']" nzTheme="outline"></span>
</span>
<div class="flex flex-wrap pb-1 pr-1" [dir]="to['additionalProperties']?.formatAlignment || 'ltr'">
  <span style="margin-top: 4px" *ngIf="to['additionalProperties']?.tooltip && to['additionalProperties']?.tooltipPosition == 'left' && !to['additionalProperties']?.tooltipWithoutIcon" nz-tooltip [nzTooltipTitle]="to['additionalProperties']?.tooltip">
    <span nz-icon [nzType]="to['additionalProperties']['tooltipIcon'] ?  to['additionalProperties']['tooltipIcon'] : 'question-circle'" [class]="to['additionalProperties']['toolTipClass']" nzTheme="outline"></span>
  </span>
  <label class="label-style relative py-1 px-2 text-muted" [attr.for]="id" *ngIf="to.label" [ngClass]="[labelColumn , to['additionalProperties']?.labelPosition , to.type != 'checkbox' && to.type!='radio' ? fieldPadding : '']">
    <span>
      <span class="mr-1 mb-1">
        <st-icon *ngIf="to['additionalProperties']?.titleIcon" [type]="to['additionalProperties']?.iconType || 'outline'" [icon]="to['additionalProperties']?.titleIcon" [hoverIconColor]="to['additionalProperties']?.hoverIconColor || ''" [size]="to['additionalProperties']?.iconSize" [color]="to['additionalProperties']?.iconColor"></st-icon>
      </span>
      <!-- <span nz-icon [nzType]="to.titleIcon" nzTheme="outline" class="mr-1 mb-1"></span> -->
      <st-task-report class="close-icon mr-2 !absolute top-[2%] !left-[2%]" style="position:absolute" *ngIf="to['issueReport'] && to['issueReport']?.length > 0 " [item]="to" [screenName]="to['screenName']"
                [type]="'pages'"></st-task-report>
      <span [class]="to['additionalProperties']?.labelClassName">{{ to.label | translate}}

      </span>
      <span *ngIf="to.required" class="text-red-600">*</span>
    </span>
    <span *ngIf="to['additionalProperties']?.tooltip && (to['additionalProperties']?.tooltipPosition == 'right' || to['additionalProperties']?.tooltipPosition == undefined) && !to['additionalProperties']?.tooltipWithoutIcon" nz-tooltip [nzTooltipTitle]="to['additionalProperties']?.tooltip">
      <span nz-icon [nzType]="to['additionalProperties']['tooltipIcon'] ?  to['additionalProperties']['tooltipIcon'] : 'question-circle'" [class]="to['additionalProperties']['toolTipClass']" nzTheme="outline"></span>
    </span>
  </label>
  <div  [ngClass]="[(!to.label) || (!to.label && to['className'].include('w-full')) ? 'w-full' : fieldColumn]">
    <ng-template #fieldComponent></ng-template>
  </div>
  <div *ngIf="to['additionalProperties']?.error != null" class="{{labelColumn}}"></div>
  <div *ngIf="to['additionalProperties']?.error != null" class="text-red-500 text-sm block {{fieldColumn}}">
    <p class="m-0 p-0">{{to['additionalProperties']?.error }}</p>
  </div>
  <div *ngIf="showError" class="{{labelColumn}}"></div>
  <div *ngIf="hasError" class="text-red-500 text-sm block {{fieldColumn}}">
    <span *ngIf="to['additionalProperties']?.requiredMessage">{{to['additionalProperties']?.requiredMessage}}</span>
    <!-- <formly-validation-message [field]="field"></formly-validation-message> -->
  </div>
</div>
  `,
})
export class FormlyHorizontalWrapper extends FieldWrapper {
  labelColumn: string;
  fieldColumn: string;
  errorColumn: string;
  fieldPadding: string;
  rtl: any;
  requestSubscription: Subscription;
  hasError: boolean = false;
  constructor(public dataSharedService: DataSharedService, private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
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

    const fullWidth = this.to['className'].includes('w-full');
    const labelPosition = this.to['additionalProperties']?.labelPosition + ' pl-2 pr-2' || '';
    this.labelColumn = `w-1/4 ${labelPosition}`;
    this.fieldColumn = fullWidth ? 'w-3/4' : 'w-3/4';
    this.fieldPadding = this.getFieldPaddingClass(this.to['additionalProperties']?.size);
  }


  private getFieldPaddingClass(size: string): string {
    switch (size) {
      case 'default': return 'pt-2';
      case 'small': return 'pt-1';
      case 'large': return 'pt-3';
      default: return '';
    }
  }
  ngOnDestroy(): void {
    this.dataSharedService.formlyShowError.next(false)
    this.requestSubscription.unsubscribe();
  }
}
