import { EventInput } from '@fullcalendar/core';

let eventGuid = 0;
const TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today

export const INITIAL_EVENTS: EventInput[] = [
  {
    id: createEventId(),
    title: 'All-day event',
    start: TODAY_STR,
    backgroundColor: '#fbe0e0',
    textColor: '#ea5455',
    color: '#EF6C00',
    borderColor: '#ea5455'
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: TODAY_STR ,
    end: TODAY_STR,
    backgroundColor: '#fbe0e0',
    textColor: '#ea5455',
    color: '#EF6C00',
    borderColor: '#ea5455'
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: TODAY_STR ,
    end: TODAY_STR,
    backgroundColor: '#fbe0e0',
    textColor: '#ea5455',
    color: '#EF6C00',
    borderColor: '#ea5455'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-03-02',
    end: '2023-03-05',
    backgroundColor: '#c7f4db',
    textColor: '#28c76f',
    color: 'white',
    borderColor: '#28c76f'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-03-06',
    end: '2023-03-06',
    backgroundColor: '#c7f4db',
    textColor: '#28c76f',
    color: 'white',
    borderColor: '#28c76f'
  },
  {
    id: createEventId(),
    title: 'HR',
    start: '2023-03-06',
    end: '2023-03-06',
    backgroundColor: '#ffe0c4',
    textColor: '#ff9f43',
    color: 'white',
    borderColor: '#ff9f43'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-03-07',
    end: '2023-03-07',
    backgroundColor: '#c7f4db',
    textColor: '#28c76f',
    color: 'white',
    borderColor: '#28c76f'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-03-07',
    end: '2023-03-07',
    backgroundColor: '#c9c5f9',
    textColor: '#5e50ee',
    color: 'white',
    borderColor: '#5e50ee'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-03-09',
    end: '2023-03-09',
    backgroundColor: '#c9c5f9',
    textColor: '#5e50ee',
    color: 'white',
    borderColor: '#5e50ee'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-03-10',
    backgroundColor: '#c9c5f9',
    textColor: '#5e50ee',
    color: 'white',
    borderColor: '#5e50ee'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-03-09',
    end: '2023-03-12',
    backgroundColor: '#ffe0c4',
    textColor: '#ff9f43',
    color: 'white',
    borderColor: '#ff9f43'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-04-02',
    end: '2023-04-05',
    backgroundColor: '#ffe0c4',
    textColor: '#ff9f43',
    color: 'white',
    borderColor: '#ff9f43'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-04-06',
    end: '2023-04-06',
    backgroundColor: '#ffe0c4',
    textColor: '#ff9f43',
    color: 'white',
    borderColor: '#ff9f43'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-04-07',
    end: '2023-04-07',
    backgroundColor: '#ffe0c4',
    textColor: '#ff9f43',
    color: 'white',
    borderColor: '#ff9f43'
  },
  {
    id: createEventId(),
    title: 'Personal',
    start: '2023-04-09',
    end: '2023-04-11',
    backgroundColor: '#ffe0c4',
    textColor: '#ff9f43',
    color: 'white',
    borderColor: '#ff9f43'
  },

];

export function createEventId() {
  return String(eventGuid++);
}
