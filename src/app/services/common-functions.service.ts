import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { actionTypeFeild, formFeildData } from '../builder/configurations/configuration.modal';
import { BuilderClickButtonService } from '../builder/service/builderClickButton.service';
import { GenaricFeild } from '../models/genaricFeild.modal';
import { TreeNode } from '../models/treeNode';
import { Guid } from '../models/guid';
import { DataSharedService } from './data-shared.service';
import { htmlTabsData } from '../builder/ControlList';
import { INITIAL_EVENTS } from '../shared/event-utils/event-utils';
import { ConfigurationFunctionService } from '../builder/configurations/configuration-function.service';

@Injectable({
  providedIn: 'root'
})
export class CommonFunctionService {
  htmlTabsData = htmlTabsData;

  constructor(
    private clickButtonService: BuilderClickButtonService,
    private dataSharedService: DataSharedService,
    private _configurationFunctionService: ConfigurationFunctionService
  ) { }
  textJsonObj = {
    parameter: 'input',
    icon: 'uil uil-text',
    label: 'Input',
    type: 'input',
    fieldType: 'input',
    configType: 'input',
    treeExpandIcon: 'fa-regular fa-t',
    treeInExpandIcon: 'fa-regular fa-t',
    isLeaf: true
  };
  textJson() {
    return this.textJsonObj;
  }
  menuOpenConfig(currentNode: any, parent?: any) {
    let fieldData: any;
    let _formFieldData = new formFeildData(this._configurationFunctionService);
    const excludedKeys = ['tooltipWithoutIcon', 'className', 'tooltipPosition'];

    if (_formFieldData.commonOtherConfigurationFields[0].fieldGroup) {
      _formFieldData.commonOtherConfigurationFields[0].fieldGroup = _formFieldData.commonOtherConfigurationFields[0].fieldGroup.filter(
        (item: any) => !excludedKeys.includes(item.key)
      );
    }

    const obj = {
      title: currentNode.title ? currentNode.title : currentNode.id,
      data: _formFieldData.commonOtherConfigurationFields
    }
    const selectedNode = currentNode
    fieldData = new GenaricFeild({
      type: currentNode.type,
      commonData: [obj],
    });
    let configObj: any = {
      id: selectedNode.id as string,
      key: selectedNode.key.toLowerCase(),
      title: selectedNode.title
    };
    switch (currentNode.type) {
      case "input":
        configObj = { ...configObj, ...this.clickButtonService.getMenuAttributeConfig(selectedNode) };
        this.addIconCommonConfiguration(_formFieldData.menufield, true);
        if (parent) {
          if (parent) {
            if (_formFieldData.menufield[0].fieldGroup) {
              _formFieldData.menufield[0].fieldGroup = _formFieldData.menufield[0].fieldGroup.filter(item => item.key !== 'isTitle');
            }
          }
        }

        fieldData.commonData?.push({ title: 'Menu Fields', data: _formFieldData.menufield });
        break;
      case "tabs":
        configObj = { ...configObj, ...this.clickButtonService.getMenutab(selectedNode) };
        fieldData.commonData?.push({ title: 'Menu Builder Tab Fields', data: _formFieldData.menuBuilderTabFields });

        break;
      case "mainTab":
        configObj = { ...configObj, ...this.clickButtonService.getMainDashonicTabsConfig(selectedNode) };
        fieldData.commonData?.push({ title: 'Main Tab Fields', data: _formFieldData.mainTabFields });
        break;
      case "dropdown":
        configObj = { ...configObj, ...this.clickButtonService.getDropDownAttributeConfig(selectedNode) };
        fieldData.commonData?.push({ title: 'Menu Builder Dropdown Feilds', data: _formFieldData.menuBuilderDropdownFeilds });
        break;
      case "pages":
        configObj = { ...configObj, ...this.clickButtonService.getPagesAttributeConfig(selectedNode) };
        fieldData.commonData?.push({ title: 'Menu Builder Pages Feilds', data: _formFieldData.menuBuilderPagesFeilds });
        break;
      case "buttons":
        configObj = { ...configObj, ...this.clickButtonService.getButtonAttributeConfig(selectedNode) };
        fieldData.commonData?.push({ title: 'Menu Builder Button Feilds', data: _formFieldData.menuBuilderButtonFeilds });
        break;
    }
    const formModalData = configObj;
    return { fieldData, formModalData };
  }
  addIconCommonConfiguration(configurationFields: any, allowIcon?: boolean) {
    const formFieldData = new formFeildData(this._configurationFunctionService);
    const commonIconFields: any = formFieldData.commonIconFields[0].fieldGroup;
    if (commonIconFields.length > 0) {
      commonIconFields.forEach((element: any) => {
        const excludedKeys = ['badgeType', 'badgeCount', 'dot_ribbon_color', 'iconSize', 'iconColor', 'hoverIconColor', 'iconClass'];
        if (element.key !== 'icon' || allowIcon) {
          if (!excludedKeys.includes(element.key)) {
            configurationFields[0].fieldGroup.unshift(element);
          }
        }
      });
    }
  }

  clickButton(currentNode: any, applicationThemeClasses?: any[], validationFieldData?: GenaricFeild, joiValidationData?: TreeNode[], nodes?: any, formlyTypes?: any) {
    let fieldData: any;
    let _formFieldData = new formFeildData(this._configurationFunctionService);
    if ((_formFieldData.commonFormlyConfigurationFields[0].fieldGroup || _formFieldData.commonOtherConfigurationFields[0].fieldGroup) && applicationThemeClasses?.length) {
      let newArray = applicationThemeClasses.filter((a: any) => a.tag?.toLowerCase().includes(currentNode.type?.toLowerCase()));
      const transformedArray = newArray.map((item: any) => ({
        label: item.name,
        value: item.classes
      }));
      this.setOptionsForFieldGroup(_formFieldData.commonFormlyConfigurationFields[0].fieldGroup, 'applicationThemeClasses', transformedArray);
      this.setOptionsForFieldGroup(_formFieldData.commonOtherConfigurationFields[0].fieldGroup, 'applicationThemeClasses', transformedArray);
    }
    const validationObj = {
      title: currentNode.title ? currentNode.title : currentNode.id,
      data: _formFieldData.inputValidationRuleFields
    }
    validationFieldData = new GenaricFeild({
      type: 'inputValidationRule',
      title: currentNode.title ? currentNode.title : currentNode.id,
      commonData: [validationObj]
    });
    if (joiValidationData && joiValidationData?.length > 0) {
      const selectedValidationRule: any = joiValidationData?.find(
        (a) => a?.data?.json?.cid === currentNode.id
      );
      const getJoiRule = selectedValidationRule ? selectedValidationRule?.data?.json : null;
      if (getJoiRule) {
        getJoiRule['id'] = selectedValidationRule.id;
        // if (typeof getJoiRule?.emailtypeallow === 'string') {
        //   getJoiRule.emailtypeallow = getJoiRule.emailtypeallow ? (getJoiRule.emailtypeallow.includes(',') ? getJoiRule.emailtypeallow.split(',') : [getJoiRule.emailtypeallow]) : []
        // }
        validationFieldData.modelData = getJoiRule;
      }
    }
    let veriableOptions: any[] = [];
    if (nodes?.[0]?.options) {
      for (let index = 0; index < nodes[0].options.length; index++) {
        const element = nodes[0].options[index];
        veriableOptions.push({
          label: element.VariableName,
          value: element.VariableName,
        });
      }
    }
    if (_formFieldData.commonIconFields[0].fieldGroup) {
      const fieldGroup =
        _formFieldData.commonFormlyConfigurationFields[0].fieldGroup || [];
      _formFieldData.commonIconFields[0].fieldGroup.forEach((element) => {
        if (
          _formFieldData.commonFormlyConfigurationFields[0].fieldGroup &&
          element.key != 'icon' &&
          element.key != 'badgeType' &&
          element.key != 'badgeCount' &&
          element.key != 'dot_ribbon_color'
        ) {
          fieldGroup.push(element);
        }
      });
      // fieldGroup.push({
      //   key: 'className',
      //   type: 'multiselect',
      //   className: 'w-full',
      //   wrappers: ['formly-vertical-theme-wrapper'],
      //   props: {
      //     multiple: true,
      //     label: 'CSS ClassName',
      //     options: [
      //       {
      //         label: 'w-1/2',
      //         value: 'w-1/2',
      //       },
      //       {
      //         label: 'w-1/3',
      //         value: 'w-1/3',
      //       },
      //       {
      //         label: 'w-2/3',
      //         value: 'w-2/3',
      //       },
      //       {
      //         label: 'w-1/4',
      //         value: 'w-1/4',
      //       },
      //       {
      //         label: 'w-3/4',
      //         value: 'w-3/4',
      //       },
      //       {
      //         label: 'w-full',
      //         value: 'w-full',
      //       },
      //       {
      //         label: 'w-auto',
      //         value: 'w-auto',
      //       },
      //       {
      //         label: 'w-screen',
      //         value: 'w-screen',
      //       },
      //       {
      //         label: 'sm:w-1/2',
      //         value: 'sm:w-1/2',
      //       },
      //       {
      //         label: 'md:w-1/3',
      //         value: 'md:w-1/3',
      //       },
      //       {
      //         label: 'lg:w-2/3',
      //         value: 'lg:w-2/3',
      //       },
      //       {
      //         label: 'xl:w-1/4',
      //         value: 'xl:w-1/4',
      //       },
      //       {
      //         label: 'text-gray-500',
      //         value: 'text-gray-500',
      //       },
      //       {
      //         label: 'text-red-600',
      //         value: 'text-red-600',
      //       },
      //       {
      //         label: 'text-blue-400',
      //         value: 'text-blue-400',
      //       },
      //       {
      //         label: 'text-green-500',
      //         value: 'text-green-500',
      //       },
      //       {
      //         label: 'text-yellow-300',
      //         value: 'text-yellow-300',
      //       },
      //       {
      //         label: 'bg-gray-200',
      //         value: 'bg-gray-200',
      //       },
      //       {
      //         label: 'bg-blue-500',
      //         value: 'bg-blue-500',
      //       },
      //       {
      //         label: 'bg-green-300',
      //         value: 'bg-green-300',
      //       },
      //       {
      //         label: 'bg-yellow-200',
      //         value: 'bg-yellow-200',
      //       },
      //       {
      //         label: 'p-4',
      //         value: 'p-4',
      //       },
      //       {
      //         label: 'pt-6',
      //         value: 'pt-6',
      //       },
      //       {
      //         label: 'ml-2',
      //         value: 'ml-2',
      //       },
      //       {
      //         label: 'mr-8',
      //         value: 'mr-8',
      //       },
      //       {
      //         label: 'my-3',
      //         value: 'my-3',
      //       },
      //       {
      //         label: 'flex',
      //         value: 'flex',
      //       },
      //       {
      //         label: 'justify-center',
      //         value: 'justify-center',
      //       },
      //       {
      //         label: 'items-center',
      //         value: 'items-center',
      //       },
      //     ],
      //     additionalProperties: {
      //       allowClear: true,
      //       serveSearch: true,
      //       showArrow: true,
      //       showSearch: true,
      //       selectType: 'tags',
      //       maxCount: 6,
      //     },
      //   },
      // });
      // _formFieldData.commonFormlyConfigurationFields[0].fieldGroup = fieldGroup;
    }

    const filteredFields: any =
      _formFieldData.commonFormlyConfigurationFields[0].fieldGroup;
    const getVar = filteredFields.filter((x: any) => x.key == 'getVariable');
    const index = filteredFields.indexOf(getVar[0]);
    // if (_formFieldData.commonOtherConfigurationFields[0].fieldGroup) {
    //   _formFieldData.commonOtherConfigurationFields[0].fieldGroup[index].props!.options = veriableOptions;
    //   _formFieldData.commonOtherConfigurationFields[0].fieldGroup[index + 1].props!.options;
    // }
    if (_formFieldData.commonFormlyConfigurationFields[0].fieldGroup) {
      _formFieldData.commonFormlyConfigurationFields[0].fieldGroup[
        index
      ].props!.options = veriableOptions;
      _formFieldData.commonFormlyConfigurationFields[0].fieldGroup[
        index + 1
      ].props!.options = veriableOptions;
    }

    const selectedNode = currentNode;
    let configObj: any;
    if (Array.isArray(selectedNode.className)) {
      selectedNode.className = selectedNode.className.join(' ');
    }
    configObj = selectedNode;
    // let newClass = selectedNode.className;
    selectedNode.id = selectedNode.id?.toLowerCase();
    // currentNode.className = newClass;
    // selectedNode.className = newClass;
    // configObj = JSON.parse(JSON.stringify(selectedNode));
    const obj = {
      title: selectedNode.title ? selectedNode.title : selectedNode.id,
      data: _formFieldData.commonOtherConfigurationFields
    }
    fieldData = new GenaricFeild({
      type: currentNode.type,
      commonData: [obj]
    });

    switch (currentNode.type) {
      case 'drawer':
        this.addIconCommonConfiguration(_formFieldData.drawerFields, false);
        // fieldData.formData = _formFieldData.drawerFields;
        fieldData.commonData?.push({ title: 'Drawer', data: _formFieldData.drawerFields });
        break;
      case 'cardWithComponents':
        fieldData.commonData?.push({ title: 'Card Fields', data: _formFieldData.cardWithComponentsFields });
        fieldData.mappingConfig = _formFieldData.mappingFields;
        fieldData.mappingNode = currentNode;
        break;
      case 'icon':
        fieldData.commonData?.push({ title: 'Icon Fields', data: _formFieldData.commonIconFields });
        break;
      case 'qrcode':
        fieldData.commonData?.push({ title: 'Qr Code Fields', data: _formFieldData.qrCodeFeilds });
        break;
      case 'anchor':
        fieldData.commonData?.push({ title: 'Anchor Fields', data: _formFieldData.anchorFields });
        break;
      case 'treeSelect':
        fieldData.commonData?.push({ title: 'Tree Select Fields', data: _formFieldData.treeSelectFields });
        break;
      case 'taskManager':
        configObj = {
          ...configObj,
          ...this.clickButtonService.getGridConfig(selectedNode),
        };
        fieldData.commonData?.push({ title: 'Tree Select Fields', data: _formFieldData.taskManagerFileds });
        break;
      case 'headerLogo':
        fieldData.commonData?.push({ title: 'Header Logo Fields', data: _formFieldData.headerLogoFields });
        break;
      case 'treeView':
        fieldData.commonData?.push({ title: 'Tree View Fields', data: _formFieldData.treeviewFields });
        break;
      case 'cascader':
        this.addIconCommonConfiguration(_formFieldData.cascaderFields, true);
        fieldData.commonData?.push({ title: 'Cascader Fields', data: _formFieldData.cascaderFields });
        // delete configObj.options;
        break;
      case 'tree':
        this.addIconCommonConfiguration(_formFieldData.treeFields, false);
        fieldData.commonData?.push({ title: 'TreeFields', data: _formFieldData.treeFields });
        break;
      case 'htmlBlock':
        fieldData.commonData?.push({ title: 'Html Block Fields', data: _formFieldData.htmlBlockFields });
        break;
      case 'modal':
        this.addIconCommonConfiguration(_formFieldData.modalFields, false);
        fieldData.commonData?.push({ title: 'Modal Fields', data: _formFieldData.modalFields });
        break;
      case 'transfer':
        configObj = {
          ...configObj,
          ...this.clickButtonService.getTransferConfig(selectedNode),
        };
        fieldData.commonData?.push({ title: 'Transfer Fields', data: _formFieldData.transferFields });
        break;
      case 'gridList':
        configObj = {
          ...configObj,
          ...this.clickButtonService.getGridConfig(selectedNode),
        };
        fieldData.commonData?.push({ title: 'Grid Fields', data: _formFieldData.gridFields }, { title: 'Table', data: _formFieldData.gridFields_Table },
          { title: 'Table header', data: _formFieldData.gridFields_th }, { title: 'Table rows', data: _formFieldData.gridFields_td }, { title: 'Style Property', data: _formFieldData.gridFields_StyleProperty }, { title: 'Drawer', data: _formFieldData.gridFields_Drawer }
          , { title: 'Heading', data: _formFieldData.gridFields_Heading }, { title: 'Options', data: _formFieldData.gridFieldsOptions }

        );
        break;
      case 'comment':
        fieldData.commonData?.push({ title: 'Comment Fields', data: _formFieldData.commentFields });
        break;
      case 'rate':
        if (!configObj.options[0].label) {
          configObj.options = configObj.options.map((option: any) => ({
            label: option,
          }));
        }
        this.addIconCommonConfiguration(_formFieldData.rateFields, true);
        fieldData.commonData?.push({ title: 'Rate Fields', data: _formFieldData.rateFields });
        break;
      case 'skeleton':
        fieldData.commonData?.push({ title: 'Skeleton Fields', data: _formFieldData.skeletonFields });
        break;
      case 'badge':
        this.addIconCommonConfiguration(_formFieldData.badgeFields, false);
        fieldData.commonData?.push({ title: 'Badge Fields', data: _formFieldData.badgeFields });
        break;
      case 'mentions':
        fieldData.commonData?.push({ title: 'Mentions Fields', data: _formFieldData.mentionsFields });
        break;
      case 'empty':
        fieldData.commonData?.push({ title: 'Empty Fields', data: _formFieldData.emptyFields });
        break;
      case 'segmented':
        fieldData.commonData?.push({ title: 'Segmented Fields', data: _formFieldData.segmentedFields });
        break;
      case 'statistic':
        configObj.options =  selectedNode.statisticArray
        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getStatisticConfig(selectedNode),
        // };
        this.addIconCommonConfiguration(_formFieldData.statisticFields, true);
        fieldData.commonData?.push({ title: 'Statistic Fields', data: _formFieldData.statisticFields });
        break;
      case 'tag':
        this.addIconCommonConfiguration(_formFieldData.nzTagFields, false);
        fieldData.commonData?.push({ title: 'Tag Fields', data: _formFieldData.nzTagFields });
        break;
      case 'message':
        fieldData.commonData?.push({ title: 'Message Fields', data: _formFieldData.messageFields });
        break;
      case 'notification':
        this.addIconCommonConfiguration(
          _formFieldData.notificationFields,
          true
        );
        fieldData.commonData?.push({ title: 'Notification Fields', data: _formFieldData.notificationFields });
        break;
      case 'list':
        fieldData.commonData?.push({ title: 'List Fields', data: _formFieldData.listFields });
        break;
      case 'description':
        fieldData.commonData?.push({ title: 'Description Fields', data: _formFieldData.descriptionFields });
        break;
      case 'descriptionChild':
        fieldData.commonData?.push({ title: 'Description Child Fields', data: _formFieldData.descriptionChildFields });
        break;
      case 'affix':
        fieldData.commonData?.push({ title: 'Affix Fields', data: _formFieldData.affixFields });
        break;
      case 'backTop':
        this.addIconCommonConfiguration(_formFieldData.backtopFields, true);
        fieldData.commonData?.push({ title: 'Backtop Fields', data: _formFieldData.backtopFields });
        break;
      case 'avatar':
        fieldData.commonData?.push({ title: 'Avatar Fields', data: _formFieldData.avatarFields });
        break;
      case 'popOver':
        fieldData.commonData?.push({ title: 'Pop Over Fields', data: _formFieldData.popOverFields });
        break;
      case 'popConfirm':
        fieldData.commonData?.push({ title: 'Pop Confirm Fields', data: _formFieldData.popOverFields });
        break;
      case 'result':
        fieldData.commonData?.push({ title: 'Result Fields', data: _formFieldData.resultFields });
        break;
      case 'spin':
        fieldData.commonData?.push({ title: 'Spin Fields', data: _formFieldData.spinFields });
        break;
      case 'imageUpload':
        fieldData.commonData?.push({ title: 'Image Upload Feilds', data: _formFieldData.imageUploadFeilds });
        break;
      case 'toastr':
        fieldData.commonData?.push({ title: 'Toastr Feilds', data: _formFieldData.toastrFeilds });
        break;
      case 'invoice':
        // configObj = { ...configObj, ...this.clickButtonService.getinvoiceConfig(selectedNode) };
        fieldData.commonData?.push({ title: 'Invoice Feilds', data: _formFieldData.invoiceFeilds });
        break;
      // case 'rangeSlider':
      //   this.addIconCommonConfiguration(_formFieldData.rangeSliderFeilds, true);
      //   fieldData.commonData?.push({ title: 'Range Slider Feilds', data: _formFieldData.rangeSliderFeilds });
      //   break;
      case 'inputGroupGrid':
        fieldData.commonData?.push({ title: 'Input Group Grid Feilds', data: _formFieldData.inputGroupGridFeilds });
        break;
      case 'card':
        fieldData.commonData?.push({ title: 'Card Fields', data: _formFieldData.cardFields });
        break;
      case 'chat':
        fieldData.commonData?.push({ title: 'Chat Fields', data: _formFieldData.chatFields });
        break;
      case 'calender':
        fieldData.commonData?.push({ title: 'Tui Calendar Feilds', data: _formFieldData.tuiCalendarFeilds });
        break;
      // case 'multiFileUpload':
      //   fieldData.formData = _formFieldData.multiFileUploadFeilds;
      //   break;
      case 'switch':
        fieldData.commonData?.push({ title: 'Switch Feilds', data: _formFieldData.switchFeilds });
        break;
      case 'tabs':
        this.addIconCommonConfiguration(_formFieldData.tabsFields, true);
        fieldData.commonData?.push({ title: 'Tabs Fields', data: _formFieldData.tabsFields });
        fieldData.mappingConfig = _formFieldData.mappingFields;
        fieldData.mappingNode = currentNode;
        break;
      case 'kanban':
        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getGridConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Kanban Feilds', data: _formFieldData.kanbanFeilds });
        break;
      case 'kanbanTask':
        fieldData.commonData?.push({ title: 'Kanban Task Feilds', data: _formFieldData.kanbanTaskFeilds });
        break;
      case 'mainTab':
        fieldData.commonData?.push({ title: 'MainTab Fields', data: _formFieldData.mainTabFields });
        break;
      case 'progressBar':
        fieldData.commonData?.push({ title: 'Progress Bar Fields', data: _formFieldData.progressBarFields });
        break;
      case 'divider':
        this.addIconCommonConfiguration(_formFieldData.dividerFeilds, true);
        fieldData.commonData?.push({ title: 'Divider Feilds', data: _formFieldData.dividerFeilds });
        break;
      case 'video':
        fieldData.commonData?.push({ title: 'Videos Feilds', data: _formFieldData.videosFeilds });
        break;
      case 'audio':
        fieldData.commonData?.push({ title: 'Audio Feilds', data: _formFieldData.audioFeilds });
        break;
      case 'carouselCrossfade':
        fieldData.commonData?.push({ title: 'Carousel Crossfade Feilds', data: _formFieldData.carouselCrossfadeFeilds });
        break;
      case 'alert':
        this.addIconCommonConfiguration(_formFieldData.alertFeilds, true);
        fieldData.commonData?.push({ title: 'Aert Feilds', data: _formFieldData.alertFeilds });
        break;
      case 'timeline':

        this.addIconCommonConfiguration(_formFieldData.timelineFeilds, false);
        if (_formFieldData.timelineFeilds[0].fieldGroup) {
          _formFieldData.timelineFeilds[0].fieldGroup = _formFieldData.timelineFeilds[0].fieldGroup.filter(item => item.key !== 'iconClass');
        }
        fieldData.commonData?.push({ title: 'Timeline Feilds', data: _formFieldData.timelineFeilds });
        break;
      case 'simpleCardWithHeaderBodyFooter':
        fieldData.commonData?.push({ title: 'Simple Card With Header Body Footer Feilds', data: _formFieldData.simpleCardWithHeaderBodyFooterFeilds });

        break;
      case 'div':
        fieldData.mappingConfig = _formFieldData.mappingFields;
        fieldData.commonData?.push({ title: 'Div Fields', data: _formFieldData.divFields });
        fieldData.mappingNode = currentNode;
        break;
      case 'timelineChild':
        fieldData.mappingConfig = _formFieldData.mappingFields;
        this.addIconCommonConfiguration(_formFieldData.timelineChildFeilds, true);
        fieldData.commonData?.push({ title: 'Timeline child fileds', data: _formFieldData.timelineChildFeilds });
        fieldData.mappingNode = currentNode;
        break;
      case 'mainDiv':
        fieldData.commonData?.push({ title: 'Main DivFields', data: _formFieldData.mainDivFields });
        break;
      case 'heading':
        fieldData.commonData?.push({ title: 'Heading Fields', data: _formFieldData.headingFields });
        break;
      case 'paragraph':
        this.addIconCommonConfiguration(_formFieldData.paragraphFields, false);
        fieldData.commonData?.push({ title: 'Paragraph Fields', data: _formFieldData.paragraphFields });
        break;
      case 'tags':
      case 'repeatSection':
      case 'multiselect':
      // case "tag":
      case 'search':
      case 'radiobutton':
      case 'checkbox':
      case 'datetime':
      case 'time':
      case 'timepicker':
      case 'date':
      case 'month':
      case 'year':
      case 'decimal':
      case 'week':
      case 'color':
      case 'input':
      case 'email':
      case 'inputGroup':
      case 'image':
      case 'textarea':
      case 'telephone':
      case 'autoComplete':
      case 'number':
      case 'url':
      case 'customMasking':
      case 'multiFileUploader':
      case 'audioVideoRecorder':
      case 'image':
      case 'signaturePad':
      case 'rangeSlider':
        configObj = {
          ...configObj,
          ...this.clickButtonService.getFormlyConfig(selectedNode),
        };
        _formFieldData?.commonFormlyConfigurationFields[0]?.fieldGroup?.forEach(
          (configField: any) => {
            if (configField.key == 'formlyTypes') {
              configField.props.options = formlyTypes;
            }
          }
        );
        if (currentNode.type == 'year' || currentNode.type == 'month') {
          let formlyData: any = _formFieldData?.commonFormlyConfigurationFields[0]?.fieldGroup;
          formlyData.push({
            key: 'disabledCalenderProperties',
            type: 'select',
            className: "w-full sm:w-full md:w-1/2 lg:w-1/2 xl:w-1/2",
            wrappers: ["formly-vertical-theme-wrapper"],
            props: {
              label: 'Disabled',
              options: [
                {
                  label: "Disabled before current",
                  value: "disabledBeforeCurrent"
                },
                {
                  label: "Disabled After Current",
                  value: "disabledAfterCurrent"
                },
                {
                  label: "Disabled both",
                  value: "disabledBoth"
                },
              ],
              additionalProperties: {
                allowClear: true,
                serveSearch: false,
                showArrow: true,
                showSearch: true,
              },
            },
          })
        }
        fieldData.commonData = [];
        const obj = {
          title: 'test',
          data: _formFieldData.commonFormlyConfigurationFields
        }

        fieldData.commonData?.push(obj);
        switch (currentNode.type) {
          case 'signaturePad':
            fieldData.commonData?.push({ title: 'Signature Pad Fields', data: _formFieldData.signaturePad });
            break;
          case 'search':
            fieldData.commonData?.push({ title: 'Select Fields', data: _formFieldData.selectFields });
            break;
          case 'radiobutton':
          case 'checkbox':
            fieldData.commonData?.push({ title: 'Radio Fields', data: _formFieldData.radioFields });
            break;
          case 'color':
            fieldData.commonData?.push({ title: 'Color Fields', data: _formFieldData.colorFields });
            break;
          case 'autoComplete':
            fieldData.commonData?.push({ title: 'Auto Complete Fields', data: _formFieldData.autoCompleteFields });
            break;
          case 'date':
            fieldData.commonData?.push({ title: 'Zorro Date Fields', data: _formFieldData.zorroDateFields });
            break;
          case 'number':
            fieldData.commonData?.push({ title: 'Number Fields', data: _formFieldData.numberFields });
            break;
          case 'image':
            fieldData.commonData?.push({ title: 'File Upload', data: _formFieldData.fileUpload });
            break;
          case 'repeatSection':
          case 'multiselect':
            fieldData.commonData?.push({ title: 'Zorro Select Fields', data: _formFieldData.zorroSelectFields });
            break;
          case 'timepicker':
            fieldData.commonData?.push({ title: 'Zorro Time Fields', data: _formFieldData.zorroTimeFields });
            break;
          case 'customMasking':
            fieldData.commonData?.push({ title: 'Custom Masking Fields', data: _formFieldData.customMaskingFields });
            break;
          case 'multiFileUploader':
            fieldData.commonData?.push({ title: 'Multi File Upload Feilds', data: _formFieldData.multiFileUploadFeilds });
            break;
          case 'rangeSlider':
            fieldData.commonData?.push({ title: 'Range Slider Feilds', data: _formFieldData.rangeSliderFeilds });
            // fieldData.commonData?.push({ title: 'Multi File Upload Feilds', data: _formFieldData.multiFileUploadFeilds });
            break;
        }
        break;
      case 'button':
      case 'downloadButton':
        // configObj = { ...configObj, ...this.clickButtonService.getButtonConfig(selectedNode) };
        // if (typeof selectedNode.buttonClass === "string") {
        //   const classObj = JSON.parse(JSON.stringify(selectedNode.buttonClass.split(" ")));
        //   configObj.buttonClass = classObj
        // }
        configObj.icon = selectedNode.btnIcon;

        const buttonFields = _formFieldData.buttonFields;

        if (buttonFields[0]?.fieldGroup) {
          const nodesTable = this.findArrayByType(nodes[0], 'gridList');

          const modifiedOptions = nodesTable.map((a: any) => ({
            label: a.title,
            value: a.key,
          }));

          const targetObject: any = buttonFields[0].fieldGroup.find((item: any) => item.key === 'detailSaveGrid');

          if (targetObject) {
            targetObject.props.options = modifiedOptions;
          }
        }

        this.addIconCommonConfiguration(_formFieldData.buttonFields, true);
        fieldData.commonData?.push({ title: 'Button Fields', data: _formFieldData.buttonFields }, { title: 'Button Drawer Fields', data: _formFieldData.buttonDrawerFields });
        break;
      case 'dropdownButton':
        // if (typeof selectedNode.buttonClass === "string") {
        //   const classObj = JSON.parse(JSON.stringify(selectedNode.buttonClass.split(" ")));
        //   configObj.buttonClass = classObj
        // }
        // (configObj.icon = selectedNode.btnIcon),
        //   (configObj.options = selectedNode.dropdownOptions);
        // configObj = { ...configObj, ...this.clickButtonService.getDropdownButtonConfig(selectedNode) };
        this.addIconCommonConfiguration(
          _formFieldData.dropdownButtonFields,
          true
        );
        configObj.icon = selectedNode.btnIcon;
        configObj.options = selectedNode.dropdownOptions;
        fieldData.commonData?.push({ title: 'Dropdown Button Fields', data: _formFieldData.dropdownButtonFields });
        break;
      case 'accordionButton':
        this.addIconCommonConfiguration(
          _formFieldData.accordionButtonFields,
          true
        );
        fieldData.commonData?.push({ title: 'Accordion Button Fields', data: _formFieldData.accordionButtonFields });
        break;
      case 'contactList':
        this.addIconCommonConfiguration(
          _formFieldData.contactListFields,
          true
        );
        fieldData.commonData?.push({ title: 'Contact List Fields', data: _formFieldData.contactListFields });
        break;
      case 'linkbutton':
        // if (typeof selectedNode.buttonClass === "string") {
        //   const classObj = JSON.parse(JSON.stringify(selectedNode.buttonClass.split(" ")));
        //   configObj.buttonClass = classObj
        // }
        // configObj = { ...configObj, ...this.clickButtonService.getLinkButtonConfig(selectedNode) };
        (configObj.icon = selectedNode.btnIcon),
          this.addIconCommonConfiguration(
            _formFieldData.linkButtonFields,
            true
          );
        fieldData.commonData?.push({ title: 'Link Button Fields', data: _formFieldData.linkButtonFields });
        break;
      case 'buttonGroup':
        fieldData.commonData?.push({ title: 'Button Group Fields', data: _formFieldData.buttonGroupFields });
        break;
      case 'page':
        fieldData.commonData?.push({ title: 'Page Fields', data: _formFieldData.pageFields });
        break;
      case 'pageHeader':
        fieldData.commonData?.push({ title: 'Page Header Fields', data: _formFieldData.pageHeaderFields });
        break;
      case 'pageBody':
        break;
      case 'pageFooter':
        fieldData.commonData?.push({ title: 'Page Footer Fields', data: _formFieldData.pageFooterFields });
        break;
      case 'sections':
        configObj = {
          ...configObj,
          ...this.clickButtonService.getSectionConfig(selectedNode),
        };
        fieldData.commonData?.push({ title: 'Sections Fields', data: _formFieldData.sectionsFields });
        fieldData.mappingConfig = _formFieldData.mappingFields;
        fieldData.mappingNode = currentNode;

        break;
      case 'header':
        configObj = {
          ...configObj,
          ...this.clickButtonService.headerConfig(selectedNode),
        };
        fieldData.commonData?.push({ title: 'Header Fields', data: _formFieldData.headerFields });
        break;
      case 'footer':
        fieldData.commonData?.push({ title: 'Footer Fields', data: _formFieldData.footerFields });
        break;
      case 'body':
        fieldData.commonData?.push({ title: 'Body Fields', data: _formFieldData.bodyFields });
        break;
      case 'step':
        this.addIconCommonConfiguration(_formFieldData.stepperFields, true);
        fieldData.commonData?.push({ title: 'Stepper Fields', data: _formFieldData.stepperFields });
        fieldData.mappingConfig = _formFieldData.mappingFields;
        fieldData.mappingNode = currentNode;

        break;
      case 'mainStep':
        fieldData.commonData?.push({ title: 'Main Stepper Fields', data: _formFieldData.mainStepperFields });

        break;
      case 'listWithComponents':
        fieldData.commonData?.push({ title: 'List With Components Fields', data: _formFieldData.listWithComponentsFields });
        break;
      case 'listWithComponentsChild':
        fieldData.commonData?.push({ title: 'List With Components Child Fields', data: _formFieldData.listWithComponentsChildFields });
        fieldData.mappingConfig = _formFieldData.mappingFields;
        fieldData.mappingNode = currentNode;
        break;
      case 'tabsMain':
        configObj = {
          ...configObj,
          ...this.clickButtonService.getMainTabsConfig(selectedNode),
        };
        fieldData.commonData?.push({ title: 'Main Tab Fields', data: _formFieldData.mainTabFields });
        break;
      case 'barChart':
        let getBarChartConfig: any = this.clickButtonService.getBarChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getBarChartConfig) {
          configObj[key] = getBarChartConfig[key]
        }
        fieldData.commonData?.push({ title: 'Bar Chart Fields', data: _formFieldData.barChartFields });
        break;
      case 'pieChart':
        //Don't use in function and return because it cant't work properly in this so use like that
        configObj['is3D'] = selectedNode?.options.is3D;
        configObj['pieHole'] = selectedNode?.options.pieHole;
        configObj['pieStartAngle'] = selectedNode?.options.pieStartAngle;
        configObj['sliceVisibilityThreshold'] = selectedNode?.options.sliceVisibilityThreshold;
        configObj['lengendPositition'] = selectedNode?.options.legend.position;
        configObj['titleAlignment'] = selectedNode?.options.legend.alignment;
        fieldData.commonData?.push({ title: 'Pie Chart Fields', data: _formFieldData.pieChartFields });
        break;
      case 'bubbleChart':
        let getBubbleChartConfig: any = this.clickButtonService.getBubbleChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getBubbleChartConfig) {
          configObj[key] = getBubbleChartConfig[key]
        }
        fieldData.commonData?.push({ title: 'Bubble Chart Fields', data: _formFieldData.bubbleChartFields });
        break;
      case 'candlestickChart':
        fieldData.commonData?.push({ title: 'Candlestick Chart Fields', data: _formFieldData.candlestickChartFields });
        break;
      case 'columnChart':
        fieldData.commonData?.push({ title: 'Column Chart Fields', data: _formFieldData.columnChartFields });
        break;
      case 'ganttChart':
        let getGanttChartConfig: any = this.clickButtonService.getGanttChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getGanttChartConfig) {
          configObj[key] = getGanttChartConfig[key]
        }
        // fieldData.commonData?.push({ title: 'Gantt Chart Fields', data: _formFieldData.ganttChartFields });
        fieldData.commonData?.push({ title: 'Gantt Chart Fields', data: _formFieldData.ganttChartFieldsV2 });
        break;
      case 'geoChart':
        let getGeoChartConfig: any = this.clickButtonService.getGeoChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getGeoChartConfig) {
          configObj[key] = getGeoChartConfig[key]
        }

        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getGeoChartConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Geo Chart Fields', data: _formFieldData.geoChartFields });
        break;
      case 'histogramChart':
        let getHistogramChartConfig: any = this.clickButtonService.getHistogramChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getHistogramChartConfig) {
          configObj[key] = getHistogramChartConfig[key]
        }
        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getHistogramChartConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Histogram Char tFields', data: _formFieldData.histogramChartFields });
        break;
      case 'treeMapChart':
        let gettreeMapChartConfig: any = this.clickButtonService.gettreeMapChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in gettreeMapChartConfig) {
          configObj[key] = gettreeMapChartConfig[key]
        }
        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.gettreeMapChartConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Tree Map Chart Fields', data: _formFieldData.treeMapChartFields });
        break;
      case 'tableChart':
        fieldData.commonData?.push({ title: 'Table Chart Fields', data: _formFieldData.tableChartFields });
        break;
      case 'lineChart':
        let getLineChartConfig: any = this.clickButtonService.getLineChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getLineChartConfig) {
          configObj[key] = getLineChartConfig[key]
        }
        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getLineChartConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Line Chart Fields', data: _formFieldData.lineChartFields });
        break;
      case 'sankeyChart':
        fieldData.commonData?.push({ title: 'Sankey Chart Fields', data: _formFieldData.sankeyChartFields });
        break;
      case 'scatterChart':
        let getScatterChartConfig: any = this.clickButtonService.getScatterChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getScatterChartConfig) {
          configObj[key] = getScatterChartConfig[key]
        }
        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getScatterChartConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Scatter Chart Fields', data: _formFieldData.scatterChartFields });
        break;
      case 'areaChart':
        let getAreaChartConfig: any = this.clickButtonService.getAreaChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getAreaChartConfig) {
          configObj[key] = getAreaChartConfig[key]
        }

        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getAreaChartConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Area Chart Fields', data: _formFieldData.areaChartFields });
        break;
      case 'comboChart':
        let getComboChartConfig: any = this.clickButtonService.getComboChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getComboChartConfig) {
          configObj[key] = getComboChartConfig[key]
        }
        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getComboChartConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Combo Chart Fields', data: _formFieldData.comboChartFields });
        break;
      case 'steppedAreaChart':
        let getSteppedAreaChartConfig: any = this.clickButtonService.getSteppedAreaChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getSteppedAreaChartConfig) {
          configObj[key] = getSteppedAreaChartConfig[key]
        }
        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getSteppedAreaChartConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Stepped Area Chart Fields', data: _formFieldData.steppedAreaChartFields });
        break;
      case 'timelineChart':
        let getTimelineChartConfig: any = this.clickButtonService.getTimelineChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getTimelineChartConfig) {
          configObj[key] = getTimelineChartConfig[key]
        }
        // configObj = {
        //   ...configObj,
        //   ...this.clickButtonService.getTimelineChartConfig(selectedNode),
        // };
        fieldData.commonData?.push({ title: 'Stepped Area Chart Fields', data: _formFieldData.steppedAreaChartFields });
        break;
      case 'fileManager':

        fieldData.commonData?.push({ title: 'File Manager Fileds', data: _formFieldData.fileManagerFields });
        break;
      case 'buildermenu':

        fieldData.commonData?.push({ title: 'Builder Menu Fileds', data: _formFieldData.builderMenuFields }, { title: 'Builder Icons', data: _formFieldData.menuIconOptions });
        break;
      default:
        break;
    }
    switch (currentNode.type) {
      case 'comboChart':
      case 'barChart':
      case 'pieChart':
      case 'bubbleChart':
      case 'candlestickChart':
      case 'columnChart':
      case 'ganttChart':
      case 'geoChart':
      case 'histogramChart':
      case 'treeMapChart':
      case 'tableChart':
      case 'lineChart':
      case 'sankeyChart':
      case 'scatterChart':
      case 'areaChart':
      case 'steppedAreaChart':
      case 'timelineChart':
        let getTimelineChartConfig: any = this.clickButtonService.commonChartConfig(selectedNode);
        //Don't use in function and return because it cant't work properly in this so use like that
        for (const key in getTimelineChartConfig) {
          configObj[key] = getTimelineChartConfig[key]
        }

        fieldData.commonData?.push({ title: 'Chart Fields', data: _formFieldData.commonChartsFields });

    }
    const formModalData = configObj;
    return { formModalData, validationFieldData, fieldData }

  }
  setOptionsForFieldGroup(fieldGroup: any, key: string, options: any): void {
    if (fieldGroup) {
      fieldGroup.forEach((element: any) => {
        if (element?.key === key) {
          element.props.options = options;
        }
      });
    }
  }
  findArrayByType(data: any, type: any): any[] {
    let results: any[] = [];

    if (data && data.type && type) {
      if (data.type === type) {
        results.push(data);
      }

      if (data.children.length > 0) {
        for (let child of data.children) {
          let childResults: any[] = this.findArrayByType(child, type);
          results = results.concat(childResults);
        }
      }
    }

    return results;
  }

  getControls(apiRes: any, controlName: any, navigation: any, applicationThemeClasses: any[], selectedNode: any) {
    let findControl: any = '';
    findControl = apiRes.find((a: any) => a.name == controlName);
    let response = this.jsonParseWithObject(findControl.controljson);
    if (findControl) {
      let obj = {
        type: findControl?.name,
        title: findControl?.name,
        key: findControl?.name.toLowerCase() + '_' + Guid.newGuid(),
        isSubmit: false,
      };
      if (findControl?.name === 'input') {
        obj.title = this.textJsonObj?.label;
        obj.key = this.textJsonObj?.configType.toLowerCase() + '_' + Guid.newGuid();
      }
      let newNode = this.createControl(response, findControl.name == 'input' ? this.textJsonObj : null, findControl.name, response, obj, findControl?.name, navigation, applicationThemeClasses, selectedNode)
      return newNode;
    }
  }
  jsonParseWithObject(data: any) {
    return JSON.parse(data, (key, value) => {
      if (typeof value === 'string' && value.startsWith('(') && value.includes('(model)')) {
        return eval(`(${value})`);
      }
      return value;
    });
  }
  createControl(response: any, data: any, value: any, res: any, obj: any, type: any, navigation: any, applicationThemeClasses: any[], selectedNode: any) {
    const findThemeClass = applicationThemeClasses?.find(a => a.tag == value);
    let newNode: any = {};
    let formlyId = navigation + '_' + value.toLowerCase() + '_' + Guid.newGuid();
    if (data?.parameter === 'input') {
      newNode = {
        ...response,
        key: res?.key ? res.key : obj.key,
        id: formlyId,
        className: this.columnApply(value),
        expanded: true,
        type: value,
        title: res?.title ? res.title : obj.title,
        children: [],
        tooltip: '',
        hideExpression: false,
        highLight: false,
        copyJsonIcon: false,
        treeExpandIcon: data?.treeExpandIcon,
        treeInExpandIcon: data?.treeInExpandIcon,
        isLeaf: true,
        apiUrl: '',
      }
      newNode.type = data?.configType;
      newNode.formlyType = data?.parameter;
      newNode.title = res?.title ? res.title : obj.title;
      newNode.formly[0].fieldGroup[0].key = res?.key ? res.key : obj.key;
      newNode.formly[0].fieldGroup[0].type = data?.type;
      newNode.formly[0].fieldGroup[0].id = formlyId.toLowerCase();
      newNode.formly[0].fieldGroup[0].wrappers = this.getLastNodeWrapper(selectedNode, 'wrappers');
      newNode.formly[0].fieldGroup[0].props.additionalProperties.wrapper = this.getLastNodeWrapper(selectedNode, 'configWrapper');
      newNode.formly[0].fieldGroup[0].props.type = data?.fieldType;
      newNode.formly[0].fieldGroup[0].props.label = res?.title ? res.title : obj.title;
      newNode.formly[0].fieldGroup[0].props.placeholder = data?.label;
      newNode.formly[0].fieldGroup[0].props.maskString = data?.maskString;
      newNode.formly[0].fieldGroup[0].props.maskLabel = data?.maskLabel;
      newNode.formly[0].fieldGroup[0].props.applicationThemeClasses = findThemeClass?.classes;
      newNode.formly[0].fieldGroup[0].props.options = this.makeFormlyOptions(data?.options, data.type);
      newNode.formly[0].fieldGroup[0].props.keyup = (model: any) => {
        let currentVal = model.formControl.value;
        // this.formlyModel[model.key] = model.formControl.value;
        // this.checkConditionUIRule(model, currentVal);
      };
    }
    else {
      newNode = {
        ...response, // Spread the properties from response
        key: res?.key ? res.key : obj.key,
        id: navigation + '_' + value.toLowerCase() + '_' + Guid.newGuid(),
        className: this.columnApply(value),
        expanded: true,
        type: type,
        title: res?.title ? res.title : obj.title,
        children: [],
        tooltip: '',
        tooltipIcon: 'question-circle',
        hideExpression: false,
        highLight: false,
        copyJsonIcon: false,
        treeExpandIcon: data?.treeExpandIcon,
        treeInExpandIcon: data?.treeInExpandIcon,
        applicationThemeClasses: findThemeClass?.classes
      };
    }
    return newNode;
  }
  makeFormlyOptions(option: any, type: any) {
    if (!option) {
      return [];
    }

    const baseData = [
      { label: 'option1', value: '1' },
      { label: 'option2', value: '2' },
      { label: 'option3', value: '3' },
    ];

    if (type === 'checkbox') {
      return [{ ...baseData[0], width: 'w-1/2' }];
    } else if (type === 'radio') {
      return baseData.map(item => ({ ...item, width: 'w-1/2' }));
    }

    return baseData;
  }
  getLastNodeWrapper(selectedNode: any, dataType?: string) {
    let wrapperName: any = ['form-field-horizontal'];
    let wrapper: any = 'form-field-horizontal';
    let disabledProperty: any;
    const filteredNodes = this.filterInputElements(selectedNode);
    for (let index = 0; index < filteredNodes.length; index++) {
      wrapperName = filteredNodes[index].formly
        ?.at(0)
        ?.fieldGroup?.at(0)?.wrappers;
      wrapper = filteredNodes[index].formly?.at(0)?.fieldGroup?.at(0)
        ?.wrappers[0];
      disabledProperty = filteredNodes[index].formly?.at(0)?.fieldGroup?.at(0)
        ?.props?.disabled;
      break;
    }
    if (dataType == 'wrappers') {
      return wrapperName;
    } else if (dataType == 'disabled') {
      return disabledProperty;
    } else if (dataType == 'configWrapper') {
      return wrapper;
    }
  }
  filterInputElements(data: any): any[] {
    const inputElements: any[] = [];

    function traverse(obj: any): void {
      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          traverse(item);
        });
      } else if (typeof obj === 'object' && obj !== null) {
        if (obj.formlyType === 'input') {
          inputElements.push(obj);
        }
        Object.values(obj).forEach((value) => {
          traverse(value);
        });
      }
    }

    traverse(data);
    return inputElements;
  }
  columnApply(value: any) {
    if (
      value == 'sections' ||
      value == 'calender' ||
      value == 'mainStep' ||
      value == 'mainTab' ||
      value == 'kanban' ||
      value == 'timeline' ||
      value == 'gridList' ||
      value == 'accordionButton' ||
      value == 'contactList' ||
      value == 'fileManager' ||
      value == 'header' ||
      value == 'email' ||
      value == 'email-template'
    )
      return 'w-full';
    else if (value == 'body') return 'px-6 pt-6 pb-10';
    else if (value == 'footer') return '';
    else if (value == 'buttonGroup') return 'w-11/12';
    else return 'sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2';
  }

  traverseAndChange(node: any, navigation: any) {
    if (node) {
      node = this.changeIdAndkey(node, navigation);
      if (node.children) {
        node.children.forEach((child: any) => {
          this.traverseAndChange(child, navigation);
        });
      }
    }
  }
  changeIdAndkey(node: any, navigation: any) {

    if (node.id) {
      let changeId = node.id.split('_');
      if (changeId.length == 2) {
        node.id = navigation + '_' + changeId[0] + '_' + Guid.newGuid();
      } else {
        node.id = changeId[0] + '_' + changeId[1] + '_' + Guid.newGuid();
      }
    }
    if (node.formly) {
      if (node.formly[0].key) {
        node.formly[0].key = node.formly[0].key.split('_')[0] + '_' + Guid.newGuid();
      }
      if (node.key) {
        node.key = node.key.split('_')[0] + '_' + Guid.newGuid();
      }
      if (node.formly[0].fieldGroup[0].key) {
        node.formly[0].fieldGroup[0].key = node.formly[0].fieldGroup[0].key.split('_')[0] + '_' + Guid.newGuid();
      }
    }
    else if (node.key) {
      if (node.key.includes('_')) {
        node.key = node.key.split('_')[0] + '_' + Guid.newGuid();
      } else {
        node.key = node.key;
      }
    }
    return node;
  }

  initilizaControl(data: any, res: any, formlyId: any, obj: any, value: any, navigation: any) {
    let newNode: any = {};
    if (data?.parameter == 'input') {
      newNode = {
        key: res?.key ? res.key : obj.key,
        id: formlyId,
        className: this.columnApply(value),
        expanded: true,
        type: value,
        title: res?.title ? res.title : obj.title,
        children: [],
        tooltip: '',
        hideExpression: false,
        highLight: false,
        copyJsonIcon: false,
        treeExpandIcon: data?.treeExpandIcon,
        treeInExpandIcon: data?.treeInExpandIcon,
        isLeaf: true,
        apiUrl: '',
      };
    } else {
      newNode = {
        key: res?.key ? res.key : obj.key,
        id: navigation + '_' + value.toLowerCase() + '_' + Guid.newGuid(),
        className: this.columnApply(value),
        expanded: true,
        type: value,
        title: res?.title ? res.title : obj.title,
        children: [],
        tooltip: '',
        tooltipIcon: 'question-circle',
        hideExpression: false,
        highLight: false,
        copyJsonIcon: false,
        treeExpandIcon: data?.treeExpandIcon,
        treeInExpandIcon: data?.treeInExpandIcon,
        isLeaf: data?.isLeaf,
      };
    }
    if (
      value == 'insertButton' ||
      value == 'updateButton' ||
      value == 'deleteButton' ||
      value == 'downloadButton'

    ) {
      newNode['isSubmit'] = res?.isSubmit || false;
    }
    return newNode;
  }
  changeWithGlobalClass(className: any) {
    let matches: any[] = className.match(/\$\S+/g);
    let globalClass: any = '';
    if (matches) {
      if (matches.length > 0 && this.dataSharedService.applicationGlobalClass.length > 0) {
        matches.forEach((classItem: any, index: number) => {
          let splittedName = classItem.split('$')[1];
          let resClass: any = this.dataSharedService.applicationGlobalClass.find((item: any) => item.name.toLocaleLowerCase() == splittedName.toLocaleLowerCase());
          if (resClass) {
            globalClass = globalClass ? globalClass + ' ' + resClass?.class : resClass?.class;
          }
          else if (index == 0) {
            globalClass = '';
          }
        });
      }
    } else {
      globalClass = '';
    }

    return globalClass;
  }
  sectionFormlyConfigApply(formValues: any, fieldGroup: any) {
    if (fieldGroup) {
      if (fieldGroup[0].props) {
        if (formValues.disabled == 'editable') {
          fieldGroup[0].props.disabled = false;
        } else if (
          formValues.disabled == 'disabled' ||
          formValues.disabled == 'disabled-But-ditable'
        ) {
          fieldGroup[0].props.disabled = true;
        }
        fieldGroup[0].props['additionalProperties']['status'] =
          formValues.status;
        fieldGroup[0].props['additionalProperties']['size'] = formValues.size;
        if (formValues.sectionClassName) {
          fieldGroup[0].props.className = formValues.sectionClassName;
          fieldGroup[0].className = formValues.sectionClassName;
        }
        if (formValues.wrappers) {
          if (fieldGroup[0].props['additionalProperties']['wrapper'] != formValues.wrappers) {
            if (formValues.wrappers == 'formly-vertical-theme-wrapper') {
              fieldGroup[0].props['additionalProperties']['wrapperLabelClass'] = 'w-1/3 py-2 col-form-label relative column-form-label'
              fieldGroup[0].props['additionalProperties']['wrapperInputClass'] = 'w-2/3 column-form-input form-control-style v-body-border'
            }
            if (formValues.wrappers == 'form-field-horizontal') {
              fieldGroup[0].props['additionalProperties']['wrapperLabelClass'] = ''
              fieldGroup[0].props['additionalProperties']['wrapperInputClass'] = '';
            }
            if (formValues.wrappers == 'formly-vertical-wrapper') {
              fieldGroup[0].props['additionalProperties']['wrapperLabelClass'] = 'label-style relative col-form-label pl-1'
              fieldGroup[0].props['additionalProperties']['wrapperInputClass'] = 'mt-1 pl-2'
            }
          }
          fieldGroup[0].wrappers = [formValues.wrappers];
          fieldGroup[0].props['additionalProperties']['wrapper'] = [formValues.wrappers][0];
          if (formValues.wrappers == 'floating_filled' || formValues.wrappers == 'floating_outlined' || formValues.wrappers == 'floating_standard') {
            fieldGroup[0].props['additionalProperties']['size'] = 'default';
            fieldGroup[0].props['additionalProperties']['addonRight'] = '';
            fieldGroup[0].props['additionalProperties']['addonLeft'] = '';
            fieldGroup[0].props['additionalProperties']['prefixicon'] = '';
            fieldGroup[0].props['additionalProperties']['suffixicon'] = '';
            fieldGroup[0].props.placeholder = " ";
          }
          if (formValues.wrappers == 'floating_filled') {
            fieldGroup[0].props['additionalProperties']['floatFieldClass'] =
              '!block !rounded-t-lg !px-2.5 !pb-2.5 !pt-5 !w-full !text-sm !text-gray-900 !bg-gray-50 dark:!bg-gray-700 !border-0 !border-b-2 !border-gray-300 !appearance-none dark:!text-white dark:!border-gray-600 dark:!focus:border-blue-500 focus:!outline-none focus:!ring-0 focus:!border-blue-600 peer floating-filled-label add';
            fieldGroup[0].props['additionalProperties']['floatLabelClass'] =
              '!absolute !text-sm !text-gray-500 dark:!text-gray-400 !duration-300 !transform !-translate-y-4 !scale-75 !top-4 !z-10 !origin-[0] !left-2.5 peer-focus:!text-blue-600 peer-focus:!dark:text-blue-500 peer-placeholder-shown:!scale-100 peer-placeholder-shown:!translate-y-0 peer-focus:!scale-75 peer-focus:!-translate-y-4  floating-filled-field';
          } else if (formValues.wrappers == 'floating_outlined') {
            fieldGroup[0].props['additionalProperties']['floatFieldClass'] =
              '!block !px-2.5 !pb-2.5 !pt-4 !w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border-1 !border-gray-300 !appearance-none dark:!text-white dark:!border-gray-600 dark:!focus:border-blue-500 focus:!outline-none focus:!ring-0 focus:!border-blue-600 !peer';
            fieldGroup[0].props['additionalProperties']['floatLabelClass'] =
              '!absolute !text-sm !text-gray-500 dark:!text-gray-400 !duration-300 !transform -!translate-y-4 !scale-75 !top-2 !z-10 !origin-[0] !bg-white dark:!bg-gray-900 !px-2 peer-focus:!px-2 peer-focus:!text-blue-600 peer-focus:!dark:text-blue-500 peer-placeholder-shown:!scale-100 peer-placeholder-shown:!-translate-y-1/2 peer-placeholder-shown:!top-1/2 peer-focus:!top-2 peer-focus:!scale-75 peer-focus:!-translate-y-4 !left-1';
          } else if (formValues.wrappers == 'floating_standard') {
            fieldGroup[0].props['additionalProperties']['floatFieldClass'] =
              'floting-standerd-input !block !py-2.5 !px-0 !w-full !text-sm !text-gray-900 !bg-transparent !border-0 !border-b-2 !border-gray-300 !appearance-none dark:!text-white dark:!border-gray-600 dark:!focus:border-blue-500 focus:!outline-none focus:!ring-0 focus:!border-blue-600 !peer floating-standerd-label';
            fieldGroup[0].props['additionalProperties']['floatLabelClass'] =
              '!absolute !text-sm !text-gray-500 dark:!text-gray-400 !duration-300 !transform -!translate-y-6 !scale-75 !top-3 -!z-10 !origin-[0] peer-focus:!left-0 peer-focus:!text-blue-600 peer-focus:!dark:text-blue-500 peer-placeholder-shown:!scale-100 peer-placeholder-shown:!translate-y-0 peer-focus:!scale-75 peer-focus:!-translate-y-6 floating-standerd-field';
          }
        }
        fieldGroup[0].props['additionalProperties']['labelPosition'] =
          formValues.labelPosition;

        fieldGroup[0].props['additionalProperties']['formatAlignment'] =
          formValues.formatAlignment;
        fieldGroup[0].props['additionalProperties']['borderRadius'] =
          formValues.borderRadius;
        fieldGroup[0].props['additionalProperties']['tooltipIcon'] =
          formValues.tooltipIcon;
        fieldGroup[0].props['additionalProperties']['border'] =
          formValues.borderLessInputs;
        fieldGroup[0].props['additionalProperties']['labelClassName'] =
          formValues.inputLabelClassName;
      }
    }
    return fieldGroup;
  }
  updateIdsAndKeys(obj: any, navigation: any) {
    let updatedObj = { ...obj };
    updatedObj = this.changeIdAndkey(updatedObj, navigation);

    if (updatedObj.children && Array.isArray(updatedObj.children)) {
      updatedObj.children = updatedObj.children.map((child: any) =>
        this.updateIdsAndKeys(child, navigation)
      );
    }
    return updatedObj;
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
    const typeMap: any = this.dataSharedService.typeMap;
    const type = node.type;
    const key = value.componentKey ? value.componentKey : typeMap[type];

    switch (node.type) {
      case 'avatar':
        if (Array.isArray(replaceData[value.defaultValue])) {
          return replaceData[value.defaultValue].map((src: any) => {
            const newNode = JSON.parse(JSON.stringify(node));
            newNode.src = src;
            return newNode;
          });
        }
        break;
      case 'tag':
        if (Array.isArray(replaceData[value.defaultValue])) {
          node.options = replaceData[value.defaultValue];
          return node;
        }
        break;
      case 'pieChart':
        node[key] = JSON.parse(replaceData[value.defaultValue]);
        return node;
      case 'barChart':
        node.columnNames = JSON.parse(replaceData.columnnames);
        node[key] = JSON.parse(replaceData[value.defaultValue]);
        node.colors = replaceData.colors ? JSON.parse(replaceData.colors) : node.colors;
        node.options.colors = replaceData.colors ? JSON.parse(replaceData.colors) : node.colors;
        return node;
      default:
        if (key) {
          node[key] = replaceData[value.defaultValue];
        }
        return node;
    }
  }
  replaceObjectByKey(data: any, key: any, updatedObj: any) {
    try {
      if (data.key == 'div_e514b6e5') {
        console.log(data.key)
      }
      if (data.key === key) {
        return updatedObj;
      }
      for (let i = 0; i < data.children.length; i++) {
        const child = data.children[i];
        if (child) {
          if (child.key === key) {
            if (Array.isArray(updatedObj) && child.type == 'avatar') {
              let check = data.children.filter((a: any) => a.type == 'avatar');
              if (check.length != 1) {
                // let getFirstAvatar = JSON.parse(JSON.stringify(check[0]));
                let deleteAvatar = check.length - 1;
                for (let index = 0; index < deleteAvatar; index++) {
                  const element = data.children.filter(
                    (a: any) => a.type == 'avatar'
                  );
                  const idx = data.children.indexOf(element[0]);
                  data.children.splice(idx as number, 1);
                }
                let lastAvatarIndex = data.children.filter(
                  (a: any) => a.type == 'avatar'
                );
                let idx = data.children.indexOf(lastAvatarIndex[0]);
                data.children.splice(idx, 1);
                updatedObj.forEach((i: any) => {
                  data.children.splice(idx + 1, 0, i);
                  idx = idx + 1;
                });
              } else {
                let lastAvatarIndex = data.children.filter(
                  (a: any) => a.type == 'avatar'
                );
                let idx = data.children.indexOf(lastAvatarIndex[0]);
                data.children.splice(idx, 1);
                updatedObj.forEach((i: any) => {
                  data.children.splice(idx + 1, 0, i);
                  idx = idx + 1;
                });
              }
            } else {
              if (updatedObj) {
                data.children[i] = updatedObj;
              }
            }
            return data;
          }
          const result = this.replaceObjectByKey(child, key, updatedObj);
          if (result !== null) {
            return data;
          }
        }
      }
      return null;
    } catch (error) {
      console.log(error)
    }

  }

  findFormlyTypeObj(node: any, type: any) {
    if (node) {
      if (node.parameter == 'input' && node.type == type.split('_')[0] && node.configType == type.split('_')[1] && node.fieldType == type.split('_')[2]) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        for (let child of node.children) {
          let result: any = this.findFormlyTypeObj(child, type);
          if (result) {
            return result;
          }
        }
      }
    }
  }
  findObjectByTypeBase(data: any, type: any) {
    if (data) {
      if (data.type && type) {
        if (data.type === type) {
          return data;
        }
        if (data.children.length > 0) {
          for (let child of data.children) {
            let result: any = this.findObjectByTypeBase(child, type);
            if (result !== null) {
              return result;
            }
          }
        }
        return null;
      }
    }
  }

  notifyEmit(event: actionTypeFeild, selectedNode: any, screenbuilderid: string, applicationid: string, screenname: string, formlyModel: any) {
    let needToUpdate = true;
    let dynamicSection = false;
    let dynamicSectionValue: any;
    let formlyUpdate = false;
    let inputValidationRule = false;
    let JOIData: any;
    if (event?.form?.className) {
      if (event.form.className.includes('$')) {
        selectedNode['appGlobalClass'] = this.changeWithGlobalClass(event.form.className);
      } else {
        selectedNode['appGlobalClass'] = ''
      }
    } else {
      selectedNode['appGlobalClass'] = ''
    }
    if (event?.form?.innerClass || event?.form?.iconClass) {
      if (event.form?.innerClass) {
        if (event.form?.innerClass.includes('$')) {
          selectedNode['appGlobalInnerClass'] = this.changeWithGlobalClass(event.form?.innerClass);
        } else {
          selectedNode['appGlobalInnerClass'] = '';
        }
      }
      else if (event.form?.iconClass) {
        if (event.form?.iconClass.includes('$')) {
          selectedNode['appGlobalInnerIconClass'] = this.changeWithGlobalClass(event.form?.iconClass);
        }
        else {
          selectedNode['appGlobalInnerIconClass'] = '';
        }
      }
      else {
        selectedNode['appGlobalInnerClass'] = '';
      }
    }
    else {
      selectedNode['appGlobalInnerIconClass'] = '';
      selectedNode['appGlobalInnerClass'] = '';
    }


    switch (event.type) {
      // case 'rangeSlider':
      //   document.documentElement.style.setProperty('--slider-color', event.form.color ? event.form.color : '#91d5ff');
      //   break;
      case 'body':
        // selectedNode = this.api(event.form.api, selectedNode);
        break;
      case 'drawer':
        selectedNode['notvisible'] = event.form.notvisible;
        break;
      case 'sections':
      case 'tabs':
      case 'step':
      case 'div':
      case 'listWithComponentsChild':
      case 'cardWithComponents':
      case 'timelineChild':
        if (selectedNode.id) {
          if (event.type == 'tabs') {
            selectedNode['disabled'] = event.form.disabled;
          }
          else if (event.type == 'div') {
            selectedNode['rowClass'] = event.form.rowClass;
            selectedNode['componentMapping'] = event.form.componentMapping;
            selectedNode['image'] = event.form.image;
            selectedNode['imageSrc'] = event.form.imageSrc;
            // if (event.form.imageSrc) {
            //   selectedNode.imageSrc = event.form.imageSrc;
            // } else {
            //   selectedNode.imageSrc = this.dataSharedService.imageUrl;
            // }
            // this.dataSharedService.imageUrl = '';
            if (event.form.divRepeat > 0) {
              dynamicSection = true;
              dynamicSectionValue = { nodesNumber: event.form.nodes, subType: 'step', mainType: 'mainStep' };
            }
          }
          else if (event.type == 'sections') {
            if (Array.isArray(event.form.className)) {
              if (event.form.className.length > 0) {
                let classArray: any;
                for (let i = 0; i < event.form.className.length; i++) {
                  if (i == 0) {
                    classArray = event.form.className[i];
                  }
                  else {
                    classArray = classArray + ' ' + event.form.className[i];
                  }
                };
                selectedNode['className'] = classArray;
              }
            }
            else {
              selectedNode['className'] = event.form.className;
            }
            const filteredNodes = this.filterInputElements(
              selectedNode?.children?.[1]?.children
            );
            filteredNodes.forEach((node) => {
              if (event.form.sectionClassName) {
                if (event.form?.sectionClassName.includes('$')) {
                  node['appGlobalInnerIconClass'] = this.changeWithGlobalClass(event.form.sectionClassName);
                } else {
                  node['appGlobalInnerIconClass'] = '';
                }
                node.className = event.form.sectionClassName;
              } else {
                node['appGlobalInnerIconClass'] = '';
              }
              node.formly[0].fieldGroup = this.sectionFormlyConfigApply(
                event.form,
                node.formly[0].fieldGroup
              );
            });
            selectedNode?.children?.[1]?.children?.forEach((element: any) => {
              if (!element.formly) {
                element['tooltipIcon'] = event.form.tooltipIcon;
              }
            });

            selectedNode.title = event.form.title;
            // selectedNode.className = event.form.className;
            selectedNode.tooltip = event.form.tooltip;
            selectedNode['tooltipWithoutIcon'] =
              event.form.tooltipWithoutIcon;
            selectedNode.hideExpression = event.form.hideExpression;
            selectedNode['id'] = event.form?.id;
            selectedNode['key'] = event.form?.key;
            selectedNode.sectionClassName = event.form.sectionClassName;
            selectedNode.sectionDisabled = event.form.disabled;
            selectedNode.borderColor = event.form.borderColor;
            selectedNode.labelPosition = event.form.labelPosition;
            selectedNode.repeatable = event.form.repeatable;
            selectedNode.size = event.form.size;
            selectedNode.status = event.form.status;
            selectedNode.formatAlignment = event.form.formatAlignment;
            selectedNode.isBordered = event.form.isBordered;
            selectedNode['borderRadius'] = event.form.borderRadius;
            selectedNode['tooltipIcon'] = event.form.tooltipIcon;
            selectedNode['rowClass'] = event.form.rowClass;
            selectedNode['borderLessInputs'] = event.form.borderLessInputs;
            selectedNode['inputLabelClassName'] = event.form.inputLabelClassName;
            // const filteredCascader = this.findObjectByTypeBase(selectedNode?.children?.[1] , 'cascader');
            // if (selectedNode['borderRadius'] && filteredCascader) {
            //   filteredCascader['borderRadius'] = selectedNode['borderRadius']
            //   document.documentElement.style.setProperty('--cascaderBorderRadius', selectedNode['borderRadius']);
            //   this.cdr.detectChanges();
            // }


            if (selectedNode.children) {
              selectedNode.children[1]['rowClass'] = event.form.rowClass;
            }
            if (selectedNode.wrappers != event.form.wrappers) {
              selectedNode.wrappers = event.form.wrappers;
              // this.clickBack();
            }
            if (event.form.inputLabelClassName) {
              if (selectedNode['inputLabelClassName'] != event.form.inputLabelClassName) {
                // this.clickBack();
              }
            }
            // if(selectedNode.size && filteredCascader){
            //   filteredCascader['size']= selectedNode.size;
            // }
          }
          // selectedNode['checkData'] =
          //   selectedNode.checkData == undefined
          //     ? ''
          //     : selectedNode.checkData;
          // let check = this.arrayEqual(
          //   selectedNode.checkData,
          //   event.tableDta == undefined
          //     ? event.tableDta
          //     : selectedNode.tableBody
          // );
          if (selectedNode?.checkData) {
            selectedNode.checkData = [];
          }
          if (event.tableDta && event.tableDta?.length > 0) {
            const item = selectedNode.dbData[0];
            let newNode: any = {};
            if (
              event.type == 'tabs' ||
              event.type == 'step' ||
              event.type == 'div' ||
              event.type == 'listWithComponentsChild' ||
              event.type == 'cardWithComponents' ||
              event.type == 'timelineChild'
            ) {
              newNode = JSON.parse(
                JSON.stringify(selectedNode?.children)
              );
            }
            else {
              newNode = JSON.parse(
                JSON.stringify(
                  selectedNode?.children?.[1]?.children?.[0]
                )
              );
            }
            if (
              event.type == 'tabs' ||
              event.type == 'step' ||
              event.type == 'div' ||
              event.type == 'timelineChild' ||
              event.type == 'listWithComponentsChild' ||
              event.type == 'cardWithComponents'
            ) {
              if (event.tableDta) {
                event.tableDta.forEach((element: any) => {
                  if (newNode.length) {
                    newNode.forEach((j: any) => {
                      const keyObj = this.findObjectByKey(
                        j,
                        element.fileHeader
                      );
                      if (keyObj && element.defaultValue) {
                        const updatedObj = this.dataReplace(
                          keyObj,
                          item,
                          element
                        );
                        j = this.replaceObjectByKey(
                          j,
                          keyObj.key,
                          updatedObj
                        );
                      }
                    });
                  }
                });
              }
            }
            else if (
              event.type != 'tabs' &&
              event.type != 'step' &&
              event.type != 'div' &&
              event.type != 'timelineChild' &&
              event.type != 'listWithComponentsChild' &&
              event.type != 'cardWithComponents'
            ) {
              if (event.tableDta) {
                event.tableDta.forEach((element: any) => {
                  const keyObj = this.findObjectByKey(
                    newNode,
                    element.fileHeader
                  );
                  if (keyObj && element.defaultValue) {
                    const updatedObj = this.dataReplace(
                      keyObj,
                      item,
                      element
                    );
                    newNode = this.replaceObjectByKey(
                      newNode,
                      keyObj.key,
                      updatedObj
                    );
                  }
                });
              }
            }
            // const { selectedNode } = this;
            if (selectedNode && selectedNode.children) {
              if (
                event.type == 'tabs' ||
                event.type == 'step' ||
                event.type == 'div' ||
                event.type == 'timelineChild' ||
                event.type == 'listWithComponentsChild' ||
                event.type == 'cardWithComponents'
              ) {
                selectedNode.children = newNode;
              } else if (selectedNode.children[1]) {
                selectedNode.children[1].children = newNode
                  ? [newNode]
                  : [];
              }
              // this.updateNodes();
            }
            // this.updateNodes();
          }
          // if (event.dbData) {
          //   selectedNode.dbData = event.dbData;
          // }
          selectedNode.tableBody = event.tableDta ? event.tableDta : selectedNode.tableBody;
          selectedNode.mapApi = event.form.mapApi;
          // if (event.tableDta) {
          //   selectedNode.checkData = JSON.parse(
          //     JSON.stringify(event.tableDta)
          //   );
          // }
          if (selectedNode.tableBody.length > 0) {
            selectedNode.tableBody = selectedNode.tableBody.map((mapping: any) => {
              return {
                ...mapping,
                'SelectQBOField': []
              }
            });
            selectedNode['tableHeader'] = [];
            selectedNode.tableKey = [];
          }
          // this.updateNodes();
        }
        break;

      case 'anchor':
      case 'mentions':
      case 'treeSelect':
      case 'tree':
      case 'treeView':
      // case 'cascader':
      //   // if (event.tableDta) {
      //   //   selectedNode.nodes = event.tableDta;
      //   // }
      //   if (event.form.nodes) {
      //     selectedNode.nodes = event.form.nodes;
      //   }
      //   if (event.form.api) {
      //     this.requestSubscription = this.builderService
      //       .genericApis(event.form.api)
      //       .subscribe({
      //         next: (res) => {
      //           switch (event.type) {
      //             case 'anchor':
      //             case 'mentions':
      //               selectedNode.options = res;
      //               break;
      //             case 'treeSelect':
      //             case 'tree':
      //             case 'treeView':
      //             case 'cascader':
      //               selectedNode.nodes = res;
      //               break;
      //             case 'transfer':
      //               selectedNode.list = res;
      //               break;
      //             default:
      //               break;
      //           }
      //           this.updateNodes();
      //         },
      //         error: (err) => {
      //           console.error(err); // Log the error to the console
      //           this.toastr.error('An error occurred', { nzDuration: 3000 }); // Show an error message to the user
      //         },
      //       });
      //   }
      //   break;
      case 'mainTab':
        document.documentElement.style.setProperty('--selected-tab-color', event.form?.selectedTabColor || 'red');
        dynamicSection = true;
        dynamicSectionValue = { nodesNumber: event.form.nodes, subType: 'tabs', mainType: 'mainTab' };
        break;
      case 'kanban':
        if (event.tableDta) {
          selectedNode['kanlistArray'] = event.tableDta;
        }
        dynamicSection = true;
        dynamicSectionValue = { nodesNumber: event.form.nodes, subType: 'kanbanChild', mainType: 'kanban' };
        break;
      case 'mainStep':
        document.documentElement.style.setProperty('--selected-stepper-color', event.form?.selectedStepperColor || 'red');
        dynamicSection = true;
        dynamicSectionValue = { nodesNumber: event.form.nodes, subType: 'step', mainType: 'mainStep' };
        break;
      case 'taskManager':
        selectedNode['className'] = event.form.className;
        selectedNode['tableHeaders'] = event.form.tableHeaders;
        break;
      case 'listWithComponents':
        dynamicSection = true;
        dynamicSectionValue = { nodesNumber: event.form.nodes, subType: 'listWithComponentsChild', mainType: 'listWithComponents' };
        break;
      case 'mainDiv':
        dynamicSection = true;
        dynamicSectionValue = { nodesNumber: event.form.nodes, subType: 'div', mainType: 'mainDiv' };
        break;
      case 'rate':
        // if (event.tableDta) {
        //   selectedNode.options = event.tableDta.map(
        //     (option: any) => option.label
        //   );
        // }
        // else {
        //   selectedNode.options = selectedNode.options.map(
        //     (option: any) => option.label
        //   );
        // }
        document.documentElement.style.setProperty('--rateSpacing', (event.form.spacing ? event.form.spacing : 8) + 'px');
        if (event.tableDta) {
          selectedNode.options = event.tableDta.map(
            (option: any) => option.label
          );
        } else {
          selectedNode.options = selectedNode.options.map(
            (option: any) => option.label
          );
        }
        break;

      case 'statistic':
        if (event.tableDta) {
          selectedNode.statisticArray = event.tableDta;
        } else {
          selectedNode.statisticArray = selectedNode.statisticArray;
        }
        // selectedNode.statisticArray = event.form.statisticArray;
        break;
      case 'button':
      case 'downloadButton':
      case 'linkbutton':
        // if (Array.isArray(event.form.buttonClass)) {
        //   if (event.form.buttonClass.length > 0) {
        //     let classArray: any;
        //     for (let i = 0; i < event.form.buttonClass.length; i++) {
        //       if (i == 0) {
        //         classArray = event.form.buttonClass[i];
        //       }
        //       else {
        //         classArray = classArray + ' ' + event.form.buttonClass[i];
        //       }
        //     };
        //     selectedNode['buttonClass'] = classArray;
        //   }
        // }
        // else {
        //   selectedNode['buttonClass'] = event.form.buttonClass;
        // }
        selectedNode.btnIcon = event.form?.icon;
        selectedNode['buttonClass'] = event.form?.buttonClass;

        // selectedNode['captureData'] = event.form?.captureData;

        break;
      case 'header':
        selectedNode['headerCollapse'] = event.form?.headerCollapse;
        selectedNode['expandedIconPosition'] = event.form?.expandedIconPosition;
        selectedNode['headingSize'] = event.form?.headingSize;
        selectedNode['backGroundColor'] = event.form?.backGroundColor;
        selectedNode['textColor'] = event.form?.textColor;
        selectedNode['header'] = event.form?.header;
        selectedNode['title'] = event.form?.title;
        selectedNode['className'] = event.form?.className;
        // selectedNode['key'] = event.form?.key;
        // selectedNode['id'] = event.form?.id;
        break;
      case 'accordionButton':
        selectedNode.nzExpandedIcon = event.form?.icon;
        if (event.form?.headerColor) {
          if (selectedNode.style) {
            selectedNode.style['--background'] = event.form?.headerColor;
          } else {
            selectedNode.style = { '--background': event.form.headerColor, };
          }
        }
        break;
      case 'segmented':
      case 'tag':
        if (event.tableDta) {
          selectedNode.options = event.tableDta;
        } else {
          selectedNode.options = selectedNode.options;
        }
        // selectedNode.options = selectedNode.options;
        break;
      case 'select':
      case 'repeatSection':
      case 'multiselect':
      // case "tag":
      case 'search':
      case 'radiobutton':
      case 'checkbox':
      case 'decimal':
      case 'input':
      case 'email':
      case 'inputGroup':
      case 'image':
      case 'telephone':
      case 'textarea':
      case 'time':
      case 'timepicker':
      case 'month':
      case 'year':
      case 'week':
      case 'datetime':
      case 'date':
      case 'color':
      case 'autoComplete':
      case 'number':
      case 'customMasking':
      case 'url':
      case 'multiFileUploader':
      case 'audioVideoRecorder':
      case 'image':
      case 'cascader':
      case 'signaturePad':
      case 'rangeSlider':
        if (selectedNode) {
          needToUpdate = false;

          selectedNode.title = event.form.title;

          selectedNode.apiUrl = event.form.apiUrl;
          selectedNode['key'] = event.form?.key;
          selectedNode['id'] = event.form?.id;
          selectedNode['copyJsonIcon'] = event.form.copyJsonIcon;
          // selectedNode.className = event.form.className;
          selectedNode['tooltip'] = event.form.tooltip;
          selectedNode['tooltipWithoutIcon'] =
            event.form.tooltipWithoutIcon;
          selectedNode.hideExpression = event.form.hideExpression;
          selectedNode.formly?.forEach((elementV1: any) => {
            // MapOperator(elementV1 = currentData);
            const formly = elementV1 ?? {};
            const fieldGroup = formly.fieldGroup ?? [];
            fieldGroup[0].defaultValue = event.form.defaultValue;
            if (fieldGroup[0]['key'] != event.form.key) {
              if (fieldGroup[0] && fieldGroup[0].key) {
                formlyUpdate = true;
                if (formlyModel)
                  formlyModel[event.form.key] =
                    formlyModel[fieldGroup[0]['key'] as string];
              }
            }
            fieldGroup[0]['key'] = event.form.key;
            fieldGroup[0]['hide'] = false;
            const props = fieldGroup[0]?.props ?? {};
            if (event.form.formlyTypes && event.form.formlyTypes != props['additionalProperties']['formlyTypes']) {
              let formlyData = this.findFormlyTypeObj(this.htmlTabsData[0], event.form.formlyTypes)
              if (formlyData['parameter']) {
                selectedNode.type = formlyData.configType;
                selectedNode.formlyType = formlyData.parameter;
                fieldGroup[0]['type'] = formlyData.type;
                props['type'] = formlyData.fieldType;
                props['options'] = this.makeFormlyOptions(
                  formlyData?.options,
                  formlyData.type
                );
                // selectedNode['key'] = event.form.event.form.formlyTypes.configType.toLowerCase() + "_" + Guid.newGuid();
                // selectedNode['id'] = this.screenName + "_" + event.form.event.form.formlyTypes.parameter.toLowerCase() + "_" + Guid.newGuid();
              }
            }

            if (Array.isArray(event.form.className)) {
              if (event.form.className.length > 0) {
                let classArray: string = '';
                for (let i = 0; i < event.form.className.length; i++) {
                  const classObj: string[] = event.form.className[i].split(" ");
                  if (classObj.length > 0) {
                    for (let j = 0; j < classObj.length; j++) {
                      if (j === 0 && i === 0) {
                        classArray = classObj[j];
                      } else {
                        classArray += ' ' + classObj[j];
                      }
                    }
                  }
                }
                selectedNode.className = classArray;
                props['className'] = classArray;
              }
            }
            else {
              props['className'] = event.form.className;
              selectedNode['className'] = event.form.className;
            }

            // if (Array.isArray(event.form.className)) {
            //   if (event.form.className.length > 0) {
            //     let classArray: any;
            //     for (let i = 0; i < event.form.className.length; i++) {
            //       if (i == 0) {
            //         classArray = event.form.className[i];
            //       } else {
            //         classArray = classArray + ' ' + event.form.className[i];
            //       }
            //     }
            //     selectedNode['className'] = classArray;
            //     props['className'] = classArray;
            //   }
            // }
            // else {
            //   props['className'] = event.form.className;
            //   selectedNode['className'] = event.form.className;
            // }
            props.label = event.form.title;
            // props['key'] = event.form.key
            formlyUpdate = true;
            if (formlyModel)
              formlyModel[event.form.key] = event.form.defaultValue
                ? event.form.defaultValue
                : formlyModel[event.form.key];
            props['className'] = event.form.className;
            // props['hideExpression'] = event.form.hideExpression;
            props.placeholder = event.form.placeholder;
            // props['className'] = event.form.className;
            if (event.tableDta) {
              props['options'] = event.tableDta;
            }
            // if (event.form.options) {
            //   props['options'] = event.form.options;
            // }
            // props['options'] = event.form.options
            props['required'] = event.form.required;
            props['apiUrl'] = event.form.apiUrl;
            props['maxLength'] = event.form.maxLength;
            props['minLength'] = event.form.minLength;
            props['disabled'] = event.form.disabled;
            props['additionalProperties']['tooltip'] = event.form.tooltip;
            props['className'] = event.form.className;
            props['additionalProperties']['titleIcon'] = event.form.titleIcon;
            props['maskString'] = event.form.maskString;
            props['masktitle'] = event.form.masktitle;
            props['rows'] = event.form.rows;
            props['additionalProperties']['addonRight'] = event.form.addonRight;
            props['additionalProperties']['addonLeft'] = event.form.addonLeft;
            props['additionalProperties']['prefixicon'] = event.form.prefixicon;
            props['additionalProperties']['suffixicon'] = event.form.suffixicon;
            props['additionalProperties']['border'] = event.form.border;
            props['additionalProperties']['requiredMessage'] =
              event.form.requiredMessage;
            props['additionalProperties']['optionWidth'] =
              event.form.optionWidth;
            props['additionalProperties']['step'] = event.form.step;
            props['additionalProperties']['format'] = event.form.format;
            props['additionalProperties']['allowClear'] = event.form.allowClear;
            props['additionalProperties']['serveSearch'] =
              event.form.serveSearch;
            props['additionalProperties']['showArrow'] = event.form.showArrow;
            props['additionalProperties']['showSearch'] = event.form.showSearch;
            props['additionalProperties']['clearIcon'] = event.form.clearIcon;
            props['additionalProperties']['loading'] = event.form.loading;
            props['additionalProperties']['optionHieght'] =
              event.form.optionHieght;
            props['additionalProperties']['optionHoverSize'] =
              event.form.optionHoverSize;
            props['additionalProperties']['optionDisabled'] =
              event.form.optionDisabled;
            props['additionalProperties']['optionHide'] = event.form.optionHide;
            props['additionalProperties']['firstBtnText'] =
              event.form.firstBtnText;
            props['additionalProperties']['secondBtnText'] =
              event.form.secondBtnText;
            props['additionalProperties']['minuteStep'] = event.form.minuteStep;
            props['additionalProperties']['secondStep'] = event.form.secondStep;
            props['additionalProperties']['hoursStep'] = event.form.hoursStep;
            props['additionalProperties']['use12Hours'] = event.form.use12Hours;
            props['additionalProperties']['icon'] = event.form.icon;
            props['additionalProperties']['tooltipWithoutIcon'] =
              event.form.tooltipWithoutIcon;
            props['additionalProperties']['setVariable'] =
              event.form?.setVariable;
            props['additionalProperties']['getVariable'] =
              event.form?.getVariable;
            props['additionalProperties']['iconSize'] = event.form?.iconSize;
            props['additionalProperties']['iconType'] = event.form?.iconType;
            props['additionalProperties']['iconColor'] = event.form?.iconColor;
            props['additionalProperties']['iconClass'] = event.form?.iconClass;
            props['additionalProperties']['hoverIconColor'] =
              event.form?.hoverIconColor;
            props['additionalProperties']['tooltipPosition'] =
              event.form?.tooltipPosition;
            props['additionalProperties']['toolTipClass'] =
              event.form?.toolTipClass;
            props['additionalProperties']['classesArray'] =
              event.form?.classesArray;
            props['additionalProperties']['selectType'] =
              event.form?.selectType;
            props['additionalProperties']['formlyTypes'] = event.form?.formlyTypes;
            props['additionalProperties']['uploadBtnLabel'] = event.form?.uploadBtnLabel;
            props['additionalProperties']['multiple'] = event.form?.multiple;
            props['additionalProperties']['disabled'] = event.form?.disabled;
            props['additionalProperties']['showDialogueBox'] = event.form?.showDialogueBox;
            props['additionalProperties']['showUploadlist'] = event.form?.showUploadlist;
            props['additionalProperties']['onlyDirectoriesAllow'] = event.form?.onlyDirectoriesAllow;
            props['additionalProperties']['uploadLimit'] = event.form?.uploadLimit;
            props['additionalProperties']['uploadSelectType'] = event.form?.uploadSelectType;
            props['additionalProperties']['fileUploadSize'] = event.form?.fileUploadSize;
            props['additionalProperties']['multiFileUploadTypes'] = event.form?.multiFileUploadTypes;
            props['additionalProperties']['innerInputClass'] = event.form?.innerInputClass;
            props['additionalProperties']['maxMultipleCount'] = event.form?.maxMultipleCount;
            if (event.form?.innerInputClass) {
              if (event.form?.innerInputClass.includes('$')) {
                props['additionalProperties']['appGlobalInnerClass'] = this.changeWithGlobalClass(event.form?.innerInputClass);
              } else {
                props['additionalProperties']['appGlobalInnerClass'] = ''
              }
            } else {
              props['additionalProperties']['appGlobalInnerClass'] = ''
            }
            props['additionalProperties']['InputGroupClass'] = event.form?.InputGroupClass;
            if (event.form?.InputGroupClass) {
              if (event.form?.InputGroupClass.includes('$')) {
                props['additionalProperties']['appGlobalInnerClass'] = this.changeWithGlobalClass(event.form?.InputGroupClass);
              } else {
                props['additionalProperties']['appGlobalInnerClass'] = ''
              }
            } else {
              props['additionalProperties']['appGlobalInnerClass'] = ''
            }
            props['additionalProperties']['dataClassification'] = event.form?.dataClassification;
            // props['additionalProperties']['disabledBeforeCurrent'] = event.form?.disabledBeforeCurrent;
            props['additionalProperties']['disabledCalenderProperties'] = event.form?.disabledCalenderProperties;
            props['additionalProperties']['browserButtonColor'] = event.form?.browserButtonColor;
            props['additionalProperties']['hoverBrowseButtonColor'] = event.form?.hoverBrowseButtonColor;
            props['additionalProperties']['expandTrigger'] = event.form?.expandTrigger;
            props['additionalProperties']['applicationThemeClasses'] = event.form?.applicationThemeClasses;
            props['additionalProperties']['wrapperLabelClass'] = event.form?.wrapperLabelClass;
            props['additionalProperties']['wrapperInputClass'] = event.form?.wrapperInputClass;
            props['additionalProperties']['showAddButton'] = event.form?.showAddButton;
            props['additionalProperties']['signatureClearButtonClass'] = event.form?.signatureClearButtonClass;
            props['additionalProperties']['signatureAddButtonClass'] = event.form?.signatureAddButtonClass;
            props['additionalProperties']['height'] = event.form?.height;
            if (event.form?.browserButtonColor) {
              document.documentElement.style.setProperty('--browseButtonColor', event.form?.browserButtonColor || '#2563EB');
            }
            if (event.form?.hoverBrowseButtonColor) {
              document.documentElement.style.setProperty('--hoverBrowseButtonColor', event.form?.hoverBrowseButtonColor || '#3b82f6');
            }
            props['additionalProperties']['filetype'] = event.form?.filetype;
            props['readonly'] = event.form.readonly;

            if(event.type == 'rangeSlider'){
              props['additionalProperties']['min'] = event.form?.min;
              props['additionalProperties']['max'] = event.form?.max;
              props['additionalProperties']['reverse'] = event.form?.reverse;
              props['additionalProperties']['format'] = event.form?.format;
              props['additionalProperties']['color'] = event.form?.color;
              document.documentElement.style.setProperty('--slider-color', event.form.color ? event.form.color : '#91d5ff');
            }
            // props['options'] = event.form.options;
            // if (event.tableDta) {
            //   props['options'] = event.tableDta;
            // }
            // if (selectedNode.type == "multiselect" && event.form.defaultValue) {
            //   const arr = event.form.defaultValue.split(',');
            //   props['defaultValue'] = arr;
            // } else {
            // }
            // if (event.form.api || event.form?.apiUrl) {
            //   this.requestSubscription = this.applicationService
            //     .getNestCommonAPI(event.form.apiUrl)
            //     .subscribe({
            //       next: (res) => {
            //
            //         if (res?.data?.length > 0) {
            //           let propertyNames = Object.keys(res.data[0]);
            //           let result = res.data.map((item: any) => {
            //             let newObj: any = {};
            //             let propertiesToGet: string[];
            //             if ('id' in item && 'name' in item) {
            //               propertiesToGet = ['id', 'name'];
            //             } else {
            //               propertiesToGet = Object.keys(item).slice(0, 2);
            //             }
            //             propertiesToGet.forEach((prop) => {
            //               newObj[prop] = item[prop];
            //             });
            //             return newObj;
            //           });

            //           let finalObj = result.map((item: any) => {
            //             return {
            //               label: item.name || item[propertyNames[1]],
            //               value: item.id || item[propertyNames[0]],
            //             };
            //           });
            //           props.options = finalObj;
            //         }
            //       },
            //       error: (err) => {
            //         console.error(err); // Log the error to the console
            //         this.toastr.error('An error occurred', {
            //           nzDuration: 3000,
            //         }); // Show an error message to the user
            //       },
            //     });
            // }
          });
          // this.updateNodes();
        }
        break;
      case 'inputValidationRule':

        if (selectedNode) {
          const ruleData = {
            json: {
              "screenbuilderid": screenbuilderid,
              "applicationid": applicationid,
              "screenname": screenname,
              "cid": selectedNode.id,
              "key": selectedNode?.formly?.[0]?.fieldGroup?.[0]?.key,
              "type": event.form.type,
              "label": event.form.label,
              "reference": event.form.reference,
              "minlength": event.form.minlength,
              "maxlength": event.form.maxlength,
              "pattern": event.form.pattern,
              "required": event.form.required,
              "emailtypeallow": event.form?.emailtypeallow,
            }
          }
          const jsonRuleValidation = {
            "screenbuilderid": screenbuilderid,
            "applicationid": applicationid,
            "saveCommit": event.commit,
            "data": JSON.stringify(ruleData)
          }
          JOIData = JSON.parse(JSON.stringify(jsonRuleValidation) || '{}');

        }
        break;
      case 'avatar':
        if (event.form.src) {
          selectedNode.src = event.form.src;
        } else if (this.dataSharedService.imageUrl) {
          selectedNode.src = this.dataSharedService.imageUrl;
        }
        this.dataSharedService.imageUrl = '';
        break;
      case 'imageUpload':
        selectedNode['image'] = event.form.image;
        // if (event.form.source) {
        //   selectedNode.source = event.form.source;
        // } else if (this.dataSharedService.imageUrl) {
        //   selectedNode.source = this.dataSharedService.imageUrl;
        // }
        // this.dataSharedService.imageUrl = '';
        break;
      case 'calender':
        if (selectedNode.id) {
          if (event.form.statusApi != undefined) {
            selectedNode.options = INITIAL_EVENTS;
            // this.requestSubscription = this.builderService.genericApis(event.form.statusApi).subscribe({
            //   next: (res) => {
            //     selectedNode.options = res;
            //     this.updateNodes();
            //   },
            //   error: (err) => {
            //     console.error(err); // Log the error to the console
            //     this.toastr.error("An error occurred", { nzDuration: 3000 }); // Show an error message to the user
            //   }
            // })
          }
        }
        break;
      case 'gridList':
        if (selectedNode.id) {
          if (event.form.formType) {
            if (event.form.formType == 'newTab' && (event.form.routeUrl == '' || event.form.routeUrl == undefined)) {
              alert('plase proide url')
            }
          }

          // selectedNode.sortDirections = event.form.sortDirections
          //   ? JSON.parse(event.form.sortDirections)
          //   : event.form?.sortDirections;
          selectedNode.className = event.form?.className;
          selectedNode.doubleClick = event.form?.doubleClick;
          selectedNode.filterMultiple = event.form?.filterMultiple;
          selectedNode.rowClickApi = event.form?.rowClickApi;
          selectedNode['key'] = event.form?.key;
          selectedNode['id'] = event.form?.id;
          selectedNode['tooltip'] = event.form?.tooltip;
          selectedNode['tooltipWithoutIcon'] = event.form?.tooltipWithoutIcon;
          selectedNode['toolTipClass'] = event.form?.toolTipClass;
          selectedNode['tooltipPosition'] = event.form?.tooltipPosition;
          selectedNode['hideExpression'] = event.form?.hideExpression;
          selectedNode['nzFooter'] = event.form?.nzFooter;
          selectedNode['title'] = event.form?.title;
          selectedNode['nzTitle'] = event.form?.nzTitle;
          selectedNode['nzPaginationPosition'] = event.form?.nzPaginationPosition;
          selectedNode['nzPaginationType'] = event.form?.nzPaginationType;
          selectedNode['nzSize'] = event.form?.nzSize;
          selectedNode['position'] = event.form?.position;
          selectedNode['filterMultiple'] = event.form?.filterMultiple;
          selectedNode['nzBordered'] = event.form?.nzBordered;
          selectedNode['showColumnHeader'] = event.form?.showColumnHeader;
          selectedNode['noResult'] = event.form?.noResult;
          selectedNode['nzShowSizeChanger'] = event.form?.nzShowSizeChanger;
          selectedNode['nzSimple'] = event.form?.nzSimple;
          selectedNode['showCheckbox'] = event.form?.showCheckbox;
          selectedNode['isAddRow'] = event.form?.isAddRow;
          selectedNode['rowClickApi'] = event.form?.rowClickApi;
          selectedNode['nzLoading'] = event.form?.nzLoading;
          selectedNode['nzShowPagination'] = event.form?.nzShowPagination;
          selectedNode['showEditInput'] = event.form?.showEditInput;
          selectedNode['openComponent'] = event.form?.openComponent;
          selectedNode['isDeleteAllow'] = event.form?.isDeleteAllow;
          selectedNode['isAllowGrouping'] = event.form?.isAllowGrouping;
          selectedNode['isAllowExcelReport'] = event.form?.isAllowExcelReport;
          selectedNode['isAllowUploadExcel'] = event.form?.isAllowUploadExcel;
          selectedNode['isAllowSearch'] = event.form?.isAllowSearch;
          selectedNode['tableName'] = event.form?.tableName;
          selectedNode['buttonPositions'] = event.form?.buttonPositions;
          selectedNode['buttonAlignments'] = event.form?.buttonAlignments;
          selectedNode['formType'] = event.form?.formType;
          selectedNode['routeUrl'] = event.form?.routeUrl;
          selectedNode['searchType'] = event.form?.searchType;
          selectedNode['drawerButtonLabel'] = event.form?.drawerButtonLabel;
          selectedNode['drawerButtonClass'] = event.form?.drawerButtonClass;
          selectedNode['drawerWidth'] = event.form?.drawerWidth;
          selectedNode['isShowDrawerButton'] = event.form?.isShowDrawerButton;
          selectedNode['drawerScreenLink'] = event.form?.drawerScreenLink;
          selectedNode['drawerPlacement'] = event.form?.drawerPlacement;
          selectedNode['startFreezingNumber'] = event.form?.startFreezingNumber;
          selectedNode['endFreezingNumber'] = event.form?.endFreezingNumber;
          selectedNode['stickyHeaders'] = event.form?.stickyHeaders;
          selectedNode['rowSelected'] = event.form?.rowSelected;
          selectedNode['outerBordered'] = event.form?.outerBordered;
          selectedNode['showTotal'] = event.form?.showTotal;
          selectedNode['changePageSize'] = event.form?.changePageSize;
          selectedNode['rotationDegree'] = event.form?.rotationDegree;
          selectedNode['headingClass'] = event.form?.headingClass;
          selectedNode['heading'] = event.form?.heading;
          selectedNode['tableHeaderClass'] = event.form?.tableHeaderClass;
          selectedNode['thLabelClass'] = event.form?.thLabelClass;
          selectedNode['thClass'] = event.form?.thClass;
          selectedNode['tbodyClass'] = event.form?.tbodyClass;
          selectedNode['dataRow'] = event.form?.dataRow;
          selectedNode['deleteCell'] = event.form?.deleteCell;
          selectedNode['editCell'] = event.form?.editCell;
          selectedNode['tdClass'] = event.form?.tdClass;
          selectedNode['tdrowClass'] = event.form?.tdrowClass;
          selectedNode['hieght'] = event.form?.hieght;
          selectedNode['searchfieldClass'] = event.form?.searchfieldClass;
          selectedNode['actionButtonClass'] = event.form?.actionButtonClass;
          selectedNode['paginationColor'] = event.form?.paginationColor;
          selectedNode['hideHeaderBorder'] = event.form?.hideHeaderBorder;
          selectedNode['hideInnerBorder'] = event.form?.hideInnerBorder;
          selectedNode['noSpace'] = event.form?.noSpace;
          if (event.form?.paginationColor) {
            document.documentElement.style.setProperty('--paginationColor', event.form?.paginationColor);
          }

          if (event.form?.hieght) {
            selectedNode['stickyHeaders'] = true;
          }
          let tableData: any = '';
          if (event.tableDta) {
            tableData = event.tableDta;
          }
          // const tableData = event.form.options;
          selectedNode['end'] = event.form?.end;
          selectedNode['serverSidePagination'] = event.form?.serverSidePagination;
          // const tableData = event.tableDta ? event.tableDta : event.form.options;
          if (tableData) {
            const updatedData = tableData.filter((updatedItem: any) => {
              const key = updatedItem.key;
              return !selectedNode.tableHeaders.some((headerItem: any) => headerItem.key === key);
            });

            if (updatedData.length > 0) {
              selectedNode.tableHeaders.forEach((item: any) => {
                updatedData.forEach((updatedItem: any) => {
                  item[updatedItem.key] = "";
                });
              });
            }

            selectedNode.tableHeaders = event.tableDta ? event.tableDta : event.form.options;
          }


          // if (selectedNode.tableHeaders.length > 0) {
          //   let newHeaders = selectedNode.tableHeaders.map((obj: any) => {
          //     let newObj = { ...obj };
          //     let key = newObj.key;
          //     if (event.form.sortOrder) {
          //       newObj.sortOrder = event.form.sortOrder;
          //     }
          //     if (event.form.sortDirections) {
          //       newObj.sortDirections = event.form.sortDirections;
          //     }
          //     if (event.form.filterMultiple) {
          //       newObj.filterMultiple = event.form.filterMultiple;
          //     }
          //     if (newObj.listOfFilter) {
          //       newObj.listOfFilter = JSON.parse(newObj.listOfFilter);
          //     }
          //     return newObj;
          //   });
          //   selectedNode.tableHeaders = newHeaders;
          // }
          // selectedNode.tableKey = selectedNode.tableHeaders.map((key: any) => ({ name: key.key }));
          // if (event.tableDta) {
          //   selectedNode.columnData = this.updateTableData(
          //     event.tableDta ? event.tableDta : event.form.options,
          //     event.tableDta ? event.tableDta : event.form.options
          //     // event.form.options, event.form.options
          //   );
          // }
          if (selectedNode.noResult) {
            if (selectedNode.tableData.length > 0) {
              selectedNode['tableNoResultArray'] =
                selectedNode.tableData;
              selectedNode.tableData = [];
            }
          }
          else {
            if (selectedNode['tableNoResultArray'])
              selectedNode.tableData =
                selectedNode['tableNoResultArray'];
          }
          if (selectedNode.tableHeaders.length > 0) {
            selectedNode.tableHeaders.forEach((header: any) => {
              if (header) {
                header.headerFreeze = false;
              }
            });
          }
          selectedNode.tableKey = selectedNode.tableHeaders;
        }
        break;

      case 'dropdownButton':

        selectedNode.btnIcon = event.form?.icon;
        if (event.tableDta) {
          selectedNode.dropdownOptions = event.tableDta;
        }
        // selectedNode.dropdownOptions = event?.form?.dropdownOptions;
        break;
      case 'fixedDiv':
        if (event.form.api) {

        }
        break;
      case 'chart':
        if (selectedNode) {
          var seriesList = [];
          var ans = Array.isArray(event.form.options[0].data);
          if (ans != true) {
            {
              var arrayData = event.form.options[0].data.split(',');
              for (let index = 0; index < arrayData.length; index++) {
                seriesList.push(arrayData[index]);
              }
            }
          } else {
            seriesList = event.form.options[0].data;
          }
          selectedNode.section[0].filterData[0].heading = event.form.title;
          selectedNode.section[0].filterData[0].subheading =
            event.form.sub_label;
          // selectedNode.section[0].filterData[0].refundsChart.series[0].data = event.form.options;
          selectedNode.section[0].filterData[0].price =
            event.form.options[0].price;
          selectedNode.section[0].filterData[0].refundsChart.colors =
            event.form.options[0].colors;
          selectedNode.section[0].filterData[0].refundsChart.series[0].data =
            seriesList;
          selectedNode.link = event.form.link;
          if (event.form.link) {
            // event.form.link = '';
          }
        }
        break;
      case "heading":

        selectedNode.fontstyle = event.form.fontstyle
        // selectedNode.fontSize = event.form.style + event.form.textAlignment + 'color:' + event.form.headingColor;
        // if (event.form.headingApi) {
        //   this.requestSubscription = this.builderService.genericApis(event.form.headingApi).subscribe({
        //     next: (res) => {
        //       selectedNode.data = res.data;
        //       this.updateNodes();
        //     },
        //     error: (err) => {
        //       console.error(err); // Log the error to the console
        //       this.toastr.error("An error occurred", { nzDuration: 3000 }); // Show an error message to the user
        //     }
        //   })
        // }
        break;
      case 'page':
        // selectedNode.options = event.form?.options;
        selectedNode.primaryColor = event.form?.primaryColor;
        selectedNode.secondaryColor = event.form?.secondaryColor;
        document.documentElement.style.setProperty('--pagePrimaryColor', event.form?.primaryColor);
        document.documentElement.style.setProperty('--pageSecondaryColor', event.form?.secondaryColor);
        selectedNode.options = event.tableDta
          ? event.tableDta
          : event.form?.options;
        if (
          selectedNode &&
          selectedNode.children &&
          selectedNode.children[1] &&
          selectedNode.children[1].children && event.form.tooltipIcon
        ) {
          selectedNode.children[1].children.forEach((element: any) => {
            element.children[1].children.forEach((element1: any) => {
              if (!element1.formly) {
                element1['tooltipIcon'] = event.form.tooltipIcon;
              } else if (element1.formly) {
                element1.formly[0].fieldGroup[0].props['additionalProperties'][
                  'tooltipIcon'
                ] = JSON.parse(JSON.stringify(event.form.tooltipIcon));
              }
            });
          });
        }
        break;

      case 'kanbanTask':
        if (selectedNode.id) {
          if (selectedNode.children) {
            for (let i = 0; i < selectedNode.children.length; i++) {
              selectedNode.children[i].id = event.form.options[i].id;
              selectedNode.children[i].title = event.form.options[i].title;
              selectedNode.children[i].date = event.form.options[i].date;
              selectedNode.children[i].content =
                event.form.options[i].content;
              selectedNode.children[i].users = JSON.parse(
                event.form.options[i].users
              );
              selectedNode.children[i].status =
                event.form.options[i].status;
              selectedNode.children[i].variant =
                event.form.options[i].variant;
            }
          }

          if (event.form.kanbanTaskApi != undefined) {

          }
        }
        break;
      case 'carouselCrossfade':
        // if (event.tableDta) {
        //   selectedNode.carousalConfig = event.tableDta;
        // }
        dynamicSection = true;
        dynamicSectionValue = { nodesNumber: event.form.nodes, subType: 'subCarouselCrossfade', mainType: 'carouselCrossfade' };
        // event.tableDta != undefined
        //   ? (selectedNode.carousalConfig = event.tableDta)
        //   : (selectedNode.carousalConfig =
        //     selectedNode.carousalConfig);
        // selectedNode.carousalConfig = event.form.carousalConfig;
        // if (event.form.link != undefined || event.form.link != '') {
        //   this.requestSubscription = this.builderService
        //     .genericApis(event.form.link)
        //     .subscribe({
        //       next: (res) => {
        //         selectedNode.carousalConfig = res;
        //         this.updateNodes();
        //       },
        //       error: (err) => {
        //         console.error(err); // Log the error to the console
        //         this.toastr.error('An error occurred', { nzDuration: 3000 }); // Show an error message to the user
        //       },
        //     });
        // }
        break;
      case 'timeline':
        dynamicSection = true;
        dynamicSectionValue = { nodesNumber: event.form.nodes, subType: 'timelineChild', mainType: 'timeline' };

        // selectedNode['data'] = event.form.options;
        // // if (event.tableDta) {
        // //   selectedNode.data = event.tableDta;
        // // }
        // selectedNode.data = event.form.data;
        // if (event.form.api) {
        //   this.requestSubscription = this.builderService
        //     .genericApis(event.form.api)
        //     .subscribe({
        //       next: (res) => {
        //         if (res) {
        //           selectedNode.data = res;
        //           this.updateNodes();
        //         }
        //       },
        //       error: (err) => {
        //         console.error(err); // Log the error to the console
        //         this.toastr.error('An error occurred', { nzDuration: 3000 }); // Show an error message to the user
        //       },
        //     });
        // }
        break;
      case 'simpleCardWithHeaderBodyFooter':
        if (event.form.imageSrc) {
          selectedNode.imageSrc = event.form.imageSrc;
        } else if (this.dataSharedService.imageUrl) {
          selectedNode.imageSrc = this.dataSharedService.imageUrl;
        }
        this.dataSharedService.imageUrl = '';
        break;
      case 'barChart':
        if (selectedNode) {
          // let data = event.form.columnNames;
          // data.push(
          //   { role: 'style', type: 'string' },
          //   { role: 'annotation', type: 'string' }
          // );
          // selectedNode.columnNames = event.form.columnNames;
          selectedNode.tableData = event.form.tableData ? JSON.parse(event.form.tableData) : event.form.tableData;
          selectedNode.columnNames = event.form.columnNames ? JSON.parse(event.form.columnNames) : event.form.columnNames;
          selectedNode.options = {
            chart: {
              title: event.form.title,
              subtitle: event.form.subtitle,
            },
            hAxis: {
              title: event.form.hAxisTitle,
              minValue: 0,
            },
            vAxis: {
              title: event.form.vAxisTitle,
            },
            bar: { groupWidth: event.form.groupWidth },
            bars: event.form.barType,
            isStacked: event.form.isStacked,
            colors: Array.isArray(event.form.color)
              ? event.form.color
              : event.form.color?.split(','),
          };

          // if (event.tableDta) {
          //   selectedNode.tableData = event.tableDta;
          //   selectedNode.chartData = event.tableDta.map((data: any) => [
          //     data.name,
          //     data.value,
          //     data.value2,
          //   ]);
          // }
          // if (event.tableDta) {
          //   selectedNode.tableData = event.tableDta[0].tableData ? JSON.parse(event.tableDta[0].tableData) : event.tableDta[0].tableData;
          //   selectedNode.columnNames = event.tableDta[0].columnNames ? JSON.parse(event.tableDta[0].columnNames) : event.tableDta[0].columnNames;
          //   selectedNode.chartTable = event.tableDta;
          //   // selectedNode.chartData = event.form.tableData.map((data: any) => [
          //   //   data.name,
          //   //   data.value,
          //   //   data.value2,
          //   // ]);
          // }
        }
        break;
      case 'pieChart':
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.name,
            Number(data.value),
          ]);
        }
        selectedNode['showDots'] = selectedNode?.showDots;
        selectedNode.options = {
          title: event.form.title,
          is3D: event.form.is3D,
          pieHole: event.form.pieHole,
          pieStartAngle: event.form.pieStartAngle,
          sliceVisibilityThreshold: event.form.sliceVisibilityThreshold,
          legend: { alignment: event.form.titleAlignment, position: event.form.lengendPositition, },
          // legend: { position: event.form.hideDots ? 'none' : 'right' },
        };
        break;
      case 'bubbleChart':
        selectedNode.options.hAxis.fontSize = event.form.fontSize;
        selectedNode.options.bubble.textStyle.fontSize =
          event.form.fontSize;
        selectedNode.options.bubble.textStyle.fontName =
          event.form.fontName;
        selectedNode.options.bubble.textStyle.color = event.form.color;
        selectedNode.options.bubble.textStyle.bold = event.form.bold;
        selectedNode.options.bubble.textStyle.italic = event.form.italic;
        selectedNode.options = {
          ...selectedNode.options,
          title: event.form.title,
          hAxis: { title: event.form.hAxisTitle },
          vAxis: { title: event.form.vAxisTitle },
          colorAxis: {
            colors: Array.isArray(event.form.colorAxis)
              ? event.form.colorAxis
              : event.form.colorAxis?.split(','),
          },
          bubble: {
            textStyle: {
              fontSize: event.form.fontSize,
              fontName: event.form.fontName,
              color: event.form.color,
              bold: event.form.bold,
              italic: event.form.italic,
            },
          },
        };
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.id,
            Number(data.x),
            Number(data.y),
            Number(data.temprature),
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.id,
        //     Number(data.x),
        //     Number(data.y),
        //     Number(data.temprature),
        //   ]);
        // }
        break;
      case 'candlestickChart':
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.name,
            Number(data.value),
            Number(data.value1),
            Number(data.value2),
            Number(data.value3),
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.name,
        //     Number(data.value),
        //     Number(data.value1),
        //     Number(data.value2),
        //     Number(data.value3),
        //   ]);
        // }
        break;
      case 'columnChart':
        let data = event.form.columnNames;
        data.push(
          { role: 'style', type: 'string' },
          { role: 'annotation', type: 'string' }
        );
        selectedNode.columnNames = data;
        selectedNode.options = {
          ...selectedNode.options,
          title: event.form.title,
          bar: { groupWidth: event.form.groupWidth },
          legend: {
            position: event.form.position,
            maxLines: event.form.maxLines,
          },
          hAxis: {
            title: event.form?.hAxisTitle,
          },
          vAxis: {
            title: event.form?.vAxisTitle,
          },
          isStacked: event.form.isStacked,
          colors: Array.isArray(event.form.color)
            ? event.form.color
            : event.form.color?.split(','),
        };
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode['chartData'] = event.tableDta.map((data: any) => [
            data.id,
            Number(data.col1),
            Number(data.col2),
            Number(data.col3),
            Number(data.col4),
            Number(data.col5),
            Number(data.col6),
            data.style,
            data.annotation,
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode['chartData'] = event.form.tableData.map((data: any) => [
        //     data.id,
        //     Number(data.col1),
        //     Number(data.col2),
        //     Number(data.col3),
        //     Number(data.col4),
        //     Number(data.col5),
        //     Number(data.col6),
        //     data.style,
        //     data.annotation,
        //   ]);
        // }
        break;
      case 'ganttChart':
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
        }
        selectedNode.view_mode = event.form?.view_modes
        // selectedNode.options = {
        //   criticalPathEnabled: event.form.isCriticalPath, //if true then criticalPathStyle apply
        //   criticalPathStyle: {
        //     stroke: event.form.stroke,
        //     strokeWidth: event.form.isCriticalPath,
        //   },
        //   innerGridHorizLine: {
        //     stroke: event.form.isCriticalPath,
        //     strokeWidth: event.form.strokeWidth,
        //   },
        //   arrow: {
        //     angle: event.form.angle,
        //     width: event.form.arrowWidth,
        //     color: event.form.color,
        //     radius: event.form.radius,
        //   },
        //   innerGridTrack: { fill: event.form.innerGridTrack },
        //   innerGridDarkTrack: { fill: event.form.innerGridDarkTrack },
        // };
        // if (event.tableDta) {
        //   selectedNode.tableData = event.tableDta;
        //   selectedNode.chartData = event.tableDta.map((data: any) => [
        //     data.taskID,
        //     data.taskName,
        //     data.resource,
        //     new Date(data.startDate),
        //     new Date(data.endDate),
        //     data.duration,
        //     data.percentComplete,
        //     data.dependencies,
        //   ]);
        // }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.taskID,
        //     data.taskName,
        //     data.resource,
        //     new Date(data.startDate),
        //     new Date(data.endDate),
        //     data.duration,
        //     data.percentComplete,
        //     data.dependencies,
        //   ]);
        // }
        break;
      case 'geoChart':
        selectedNode.options = {
          region: event.form.region, // Africa
          colorAxis: {
            colors: Array.isArray(event.form.colorAxis)
              ? event.form.colorAxis
              : event.form.colorAxis?.split(','),
          },
          backgroundColor: event.form.bgColor,
          datalessRegionColor: event.form.color,
          defaultColor: event.form.defaultColor,
        };
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.label,
            data.value,
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.label,
        //     data.value,
        //   ]);
        // }
        break;
      case 'treeMapChart':
        selectedNode.options = {
          highlightOnMouseOver: event.form.highlightOnMouseOver,
          maxDepth: event.form.width,
          maxPostDepth: event.form.maxPostDepth,
          minHighlightColor: event.form.minHighlightColor,
          midHighlightColor: event.form.midHighlightColor,
          maxHighlightColor: event.form.maxHighlightColor,
          minColor: event.form.minColor,
          midColor: event.form.midColor,
          maxColor: event.form.maxColor,
          headerHeight: event.form.headerHeight,
          showScale: event.form.showScale,
          useWeightedAverageForAggregation:
            event.form.useWeightedAverageForAggregation,
        };
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.id,
            data.value1,
            data.value2,
            data.value3,
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.id,
        //     data.value1,
        //     data.value2,
        //     data.value3,
        //   ]);
        // }
        break;
      case 'histogramChart':
        selectedNode.options.title = event.form.title;
        selectedNode.options.legend = event.form.legend;
        selectedNode.options.color = event.form.color;
        selectedNode.options.histogram = event.form.histogram;
        selectedNode.options.hAxis.title = event.form.hAxisTitle;
        selectedNode.options.vAxis.title = event.form.vAxisTitle;
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.label,
            data.value,
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.label,
        //     data.value,
        //   ]);
        // }
        break;
      case 'tableChart':
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.col1,
            data.col2,
            data.col3,
            data.col4,
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.col1,
        //     data.col2,
        //     data.col3,
        //     data.col4,
        //   ]);
        // }
        break;
      case 'lineChart':
        selectedNode.options = {
          ...selectedNode.options,
          hAxis: { title: event.form.hAxisTitle },
          vAxis: { title: event.form.vAxisTitle },
          chart: {
            title: event.form.title,
            subtitle: event.form.subtitle,
          },
        };
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            Number(data.id),
            Number(data.col1),
            Number(data.col2),
            Number(data.col3),
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     Number(data.id),
        //     Number(data.col1),
        //     Number(data.col2),
        //     Number(data.col3),
        //   ]);
        // }
        break;
      case 'sankeyChart':
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.label,
            data.link,
            data.value,
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.label,
        //     data.link,
        //     data.value,
        //   ]);
        // }
        break;
      case 'scatterChart':
        selectedNode.subtitle = event.form.subtitle;
        selectedNode.options = {
          width: 800,
          height: 500,
          chart: {
            title: event.form.title,
            subtitle: event.form.subtitle,
          },
          axes: {
            x: {
              0: { side: 'top' },
            },
          },
          hAxis: {
            title: event.form.hAxisTitle,
          },
          vAxis: { title: event.form.vAxisTitle },
        };
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.id,
            data.value,
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.id,
        //     data.value,
        //   ]);
        // }
        break;
      case 'areaChart':
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.label,
            Number(data.col1),
            Number(data.col2),
            Number(data.col3),
            Number(data.col4),
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.label,
        //     Number(data.col1),
        //     Number(data.col2),
        //     Number(data.col3),
        //     Number(data.col4),
        //   ]);
        // }
        selectedNode.options = {
          title: event.form.title,
          isStacked: event.form.isStacked,
          legend: {
            position: event.form.position,
            maxLines: event.form.maxLines,
          },
          selectionMode: event.form.selectionMode,
          tooltip: { trigger: event.form.tooltip },
          hAxis: {
            // title: event.form.hAxis,
            title: event.form.hAxisTitle,
            titleTextStyle: { color: event.form.titleTextStyle },
          },
          vAxis: { title: event.form.vAxisTitle, minValue: event.form.minValue },
        };
        break;
      case 'comboChart':
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.label,
            Number(data.col1),
            Number(data.col2),
            Number(data.col3),
            Number(data.col4),
            Number(data.col5),
            Number(data.col6),
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.label,
        //     Number(data.col1),
        //     Number(data.col2),
        //     Number(data.col3),
        //     Number(data.col4),
        //     Number(data.col5),
        //     Number(data.col6),
        //   ]);
        // }
        selectedNode.options = {
          ...selectedNode.options,
          title: event.form.title,
          seriesType: event.form.seriesType,
          hAxis: { title: event.form.hAxisTitle },
          vAxis: { title: event.form.vAxisTitle },
        };
        break;
      case 'steppedAreaChart':
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.label,
            Number(data.value1),
            Number(data.value2),
            Number(data.value3),
            Number(data.value4),
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.label,
        //     Number(data.value1),
        //     Number(data.value2),
        //     Number(data.value3),
        //     Number(data.value4),
        //   ]);
        // }
        selectedNode.options = {
          backgroundColor: event.form.bgColor,
          legend: { position: event.form.position },
          connectSteps: event.form.connectSteps,
          colors: Array.isArray(event.form.color)
            ? event.form.color
            : event.form.color?.split(','),
          isStacked: event.form.isStacked,
          vAxis: {
            minValue: 0,
            ticks: [0, 0.3, 0.6, 0.9, 1],
          },
          selectionMode: event.form.selectionMode,
        };
        break;
      case 'timelineChart':
        if (event.tableDta) {
          selectedNode.tableData = event.tableDta;
          selectedNode.chartData = event.tableDta.map((data: any) => [
            data.label,
            data.value,
            new Date(data.startDate),
            new Date(data.endDate),
          ]);
        }
        // if (event.form.tableData) {
        //   selectedNode.tableData = event.form.tableData;
        //   selectedNode.chartData = event.form.tableData.map((data: any) => [
        //     data.label,
        //     data.value,
        //     new Date(data.startDate),
        //     new Date(data.endDate),
        //   ]);
        // }
        selectedNode.options = {
          timeline: {
            showRowLabels: event.form.showRowLabels,
            colorByRowLabel: event.form.colorByRowLabel,
            singleColor: event.form.singleColor,
            rowLabelStyle: {
              fontName: event.form.rowLabelFontName,
              fontSize: event.form.rowLabelFontSize,
              color: event.form.rowLabelColor,
            },
            barLabelStyle: {
              fontName: event.form.barLabelFontName,
              fontSize: event.form.barLabelFontSize,
            },
          },
          backgroundColor: event.form.bgColor,
          alternatingRowStyle: event.form.alternatingRowStyle,
          colors: Array.isArray(event.form.color)
            ? event.form.color
            : event.form.color?.split(','),
        };
        break;
      default:
        break;
    }
    if (event.type && event.type != "inputValidationRule" && needToUpdate) {
      selectedNode = { ...selectedNode, ...event.form };
      // if (Array.isArray(event.form.className)) {
      //   if (event.form.className.length > 0) {
      //     let classArray: string = '';
      //     for (let i = 0; i < event.form.className.length; i++) {
      //       const classObj: string[] = event.form.className[i].split(" ");
      //       if (classObj.length > 0) {
      //         for (let j = 0; j < classObj.length; j++) {
      //           if (j === 0 && i === 0) {
      //             classArray = classObj[j];
      //           } else {
      //             classArray += ' ' + classObj[j];
      //           }
      //         }
      //       }
      //     }
      //     selectedNode.className = classArray;
      //     selectedNode = { ...selectedNode, ...event.form };
      //   }
      // }
      // else {
      //   selectedNode.className = event.form.className;
      // }

      // this.updateNodes();
    }
    return { dynamicSection, dynamicSectionValue, formlyUpdate, formlyModel, JOIData, inputValidationRule, selectedNode }
  }
  notifyEmitMenu(event: actionTypeFeild, selectedNode: any) {
    selectedNode.id = event.form.id;
    selectedNode.key = event.form.key;
    selectedNode.title = event.form.title;
    let dynamicSection = false;
    let dynamicSectionValue: any;
    switch (event.type) {
      case "input":
        if (selectedNode) {
          selectedNode.icon = event.form.icon;
          if (!event.form.link.includes("pages") && event.form.link != '') {
            // selectedNode.link = event.form.link != "/pages/tabsanddropdown" ? "/pages/" + event.form.link : event.form.menuLink;
            if (event.form.link.includes("#")) {
              selectedNode.link = event.form.link;
            } else {
              selectedNode.link = "/pages/" + event.form.link;
            }
          } else {
            selectedNode.link = event.form.link;
          }
          selectedNode.isTitle = event.form.isTitle;
          selectedNode.tooltip = event.form.tooltip;
          selectedNode.textColor = event.form.textColor;
          selectedNode.textColor = event.form.textColor;
          selectedNode['iconType'] = event.form.iconType;
          selectedNode['iconSize'] = event.form.iconSize;
          selectedNode['iconColor'] = event.form.iconColor;
          selectedNode['hideExpression'] = event.form.hideExpression;
          selectedNode['iconRight'] = event.form.iconRight;
        }
        break;

      case "tabs":
        if (selectedNode.id) {
          selectedNode.icon = event.form.icon;
          selectedNode.link = event.form.link;
        }
        break;

      case "mainTab":
        if (selectedNode.id) {
          selectedNode.selectedIndex = event.form.selectedIndex;
          selectedNode.animated = event.form.animated;
          selectedNode.size = event.form.size;
          selectedNode.tabPosition = event.form.tabPosition;
          selectedNode.tabType = event.form.tabType;
          selectedNode.hideTabs = event.form.hideTabs;
          selectedNode.nodes = event.form.nodes;
          selectedNode.centerd = event.form.centerd;
          // this.adddynamicDashonictab(selectedNode.nodes);
          dynamicSection = true;
          dynamicSectionValue = { nodesNumber: event.form.nodes, subType: 'tabs', mainType: 'mainTab' }
          // this.addDynamic(event.form.nodes, 'tabs', 'mainTab')
        }
        break;

      case "dropdown":
        if (selectedNode) {
          selectedNode.nodes = event.form.nodes;
          selectedNode.icon = event.form.icon;
          // this.adddynamicPages(event.form.nodes);
        }
        break;
      case "pages":
        if (selectedNode) {
          selectedNode.link = event.form.link;
        }
        break;
      case "buttons":

        if (selectedNode) {
          selectedNode.link = event.form.link;
          selectedNode.icon = event.form.icon;
        }
        break;
      default:
        break;
    }
    return { selectedNode, dynamicSection, dynamicSectionValue };
  }
}
