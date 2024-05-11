declare module '@editorjs/image' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface ImageData extends BlockToolData {
    file?: File;
    url?: string;
    caption?: string;
    withBorder?: boolean;
    withBackground?: boolean;
    stretched?: boolean;
  }

  export default class ImageTool implements BlockTool {
    constructor(config?: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): ImageData;
  }
}
