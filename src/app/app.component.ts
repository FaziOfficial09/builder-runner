
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'st-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  title = 'ngZorro';
  editorData: any ={
    "time": 1680808292528,
    "blocks": [
      {
        "id": "50vS0E6nc0",
        "type": "table",
        "data": {   
          "withHeadings": true,
          "content": [
            [
              "frwewer",
              "wer"
            ],
            [
              "werwe",
              "werwer"
            ],
            [
              "rtyrtyr",
              "eteer"
            ],
            [
              "eterte",
              "tr"
            ]
          ]
        }
      },
      {
        "id": "Mgm4JU6IRG",
        "type": "paragraph",
        "data": {
          "text": "tyrtyryyt"
        }
      },
      {
        "id": "jjY1hANEgr",
        "type": "code",
        "data": {
          "code": "jhggjhgjghjdfgdfgdf gdfg"
        }
      },
      {
        "id": "ptFJI1qHf5",
        "type": "checklist",
        "data": {
          "items": [
            {
              "text": "jhgjhhg",
              "checked": true
            },
            {
              "text": "jhgghj",
              "checked": false
            },
            {
              "text": "jhgj",
              "checked": false
            },
            {
              "text": "jgghj",
              "checked": false
            },
            {
              "text": "jhgg",
              "checked": false
            },
            {
              "text": "jhgg",
              "checked": false
            }
          ]
        }
      },
      {
        "id": "rLK_xV5cB4",
        "type": "list",
        "data": {
          "style": "ordered",
          "items": [
            "fgfghfgh",
            "iuuiyui",
            "iyyui",
            "uououi",
            "iyuyiyu",
            "768787"
          ]
        }
      }
    ],
    "version": "2.26.5"
  } ;
  constructor() {
  }
}
