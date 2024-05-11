import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { createEventId } from 'src/app/shared/event-utils/event-utils';
import { DataSharedService } from 'src/app/services/data-shared.service';


@Component({
  selector: 'st-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  @Input() calenderData: any;
  @Input() screenName: any;
  calendarOptions: CalendarOptions;
  calendarVisible = true;
  loader: boolean = false;
  eventData: any[] = [
    {
      "id": 1, // Increment the index to start from 1
      "title": 'asdfghfgh',
      "start": '2023-08-04',
      "backgroundColor": "#fbe0e0",
      "textColor": "#ea5455",
      "color": "#EF6C00",
      "borderColor": "#ea5455"
    },
    {
      "id": 2, // Increment the index to start from 1
      "title": 'assdfsd',
      "start": '2023-08-04',
      "backgroundColor": "#fbe0e0",
      "textColor": "#ea5455",
      "color": "#EF6C00",
      "borderColor": "#ea5455"
    },
    {
      "id": 3, // Increment the index to start from 1
      "title": 'asdqweqwe',
      "start": '2023-08-05',
      "backgroundColor": "#fbe0e0",
      "textColor": "#ea5455",
      "color": "#EF6C00",
      "borderColor": "#ea5455"
    },
    {
      "id": 4, // Increment the index to start from 1
      "title": 'asdasd',
      "start": '2023-09-02',
      "backgroundColor": "#fbe0e0",
      "textColor": "#ea5455",
      "color": "#EF6C00",
      "borderColor": "#ea5455"
    }
  ]
  ngOnInit() {

    this.eventData = this.calenderData.options;
    this.loader = false;
    this.calendarOptions = {
      plugins: [
        interactionPlugin,
        dayGridPlugin,
        timeGridPlugin,
        listPlugin,
      ],
      headerToolbar: {
        left: "sidebarToggle , " + this.calenderData?.view,
        center: 'title',
        right: this.calenderData?.viewType
      },
      initialView: 'dayGridMonth',
      initialEvents: this.eventData, // alternatively, use the `events` setting to fetch from a feed
      weekends: this.calenderData?.weekends,
      editable: this.calenderData?.editable,
      selectable: this.calenderData?.selectable,
      selectMirror: this.calenderData?.selectMirror,
      dayMaxEvents: this.calenderData?.dayMaxEvents,
      // select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.calenderData?.details ? this.handleEvents.bind(this) : undefined,
      eventDrop: this.handleEventDrop.bind(this),
      /* you can update a remote database when these fire:
      eventAdd:
      eventChange:
      eventRemove:
      */
    };
  }

  currentEvents: EventApi[] = [];

  constructor(private changeDetector: ChangeDetectorRef,
    public dataSharedService: DataSharedService,) {
    this.handleEvents.bind(this)

  }

  handleCalendarToggle() {
    this.calendarVisible = !this.calendarVisible;
  }

  handleWeekendsToggle() {

    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        backgroundColor: '#fbe0e0',
        textColor: '#ea5455',
        color: '#EF6C00',
        borderColor: '#ea5455'
      });
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    //   clickInfo.event.remove();
    // }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    this.changeDetector.detectChanges();
  }
  extractDate(date: any) {
    const dateObject = new Date(date);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Add 1 to the month because it's zero-based
    const day = String(dateObject.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  handleEventDrop(arg:any) {
    // Debugger statement
    debugger;

    // Finding an API configuration based on a specific condition
    let findClickApi = this.calenderData?.appConfigurableEvent?.find((item: { rule: string | string[]; }) => item.rule.includes('put'));

    // Check for permission to update
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId == this.dataSharedService.currentMenuLink);
    if (!checkPermission?.updates && this.dataSharedService.currentMenuLink != '/ourbuilder') {
      alert("You did not have permission");
      return;
    }

    // If no API configuration is found, exit the function
    if (!findClickApi) {
      return;
    }

    // Construct the URL for the API call
    const url = findClickApi._id ? `knex-query/executeDelete-rules/${findClickApi._id}` : '';
    if (!url) {
      return;
    }

    // Manipulating the event's start date using native JavaScript
    const newStart = new Date(arg.event.start.toString());

    // Add 1 day to the date
    newStart.setDate(newStart.getDate() + 1);

    // Format the date to ISO format 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    const newdateData = newStart.toISOString();

    console.log(newdateData);

    // Constructing the model for the API request
    const model = {
      screenId: this.screenName,
      postType: 'put',
      modalData: {
        'id': arg.event.id,
        'datetime': `'${newdateData}'`,
      }
    };

    // Indicating that the loading process has started
    this.loader = true;
    console.log(model);

    // Making the API call
    // this.applicationServices.addNestCommonAPI(url, model).subscribe({
    //   next: (res) => {
    //     if (res) {
    //       this.toastr.success('Update Successfully', { nzDuration: 3000 });
    //     }
    //     this.loader = false;
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.toastr.error('An error occurred', { nzDuration: 3000 });
    //     this.loader = false;
    //   }
    // });
  }



}
