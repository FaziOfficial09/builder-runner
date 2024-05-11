import { Component, Input } from '@angular/core';
import { log } from 'console';

@Component({
  selector: 'st-recycle',
  templateUrl: './recycle.component.html',
  styleUrls: ['./recycle.component.scss']
})
export class RecycleComponent {
  @Input() charts: any;
  chartData: any[] = [];
  /**
   *
   */

  // chartdata:any
  constructor() {
    this.processData = this.processData.bind(this);


  }
  processData(data: any) {
    // debugger
    console.log("Recycle Charts", data?.data);
    let propertyNames = Object.keys(data?.data[0]);
    let result = data?.data?.map((item: any) => {
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
        weekno: item.name || item[propertyNames[1]],
        status: item.id || item[propertyNames[0]],
      };
    });

    this.chartData = [];
    let objChartData: any[] = [];
    if (data?.data?.length > 0) {
      finalObj.forEach((element: any) => {
        const existingEntryIndex = objChartData.findIndex(entry => entry.label === element.weekno);
        if (existingEntryIndex !== -1) {
          objChartData[existingEntryIndex].data.push(element.status);
        } else {
          objChartData.push({
            label: element.weekno,
            data: [element.status]
          });
        }
      });

      console.log('Chart Data Obj:', objChartData);

      // Step 2: Transform the chartData array to include counts
      this.chartData = objChartData.map(item => ({
        label: item.label,
        data: this.countOccurrences(item.data)
      }));

      this.chartData = this.applySequence(this.chartData);
      console.log('Chart Data:', this.chartData);

      this.chartData.sort((a, b) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });

      console.log('sorted Chart Data:', this.chartData);

    }
    return data;
  }

  countOccurrences(arr: any[]): { label: string, count: number }[] {
    const counts: { [key: string]: number } = {};
    arr.forEach(status => {
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.keys(counts).map(label => ({ label, count: counts[label] }));


  }

  applySequence(data: any) {
    let sequenceArray: any = [
      { label: 'open', value: 0 },
      { label: 'in progress', value: 0 },
      { label: 'testing', value: 0 },
      { label: 'completed', value: 0 },
      { label: "moved", value: 0 },
    ]
    // Create a deep copy of the data
    let requiredResult: any = JSON.parse(JSON.stringify(data));

    // Iterate through each workflow's data
    requiredResult.forEach((workflow: any) => {
      // Create a new array to store tasks in the desired sequence
      let newData: any = [];
      sequenceArray.forEach((seqItem: any) => {
        // Find the task in the workflow data
        let task = workflow.data.find((task: any) => task.label.toLowerCase().trim() === seqItem.label.toLowerCase().trim());
        if (task) {
          newData.push(task);
        } else {
          // If the task doesn't exist, add it with count 0
          newData.push({ label: seqItem.label, count: seqItem.value });
        }
      });
      // Update the workflow data with tasks in the desired sequence
      workflow.data = newData;
    });
    return requiredResult
  }
}
