import { ConfigOption } from "@ngx-formly/core";
// import { MentionComponent } from "./components/mention/mention.component";
import { SwitchComponent } from "./components/switch/switch.component";
import { AutocompleteComponent } from "./wrappers/autocomplete/autocomplete.component";
import { DatePickerComponent } from "./wrappers/date-picker/date-picker.component";
// import { ColorPickerComponent } from "./wrappers/color-picker/color-picker.component";
// import { DatepickerComponent } from "./wrappers/datepicker/datepicker.component";
import { FormlyFieldCustomInputComponent } from "./wrappers/formly-field-custom-input.component";
import { FormlyFieldNgSearchComponent } from "./wrappers/formly-field-ng-search.component";
import { FormlyFieldNgSelectComponent } from "./wrappers/formly-field-ng-select.component";
import { FormlyFloatComponent } from "./wrappers/formly-float/formly-float.component";
import { FormlyFieldRangeDate } from "./wrappers/FormlyFieldRangeDate";
import { FormlyFieldTimePicker } from "./wrappers/FormlyFieldTimePicker";
import { FormlyHorizontalWrapper } from "./wrappers/FormlyHorizontalWrapper";
import { FormlyFieldMultiCheckbox } from "./wrappers/FormlyMultiCheckbox";
import { formlyRepeatSectionComponent } from "./wrappers/formlyRepeatSection";
import { FormlyVerticalThemeWrapper } from "./wrappers/FormlyVerticalThemeWrapper";
import { FormlyVerticalWrapper } from "./wrappers/FormlyVerticalWrapper";
import { FormlyFieldImageUploadComponent } from "./wrappers/Image-Uploadwrapper";
import { InputWrapperComponent } from "./wrappers/input-wrapper/input-wrapper.component";
import { NumberInputComponent } from "./wrappers/number-input/number-input.component";
import { RadioButtonComponent } from "./wrappers/radio-button/radio-button.component";
import { RangeComponent } from "./wrappers/range/range.component";
import { SelectComponent } from "./wrappers/select/select.component";
import { TimePickerComponent } from "./wrappers/time-picker/time-picker.component";
import { MultiSelectComponent } from "./wrappers/multi-select/multi-select.component";
import { RepeatInputComponent } from "./wrappers/repeat-input/repeat-input.component";
import { MultiFileUploadWrapperComponent } from "./wrappers/multi-file-upload-wrapper/multi-file-upload-wrapper.component";
import { AudioVideoRecorderComponent } from "./wrappers/audio-video-recorder/audio-video-recorder.component";
import { RepeatableControllComponent } from "./wrappers/repeatable-controll/repeatable-controll.component";
import { ColorPickerComponent } from "./wrappers/color-picker/color-picker.component";
import { CascaderWrapperComponent } from "./wrappers/cascader-wrapper/cascader-wrapper.component";
import { SignaturePadComponent } from "./wrappers/signature-pad/signature-pad.component";
import { RangInputsComponent } from "./components";
// import { FormlyHorizontalWrapper } from "./wrappers/FormlyHorizontalWrapper";

export const fieldComponents = [
  FormlyFieldCustomInputComponent,
  FormlyFieldNgSearchComponent,
  FormlyFieldNgSelectComponent,
  FormlyFieldMultiCheckbox,
  FormlyHorizontalWrapper,
  FormlyVerticalWrapper,
  FormlyVerticalThemeWrapper,
  FormlyFieldRangeDate,
  FormlyFieldTimePicker,
  formlyRepeatSectionComponent,
  InputWrapperComponent,
  SignaturePadComponent,
  MultiFileUploadWrapperComponent,
  // DatepickerComponent,
  // SwitchComponent,
  // ColorPickerComponent,
  NumberInputComponent,
  SelectComponent,
  AutocompleteComponent,
  // MentionComponent,
  RadioButtonComponent,
  FormlyFieldImageUploadComponent,
  TimePickerComponent,
  DatePickerComponent,
  RangeComponent,
  FormlyFloatComponent,
  MultiSelectComponent,
  RepeatInputComponent,
  AudioVideoRecorderComponent,
  RepeatableControllComponent,
  ColorPickerComponent,
  CascaderWrapperComponent,RangInputsComponent
];


export const formlyCustomeConfig: ConfigOption = {
  types: [
    //   { name: 'extended-input', extends: 'input' },
    // { name: 'repeatText', component: FormlyFieldInputRepeatSectionComponent },
    { name: 'repeatSection', component: formlyRepeatSectionComponent },
    // { name: 'repeatSection', component: FormlyFieldRepeatSectionComponent },
    // { name: 'multiRepeatSection', component: MultiRepeatComponent },
    { name: 'ng-select', component: FormlyFieldNgSelectComponent },
    { name: 'ng-search', component: FormlyFieldNgSearchComponent },
    { name: 'custom', component: FormlyFieldCustomInputComponent },
    { name: 'rangedatetime', component: FormlyFieldRangeDate },
    { name: 'timepicker', component: FormlyFieldTimePicker },
    { name: 'input', component: InputWrapperComponent },
    { name: 'email', component: InputWrapperComponent },
    { name: 'signaturePad', component: SignaturePadComponent },
    // { name: 'date', component: DatepickerComponent },
    // { name: 'color', component: ColorPickerComponent },
    // { name: 'switch', component: SwitchComponent },
    { name: 'number', component: NumberInputComponent },
    { name: 'select', component: SelectComponent },
    { name: 'autoComplete', component: AutocompleteComponent },
    // { name: 'mention', component: MentionComponent },
    { name: 'radio', component: RadioButtonComponent },
    // { name: 'tabs', component: FormlyFieldTabs },
    // { name: 'tab', component: FormlyVerticalFieldTabs },
    // { name: 'repeatInput', component: FormlyGridWrapper },
    // { name: 'image-upload', component: FormlyFieldImageUploadComponent },
    // { name: 'gridrepeatsection', component: gridrepeatsection },
    { name: 'image-upload', component: FormlyFieldImageUploadComponent },
    // { name: 'multiFileUpload', component: FormlyFieldImageUploadComponent },
    { name: 'zorro-timePicker', component: TimePickerComponent },
    { name: 'zorro-datePicker', component: DatePickerComponent },
    { name: 'rangePicker', component: RangeComponent },
    { name: 'checkbox', component: FormlyFieldMultiCheckbox },
    { name: 'multiselect', component: MultiSelectComponent },
    { name: 'tag', component: MultiSelectComponent },
    { name: 'repeat', component: RepeatInputComponent },
    { name: 'multiFileUploader', component: MultiFileUploadWrapperComponent },
    { name: 'audioVideoRecorder', component: AudioVideoRecorderComponent },
    { name: 'customeClearence', component: RepeatableControllComponent },
    { name: 'color', component: ColorPickerComponent },
    { name: 'cascader', component: CascaderWrapperComponent },
    { name: 'rangeSlider', component: RangInputsComponent },

    //   {
    //     name: 'select', component: FormlyFieldSelect,
    //     defaultOptions: {
    //       props: {
    //         options: []
    //       }
    //     }
    //   },

  ],
  // validationMessages: [
  //   { name: 'required', message: 'This field is required' },
  // ],
  wrappers: [
    { name: 'form-field-horizontal', component: FormlyHorizontalWrapper },
    { name: 'formly-vertical-wrapper', component: FormlyVerticalWrapper },
    { name: 'formly-vertical-theme-wrapper', component: FormlyVerticalThemeWrapper },
    { name: 'floating_filled', component: FormlyFloatComponent },
    { name: 'floating_outlined', component: FormlyFloatComponent },
    { name: 'floating_standard', component: FormlyFloatComponent },

  ]
};
