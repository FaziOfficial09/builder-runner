declare module '@editorjs/link' {
  import { InlineTool, InlineToolConstructorOptions } from '@editorjs/editorjs';

  export default class LinkTool implements InlineTool {
    constructor(options?: InlineToolConstructorOptions);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
}
