declare module '@editorjs/delimiter' {
  import { BlockTool } from '@editorjs/editorjs';

  export default class Delimiter implements BlockTool {
    constructor();
    render(): HTMLElement;
    save(): {};
  }
}
