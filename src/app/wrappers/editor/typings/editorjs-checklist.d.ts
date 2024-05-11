declare module '@editorjs/checklist' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface ChecklistData extends BlockToolData {
    items?: Array<{ text: string; checked: boolean }>;
  }

  export default class Checklist implements BlockTool {
    constructor();
    render(): HTMLElement;
    save(blockContent: HTMLElement): ChecklistData;
  }
}
