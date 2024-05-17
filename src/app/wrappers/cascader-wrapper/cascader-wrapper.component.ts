import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { NzCascaderOption } from 'ng-zorro-antd/cascader';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-cascader-wrapper',
  templateUrl: './cascader-wrapper.component.html',
  styleUrls: ['./cascader-wrapper.component.scss']
})
export class CascaderWrapperComponent extends FieldType<FieldTypeConfig> {
  nzOptions: any[] | null = null;
  values: any[] = [];
  selectedValues: any[] = [];
  constructor( private cdr: ChangeDetectorRef, private sharedService: DataSharedService , public dataSharedService: DataSharedService) {
    super();
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {

    if (this.to['additionalProperties']?.borderRadius) {
      document.documentElement.style.setProperty('--cascaderBorderRadius', this.to['additionalProperties']?.borderRadius);
      this.cdr.detectChanges();
    }
  }

  get list(): any {
    let options: any = this.to.options;
    if (options?.length > 0) {
      return options;
    } else {
      return [
      ];
    }
  }

  onChanges(values: any): void {
    const result = this.arrayToStringWithSlash(values);
    this.sharedService.onChange(result, this.field);
    console.log(result);
  }
  async loadData(node: NzCascaderOption, index: number): Promise<void> {
    
    let getNextNode = this.to['appConfigurableEvent'].find((a: any) => a.level == index + 1);
    let selected = JSON.parse(JSON.stringify(node.value));
    if (index == 1) {
      if (this.values[0] == 'Blue') {
        selected = JSON.parse(JSON.stringify(this.values[0]));
      }
    }
    let url = `knex-query/getexecute-rules/${getNextNode._id}`;
    // Root node - Load application data
    // try {
    //   const res = await this.applicationService.callApi(url, 'get', '', '', `${selected}`).toPromise();
    //   if (res.isSuccess) {
    //     let propertyNames = Object.keys(res.data[0]);
    //     let result = res.data.map((item: any) => {
    //       let newObj: any = {};
    //       let propertiesToGet: string[];
    //       if ('id' in item && 'name' in item) {
    //         propertiesToGet = ['id', 'name'];
    //       } else {
    //         propertiesToGet = Object.keys(item).slice(0, 2);
    //       }
    //       propertiesToGet.forEach((prop) => {
    //         newObj[prop] = item[prop];
    //       });
    //       return newObj;
    //     });
    //     const applicationID = this.dataSharedService.decryptedValue('appid');

    //     let finalObj = result.map((item: any) => {
    //       return {
    //         label: item.name || item[propertyNames[1]],
    //         value: item.id || item[propertyNames[0]],
    //         isLeaf: (this.values[0] == 'Green' && applicationID == '651fa8129ce5925c4c89ced7') ? (this.to['appConfigurableEvent'].length == index + 2 ? true : false) : (this.to['appConfigurableEvent'].length == index + 1 ? true : false)
    //       };
    //     });
    //     if (this.values.length == 2) {
    //       if (this.values[0] == 'Blue' && applicationID == '651fa8129ce5925c4c89ced7') {
    //         finalObj.forEach((a: any) => {
    //           if (a.value == 'Yes') {
    //             a.isLeaf = true;
    //           }
    //         });
    //       }
    //     }

    //     node.children = finalObj;
    //   } else {
    //     // this.toastr.error(res.message, { nzDuration: 3000 });
    //   }
    // } catch (err) {
    //   // this.toastr.error('An error occurred while loading application data', { nzDuration: 3000 });
    // }
  }

  processData(data: any) {
    if (data?.data?.length > 0) {
      const applicationID = JSON.parse(localStorage.getItem('appid')!);
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

      let finalObj = result.map((item: any) => {
        return {
          label: item.name || item[propertyNames[1]],
          value: item.id || item[propertyNames[0]],
          isLeaf: (item.id == 'Gold' || item.id == 'All' && applicationID == '651fa8129ce5925c4c89ced7') ? true : false,
        };
      });
      this.to.options = finalObj;
    }
    // Your processing logic here
    return data;
  }
  arrayToStringWithSlash(array: any[]): string {
    return array.join('/');
  }
}
