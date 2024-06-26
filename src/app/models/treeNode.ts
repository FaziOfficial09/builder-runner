import { FormlyFieldConfig } from "@ngx-formly/core";
import { badge } from "./badge";
import { actionConfig, btnConfig, btnGroup } from "./btnConfig";
import { builderConfig } from "./cardConfig";
import { formlyConfig } from "./formlyConfig";
import { gridConfig } from "./gridConfig";
import { headerConfig } from "./headerConfig"

export interface TreeNode {
  id?: string;
  cid?: string;
  screenId?: string;
  type?: string;
  editor?: any;
  mapApi?: any;
  formatter?: any;
  limit?: number,
  belowpercentage?: number,
  belowpercentageColor?: string,
  numberofcolumns?: string,
  defaultColor?: string,
  thisTitle?: string,
  actionType?: string;
  formlyType?: string;
  wrappers?: any;
  highLight?: boolean;
  isNextChild?: boolean;
  level?: any;
  padding?: any;
  hideExpression?: boolean;
  iconRight?: boolean;
  affix?: any;
  count?: any;
  offSetTop?: any;
  showInkInFixed?: any;
  checkable?: any;
  expandKeys?: any;
  hideUnMatched?: any;
  showExpand?: any;
  showLine?: any;
  blockNode?: any;
  asyncData?: any;
  draggable?: any;
  expandAll?: any;
  checkStricktly?: any;
  defaultExpandAll?: any;
  expandTrigger?: any;
  labelProperty?: any;
  placeHolder?: any;
  allowClear?: any;
  autoFocus?: any;
  showArrow?: any;
  showInput?: any;
  expand?: any;
  expandIcon?: any;
  closingexpandicon?: any;
  treeApi?: any;
  loading?: boolean;
  clear?: boolean;
  allowHalf?: boolean;
  focus?: boolean;
  showCount?: any;
  nzCount?: any;
  dropdownOptions?: any;
  nzText?: any;
  nzColor?: any;
  visibleafter?: any;
  paddingLeft?: any;
  tableId?: any;
  paddingRight?: any;
  paddingTop?: any;
  paddingBottom?: any;
  showValue?: boolean;
  className?: any;
  margin?: any;
  sectionClassName?: any;
  selectedIndex?: any;
  direction?: any;
  animated?: any;
  tabPosition?: any;
  tabType?: any;
  hideTabs?: any;
  effect?: any;
  dotPosition?: any;
  autoPlay?: any;
  autolPlaySpeed?: any;
  enableSwipe?: any;
  showDots?: any;
  affixType?: any;
  notvisible?: any;
  closevisible?: any;
  okvisible?: any;
  target?: any;
  buttonClass?: any;
  searchfieldClass?: any;
  bond?: any;
  alt?: any;
  source?: any;
  imagHieght?: any;
  imageWidth?: any;
  base64Image?: any;
  imageClass?: any;
  keyboardKey?: any;
  zoom?: any;
  rotate?: any;
  data?: any;
  dbData?: any;
  tableBody?: any;
  style?: any;
  fontSize?: any;
  textAlign?: any;
  borderless?: any;
  videoSrc?: any;
  hover?: any;
  nztype?: any;
  isSubmit?: any;
  hoverTextColor?: any;
  headingColor?: any;
  classNameForPosition?: any;
  dividerClassName?: any;
  dividerPosition?: any;
  options?: any;
  alertColor?: any;
  alertType?: any;
  banner?: any;
  showIcon?: any;
  closeable?: any;
  closeText?: any;
  action?: any;
  iconType?: any;
  iconSize?: any;
  text?: any;
  editable?: any;
  dayMaxEvents?: any;
  selectMirror?: any;
  selectable?: any;
  weekends?: any;
  details?: any;
  editableTooltip?: any;
  tooltipIcon?: any;
  copyable?: any;
  copyTooltips?: any;
  ellipsis?: any;
  suffix?: any;
  ellipsisRows?: any;
  beforecopyIcon?: any;
  aftercopyIcon?: any;
  editableIcon?: any;
  src?: any;
  bgColor?: any;
  gap?: any;
  lineColor?: any;
  textcolorForStyle?: any;
  lineColorForStyle?: any;
  dividerFormat?: any;
  verticalLineHieght?: any;
  verticalLinePosition?: any;
  verticalLinePositionForCssBinding?: any;
  verticalLineHieghtForCssBinding?: any;
  verticalLineColorForCssBinding?: any;
  // fieldGroupClassName:?string;
  children?: TreeNode[];
  rowData?: any;
  columnData?: any;
  isExpanded?: boolean;
  expanded?: boolean;
  screenVariables?: any[];
  sectionDisabled?: string;
  position?: string,
  header?: any;
  noResult?: any;
  nzSimple?: any;
  nzSize?: any;
  nzShowSizeChanger?: any;
  showCheckbox?: any;
  fixHeader?: any;
  tableScroll?: any;
  fixedColumn?: any;
  sortOrder?: any;
  sortDirections?: any;
  filterMultiple?: any;
  sort?: any;
  tableHeaders?: any;
  tableKey?: any;
  tableHeader?: any;
  tableNoResultArray?: any;
  expandable?: any;
  tableData?: any;
  name?: any;
  sortingType?: any;
  showColumn?: any;
  editorType?: any;
  jsonData?: string,
  formly?: FormlyFieldConfig[],
  formlyData?: any[],
  pageFooterData?: any[],
  pageFooterButtonGroupData?: any[],
  pageHeaderData?: any[],
  pageHeaderButtonGroupData?: any[],
  pageHeaderAlertData?: any[],
  btnConfig?: btnConfig[],
  buttonGroupData?: any[],
  headerButtonGroupData?: any[],
  bodyButtonGroupData?: any[],
  footerButtonGroupData?: any[],
  // buttonGroup?: btnGroup[],
  actionConfig?: actionConfig,
  // btnConfig?: any[],
  gridConfig?: any,
  haediing?: string,
  viewType?: string,
  view?: string,
  tooltip?: any,
  tooltipWithoutIcon?: any,
  labelText?: any,
  pendingText?: any,
  mainIcon?: any,
  timecolor?: any,
  reverse?: any,
  dotIcon?: any,
  status?: any,
  showSearch?: any,
  firstBoxTitle?: any,
  secondBoxTitle?: any,
  leftButtonLabel?: any,
  rightButtonLabel?: any,
  searchPlaceHolder?: any,
  list?: any,
  notFoundContentLabel?: any,
  strokeLineCap?: any,
  resultTitle?: any,
  subTitle?: any,
  delayTime?: any,
  loaderText?: any,
  loaderIcon?: any,
  simple?: any,
  spinning?: any,
  btnLabel?: any,
  modalContent?: any,
  modalTitle?: any,
  cancalButtontext?: any,
  centered?: any,
  okBtnLoading?: any,
  cancelBtnLoading?: any,
  okBtnDisabled?: any,
  cancelDisabled?: any,
  ecsModalCancel?: any,
  okBtnText?: any,
  showCloseIcon?: any,
  nzPopoverTitle?: any,
  arrowPointAtCenter?: any,
  trigger?: any,
  visible?: any,
  clickHide?: any,
  mouseEnterDelay?: any,
  mouseLeaveDelay?: any,
  backdrop?: any,
  avatar?: any,
  author?: any,
  node?: any,
  switchType?: any,
  switchPosition?: any,
  timeOut?: any,
  positionClass?: any,
  progressBar?: any,
  message?: any,
  toastrType?: any,
  toasterTitle?: any,
  closeIcon?: any,
  description?: any,
  bgColorHeader?: any,
  bgColorBody?: any,
  bgColorFooter?: any,
  animate?: any,
  notificationType?: any,
  pauseOnHover?: any,
  duration?: any,
  messageType?: any,
  title?: any,
  apiUrl?: any,
  doubleClick?: any,
  copyJsonIcon?: any,
  requiredMessage?: any,
  subtitle?: any,
  percentage?: any,
  progressBarType?: any,
  percent?: any,
  showInfo?: any,
  success?: any,
  content?: any,
  sortable?: any,
  headingConfig?: headerConfig[],
  paragrapghConfig?: headerConfig[],
  simpleCardConfig?: builderConfig[],
  accordionConfig?: any,
  section?: any,
  thisValue?: string,
  lastTitle?: string,
  lastValue?: string,
  prevTitle?: string,
  prevValue?: string,
  growth?: string,
  value?: string,
  chart?: any,
  simpleCardWithHeaderBodyFooterConfig?: any,
  timelineConfig?: any,
  alertConfig?: any,
  videoConfig?: any,
  // chartCardConfig?: builderConfig[],
  audioSrc?: any,
  dataOnly?: any,
  nodes?: any,
  maxLength?: any,
  showAddbtn?: any,
  centerd?: any,
  widgetSecondCard?: builderConfig[],
  widgetSectionCard?: builderConfig[],
  browserdata?: builderConfig[],
  visitordonutChart?: builderConfig[],
  saledDonutChart?: builderConfig[],
  analyticsChart?: builderConfig[],
  gridList?: any,
  gridData?: any,
  label?: string,
  min?: any,
  invoiceNumberLabel?: any,
  datelabel?: any,
  paymentTermsLabel?: any,
  poNumber?: any,
  billToLabel?: any,
  dueDateLabel?: any,
  shipToLabel?: any,
  notesLabel?: any,
  subtotalLabel?: any,
  dicountLabel?: any,
  shippingLabel?: any,
  taxLabel?: any,
  termsLabel?: any,
  totalLabel?: any,
  amountpaidLabel?: any,
  balanceDueLabel?: any,
  max?: any,
  sliderType?: any,
  disabled?: boolean,
  headingSize?: any,
  ngvalue?: any,
  nzBlock?: any,
  stepperType?: any,
  block?: any,
  defaultSelectedIndex?: any,
  nzType?: any,
  nzShape?: any,
  format?: any,
  buttonFormat?: string,
  btngroupformat?: string,
  btnGroupPosition?: string,
  footer?: boolean,
  footerBorder?: boolean,
  class?: string,
  isTitle?: boolean,
  textColor?: string,
  repeat?: any,
  divClass?: any,
  color?: string,
  hoverColor?: string,
  icon?: any,
  theme?: any,
  mode?: any,
  checked?: any,
  dividerText?: any,
  dashed?: any,
  dividerType?: any,
  orientation?: any,
  plain?: any,
  btnIcon?: any,
  captureData?: any,
  href?: any,
  btnType?: any,
  btnLabelPaddingClass?: any,
  btnopacity?: any,
  dataTable?: any,
  link?: string,
  forCommomComponentCondition?: string,
  pagination?: any,
  eventActionConfig?: any,
  delete?: boolean,
  update?: boolean,
  create?: boolean,
  filter?: any,
  isAddRow?: boolean,
  borderColor?: any,
  backGroundColor?: any,
  labelPosition?: string,
  repeatable?: any,
  alertPosition?: string,
  moduleName?: string,
  moduleId?: string,
  badge?: badge[],
  parentId?: number;
  isLayout?: boolean;
  subItems?: any;
  menuData?: any;
  selectedTheme?: any;
  key?: any;
  nzTitle?: any;
  nzExpandIconPosition?: any;
  nzGhost?: any;
  nzDanger?: any;
  nzDisabled?: any;
  nzExpandedIcon?: any;
  nzShowArrow?: any;
  nzBordered?: any;
  nzFooter?: any;
  nzLoading?: any;
  nzPaginationType?: any;
  nzPaginationPosition?: any;
  nzFrontPagination?: any;
  end?: any,
  serverSidePagination?: any,
  nzShowPagination?: any;
  showColumnHeader?: any;
  pattern?: any;
  emailtypeallow?: any;
  shape?: any;
  reference?: string;
  minlength?: number;
  maxlength?: number;
  required?: boolean;
  deleteapi?: string;
  //FOR DRAWER
  btnText?: string;
  isClosable?: boolean;
  extra?: string;
  isMask?: boolean;
  isMaskClosable?: boolean;
  isCloseOnNavigation?: boolean;
  isKeyboard?: boolean;
  maskStyle?: {};
  bodyStyle?: {};
  headerText?: string;
  footerText?: string;
  bodyText?: string;
  isVisible?: boolean;
  placement?: string;
  size?: any;
  width?: any;
  imageAlt?: any;
  imageSrc?: any;
  checkedChildren?: any;
  unCheckedChildren?: any;
  imagePreview?: any;
  control?: any;
  model?: any;
  height?: any;
  allowfullscreen?: any;
  offsetX?: number;
  offsetY?: number;
  wrapClassName?: string;
  zIndex?: number;
  onClose?: string;
  isActive?: boolean;
  buttonShape?: string;
  avatarShape?: string;
  shapeType?: string;
  isBordered?: boolean;
  borderRadius?: any;
  isSplit?: boolean;
  isEdit?: boolean;
  isUpdate?: boolean;
  isDelete?: boolean;
  isLoad?: boolean;
  isColon?: boolean;
  isBadeg?: boolean;
  loadText?: string;
  nzExtra?: string;
  nzStatus?: string;
  standAlone?: any;
  formatAlignment?: any;
  dot?: any;
  showDot?: any;
  overflowCount?: any;
  showZero?: any;
  offset?: any;
  nzSpan?: number;
  mainDashonicTabsConfig?: any,
  dashonicTabsConfig?: any,
  dropdownConfig?: any,
  pageConfig?: any,
  carousalConfig?: any,
  carousalType?: any,
  buttonsConfig?: any,
  bootstrapTabsConfig?: any,
  dividerConfig?: any,
  fixedDivConfig?: any,
  fixedDivChild?: any,
  kambanChildren?: any,
  users?: any,
  getVariable?: string,
  setVariable?: string,
  date?: string;
  variant?: string;
  total?: string;
  mainDashonicTabsChild?: any
  switchConfig?: any,
  uploadBtnLabel?: any,
  uploadLimit?: any,
  showDialogueBox?: any,
  showUploadlist?: any,
  onlyDirectoriesAllow?: any,
  multiple?: any,
  progressBArConfig?: any,
  calenderConfig?: any,
  fontstyle?: any,
  sharedMessagesConfig?: any,
  heading?: any,
  labelIcon?: any,
  headingIcon?: string,
  subHeading?: string,
  subHeadingIcon?: string,
  subheadingColor?: string,
  prefixIcon?: any,
  suffixIcon?: any,
  statisticArray?: any,
  iconColor?: any,
  isCriticalPath?: any,
  stroke?: any,
  strokeWidth?: any,
  angle?: any,
  arrowWidth?: any,
  radius?: any,
  innerGridTrack?: any,
  innerGridDarkTrack?: any,
  region?: any,
  colorAxis?: any,
  legend?: any,
  histogram?: any,
  hAxis?: any,
  vAxis?: any
  chartData?: any,
  chartOptions?: any,
  columnNames?: any,
  chartTable?: any
  checkData?: any
  rowClickApi?: any,
  rowClass?: any,
  headerCollapse?: any,
  expandedIconPosition?: any,
  toolTipClass?: any,
  tooltipPosition?: any,
  borderLessInputs?: any,
  isLeaf?: any,
  labelClassName?: any,
  inputLabelClassName?: any,
  showEditInput?: any,
  openComponent?: any,
  isDeleteAllow?: boolean,
  isAllowGrouping?: boolean,
  isAllowExcelReport?: boolean,
  isAllowUploadExcel?: boolean,
  isAllowSearch?: boolean,
  tableName?: string,
  buttonPositions?: string,
  formType?: string,
  routeUrl?: string,
  buttonAlignments?: any[],
  componentMapping?: boolean,
  searchType?: string,
  kanlistArray?: any,
  drawerButtonLabel?: any,
  drawerButtonClass?: any,
  drawerWidth?: any,
  isShowDrawerButton?: any,
  drawerScreenLink?: any,
  drawerPlacement?: any,
  detailTable?: any,
  startFreezingNumber?: number,
  endFreezingNumber?: number,
  stickyHeaders?: boolean,
  rowSelected?: boolean,
  outerBordered?: boolean,
  showTotal?: boolean,
  changePageSize?: boolean,
  rotationDegree?: number,
  headingClass?: string,
  tableHeaderClass?: string,
  thLabelClass?: string,
  thClass?: string,
  tbodyClass?: string,
  dataRow?: string,
  deleteCell?: string,
  editCell?: string,
  tdClass?: string,
  tdrowClass?: string,
  hieght?: string,
  image?: string,
  actionButtonClass?: string,
  primaryColor?: string,
  secondaryColor?: string,
  paginationColor?: string,
  appGlobalClass?: string,
  appGlobalInnerClass?: string,
  innerClass?: string,
  appGlobalInnerIconClass?: string,
  isNewNode?: boolean;
  hideHeaderBorder?: any;
  hideInnerBorder?: any;
  noSpace?: any;
}
