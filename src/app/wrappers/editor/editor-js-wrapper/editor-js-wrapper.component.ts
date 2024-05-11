import { Component, OnInit, ViewChild, ElementRef, forwardRef, OnDestroy, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';

import List  from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import Warning from '@editorjs/warning';
import ImageTool from '@editorjs/image';


// Import other tools as needed

@Component({
  selector: 'st-editor-js-wrapper',
  templateUrl: './editor-js-wrapper.component.html',
  styleUrls: ['./editor-js-wrapper.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorJsWrapperComponent),
      multi: true
    }
  ]
})
export class EditorJsWrapperComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editorContainer', { static: true }) editorContainer: ElementRef;
  @Input() minHeight: string = '300px';
  @Input() data:any;
  private editor: EditorJS;
  private onChange: (data: OutputData) => void;
  private onTouched: () => void;

  constructor() { }

  ngOnInit(): void {

    this.editor = new EditorJS({
      holder: this.editorContainer.nativeElement,
      data: this.data,
      // minHeight: this.minHeight,
      tools: {
        header: {
          class: Header,
          inlineToolbar: ['link']
        },
        list: {
          class: List,
          inlineToolbar: ['link']
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true
        },
        quote: {
          class: Quote,
          inlineToolbar: true
        },
        marker: {
          class: Marker,
          inlineToolbar: true
        },
        code: {
          class: Code,
          inlineToolbar: true
        },
        delimiter: Delimiter,
        inlineCode: {
          class: InlineCode,
          inlineToolbar: true
        },
        linkTool: {
          class: LinkTool,
          inlineToolbar: true
        },
        embed: {
          class: Embed,
          inlineToolbar: true
        },
        table: {
          class: Table,
          inlineToolbar: true
        },
        warning: {
          class: Warning,
          inlineToolbar: true
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: 'URL_TO_YOUR_IMAGE_UPLOADER', // Replace with your image uploader URL
              byUrl: 'URL_TO_YOUR_IMAGE_UPLOADER' // Replace with your image uploader URL
            }
          }
        }
      },
      onChange: async () => {
        if (this.onChange) {
          this.onChange(await this.editor.save());
        }
        if (this.onTouched) {
          this.onTouched();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  writeValue(data: OutputData): void {

    if (this.editor && data) {
      this.editor.clear();
      this.editor.render(data);
    }
  }

  registerOnChange(fn: (data: OutputData) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implement this method if you need to support the disabled state
  }
}


