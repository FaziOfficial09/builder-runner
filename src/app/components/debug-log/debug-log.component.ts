import { Component } from '@angular/core';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'st-debug-log',
  templateUrl: './debug-log.component.html',
  styleUrls: ['./debug-log.component.scss']
})
export class DebugLogComponent {
  options: { label: string, value: any }[] = [];

  constructor(private dataSharedService: DataSharedService
  ) { }
  ngOnInit(): void {
    this.options = this.dataSharedService.loggerDebug;
  }
  getLink(id: any): string {
    return environment.loggerUrl + id;
  }
}
