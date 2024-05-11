declare module '@editorjs/table' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface TableData extends BlockToolData {
    content?: string[][];
  }

  export default class Table implements BlockTool {
    constructor();
    render(): HTMLElement;
    save(blockContent: HTMLElement): TableData;
  }
}
