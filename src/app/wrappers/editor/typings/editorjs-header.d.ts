declare module '@editorjs/header' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface HeaderData extends BlockToolData {
    level?: number;
    text?: string;
  }

  export default class Header implements BlockTool {
    constructor();
    render(): HTMLElement;
    save(blockContent: HTMLElement): HeaderData;
  }
}
