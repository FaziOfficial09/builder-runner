declare module '@editorjs/code' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface CodeData extends BlockToolData {
    code?: string;
  }

  export default class Code implements BlockTool {
    constructor();
    render(): HTMLElement;
    save(blockContent: HTMLElement): CodeData;
  }
}
