import { Component, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { Subscription } from 'rxjs';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent extends FieldType<FieldTypeConfig> {
  filteredOptions: any = [];
  inputValue?: any;
  requestSubscription: Subscription;
  constructor(private sharedService: DataSharedService) {
    super();
  }
  get list(): any {
    return this.to.options;
  }
  ngOnInit(): void {
    this.filteredOptions = this.to.options;
    this.processData = this.processData.bind(this);
  }
  onChange(value: string): void {
    this.filteredOptions = this.list.filter((option : any) => option.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }

  onModelChange(event: any, model: any) {
    if(event){
      if(!event.value)
      {
        this.sharedService.onChange(event, this.field);
      }else{
        this.sharedService.onChange(event.value, this.field);
      }
      // console.log(event.value, model);
    }
  }
  ngOnDestroy(): void {
    if(this.requestSubscription)
      this.requestSubscription.unsubscribe();
  }
  processData(data: any) {
    if(data?.data?.length  > 0){
      let propertyNames = Object.keys(data?.data[0]);
      let result = data?.data.map((item: any) => {
        let newObj: any = {};
        let propertiesToGet: string[];
        if ('id' in item && 'name' in item) {
          propertiesToGet = ['id', 'name'];
        } else {
          propertiesToGet = Object.keys(item).slice(0, 2);
        }
        propertiesToGet.forEach((prop) => {
          newObj[prop] = item[prop];
        });
        return newObj;
      });

      let finalObj = result.map((item:any) => {
        return {
          label: item.name ||  item[propertyNames[1]],
          value: item.id  ||  item[propertyNames[0]],
        };
      });
      this.field.props.options = finalObj;
    }
    // Your processing logic here
    return data;
  }
}
