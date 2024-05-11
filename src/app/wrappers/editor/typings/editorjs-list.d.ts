
declare module '@editorjs/list' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface ListData extends BlockToolData {
    style?: 'ordered' | 'unordered';
    items?: string[];
  }

  export default class List implements BlockTool {
    constructor();
    render(): HTMLElement;
    save(blockContent: HTMLElement): ListData;
  }
}
