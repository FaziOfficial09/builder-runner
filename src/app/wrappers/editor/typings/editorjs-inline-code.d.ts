declare module '@editorjs/inline-code' {
  import { InlineTool, InlineToolConstructorOptions } from '@editorjs/editorjs';

  export default class InlineCode implements InlineTool {
    constructor(options?: InlineToolConstructorOptions);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
}
