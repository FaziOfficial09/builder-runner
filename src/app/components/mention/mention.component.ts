import { Component, Input, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { MentionOnSearchTypes } from 'ng-zorro-antd/mention';

@Component({
  selector: 'st-mention',
  templateUrl: './mention.component.html',
  styleUrls: ['./mention.component.scss']
})
export class MentionComponent implements OnInit {
  @Input() mentionData: any;
  suggestion : any;
  // constructor() { }
  // get list(): any {
  //   return this.to.options;
  // }
  ngOnInit(): void {
  }

  onChange(value: string): void {
    console.log(value);
  }

  onSelect(suggestion: string): void {
    console.log(`onSelect ${suggestion}`);
  }
  onSearchChange({ value }: MentionOnSearchTypes): void {

    console.log(`search: ${value}`);
    // this.mentionData.loading = true;
    this.fetchSuggestions(value, suggestions => {
      console.log(suggestions);
      this.suggestion = suggestions.map((suggestions : any) => suggestions.label); ;
      // this.mentionData.loading = true;
    });
  }

  fetchSuggestions(value: string, callback: (suggestions: string[]) => void): void {
    const users = this.mentionData.options;
    setTimeout(() => callback(users.filter((item: any) => item.label.indexOf(value) !== -1)), 500);

  }

}
