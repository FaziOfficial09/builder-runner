declare module '@editorjs/quote' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface QuoteData extends BlockToolData {
    text?: string;
    caption?: string;
    alignment?: 'left' | 'center';
  }

  export default class Quote implements BlockTool {
    constructor();
    render(): HTMLElement;
    save(blockContent: HTMLElement): QuoteData;
  }
}
