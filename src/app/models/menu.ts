export interface MenuItem {
  id?: number;
  moduleId?: number;
  label?: any;
  icon?: string;
  type?: string;
  link?: string;
  subItems?: any;
  menuIcon?: any;
  isTitle?: boolean;
  badge?: any;
  parentId?: number;
  isLayout?: boolean;
  menuData?:any;
  selectedTheme?:any;
  color?:any;
  isShowChild?:any;
  isOpen?: boolean;
}
