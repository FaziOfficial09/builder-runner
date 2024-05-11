
import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';


@Component({
   selector: 'st-formly-field-custom-input',
   template: `
<div [class]="to['additionalProperties']?.innerInputClass + ' ' + to['additionalProperties']?.applicationThemeClasses + ' ' + to['additionalProperties']?.appGlobalClass" [ngClass]="to['additionalProperties']?.wrapper && to['additionalProperties']?.wrapper == 'floating_filled' || to['additionalProperties']?.wrapper == 'floating_outlined' || to['additionalProperties']?.wrapper == 'floating_standard' ? 'masking' : ''">
   <div [class]="to['additionalProperties']?.wrapper=='floating_standard' ? 'relative z-0' : ''">
      <nz-input-group  [ngClass]="showError ? 'input-border' : ''"  
      [nzSuffix]="(to['additionalProperties']?.addonRight   || to['additionalProperties']?.suffixicon) ? suffixTemplateInfo : undefined"
    [nzPrefix]="(to['additionalProperties']?.addonLeft || to['additionalProperties']?.prefixicon) ? prefixTemplateUser : undefined"
      [nzStatus]="to['additionalProperties']?.status" 
      [nzSize]="to['additionalProperties']?.size">
      <input [ngClass]="showError && !to['additionalProperties']?.suffixicon && !to['additionalProperties']?.prefixicon && !to['additionalProperties']?.addonLeft && !to['additionalProperties']?.addonRight ? 'input-border' : ''"  [ngClass]="to['additionalProperties']?.wrapper=='floating_filled' || to['additionalProperties']?.wrapper=='floating_standard'
      || to['additionalProperties']?.wrapper=='floating_outlined' ? to['additionalProperties']?.floatFieldClass : ''"nz-input *ngIf="!to['maskString']" class='form-control' [formControl]="formControl" [type]="type" [formlyAttributes]="field" [nzStatus]="to['additionalProperties']?.status">
      <input [ngClass]="showError && !to['additionalProperties']?.suffixicon && !to['additionalProperties']?.prefixicon && !to['additionalProperties']?.addonLeft && !to['additionalProperties']?.addonRight ? 'input-border' : ''"  [ngClass]="to['additionalProperties']?.wrapper=='floating_filled' || to['additionalProperties']?.wrapper=='floating_standard'
      || to['additionalProperties']?.wrapper=='floating_outlined' ? to['additionalProperties']?.floatFieldClass : ''" nz-input *ngIf="to['maskString']" [formControl]="formControl" [mask]="to['maskString']" class='form-control' [type]="type" [formlyAttributes]="field" aria-describedby="passwordHelpBlock" [nzStatus]="to['additionalProperties']?.status">
      <label *ngIf="to['additionalProperties']?.wrapper == 'floating_filled' ||to['additionalProperties']?.wrapper=='floating_standard'
      ||to['additionalProperties']?.wrapper == 'floating_outlined'"
      [ngClass]="to['additionalProperties']?.floatLabelClass">{{ to.label ?? '' | translate }}
      </label>
      </nz-input-group>
      <ng-template #suffixTemplateInfo>
      <ng-container *ngIf="to['additionalProperties']?.suffixicon ; else addonLeftText">
        <st-icon [type]="to['additionalProperties']?.iconType || 'outline'"
          [icon]="to['additionalProperties']?.suffixicon" [size]="to['additionalProperties']?.iconSize"
          [hoverIconColor]="to['additionalProperties']?.hoverIconColor || ''"
          [color]="to['additionalProperties']?.iconColor" [iconClass]="to['additionalProperties']?.iconClass"></st-icon>
      </ng-container>
      <ng-template #addonLeftText>
        {{to['additionalProperties']?.addonRight}}
      </ng-template>
    </ng-template>
    <ng-template #prefixTemplateUser>
      <ng-container *ngIf="to['additionalProperties']?.prefixicon ; else addonRightText">
        <st-icon [type]="to['additionalProperties']?.iconType || 'outline'"
          [icon]="to['additionalProperties']?.prefixicon" [size]="to['additionalProperties']?.iconSize"
          [hoverIconColor]="to['additionalProperties']?.hoverIconColor || ''"
          [color]="to['additionalProperties']?.iconColor" [iconClass]="to['additionalProperties']?.iconClass"></st-icon>
      </ng-container>
      <ng-template #addonRightText>
        {{to['additionalProperties']?.addonLeft}}
      </ng-template>
    </ng-template>
   </div>
</div>



`,
})
export class FormlyFieldCustomInputComponent extends FieldType<FieldTypeConfig> {
   get type() {
      return this.to.type || 'text';
   }
}

