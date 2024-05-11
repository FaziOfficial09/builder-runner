declare module '@editorjs/warning' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface WarningData extends BlockToolData {
    title?: string;
    message?: string;
  }

  export default class Warning implements BlockTool {
    constructor();
    render(): HTMLElement;
    save(blockContent: HTMLElement): WarningData;
  }
}
