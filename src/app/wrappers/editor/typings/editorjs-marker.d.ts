declare module '@editorjs/marker' {
  import { InlineTool } from '@editorjs/editorjs';

  export default class Marker implements InlineTool {
    constructor();
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
}
