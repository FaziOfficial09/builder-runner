declare module '@editorjs/embed' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface EmbedData extends BlockToolData {
    service: string;
    source: string;
    embed: string;
    width: number;
    height: number;
    caption?: string;
  }

  export default class Embed implements BlockTool {
    constructor();
    render(): HTMLElement;
    save(blockContent: HTMLElement): EmbedData;
  }
}
