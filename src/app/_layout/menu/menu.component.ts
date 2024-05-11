import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataSharedService } from '../../services/data-shared.service';
import { StorageService } from '../../services/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'st-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() selectedTheme: any;
  selectedLanguageObj: any | undefined;
  @Output() notify: EventEmitter<any> = new EventEmitter();
  departments: any;
  applications: any;
  selectedApp: string = '';

  isVisible: boolean = false;
  showCollapseButton: boolean = true;
  requestSubscription: Subscription;
  currentUser: any;
  languages = [
    {
      id: 'english',
      title: 'English',
      flag: 'us.png'
    },
    {
      id: 'arabic',
      title: 'Arabic',
      flag: 'arabic.png'
    },
    {
      id: 'russian',
      title: 'Russian',
      flag: 'russian.png'
    },
    {
      id: 'chinese',
      title: 'Chinese',
      flag: 'chinese.png'
    }
  ];
  constructor(
    public dataSharedService: DataSharedService, private storageService: StorageService, private translate: TranslateService) {
    const currentLanguageString = this.storageService.getString("currentLanguage");
    let currentLanguage: any;
    if (currentLanguageString !== null) {
      currentLanguage = JSON.parse(currentLanguageString);
      this.translate.setDefaultLang(currentLanguage);
    } else {
      this.translate.setDefaultLang('english');
      this.storageService.storeString(
        'currentLanguage',
        JSON.stringify('english')
      );
    }
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('user')!);
    // this.getApllicationAndModule();
    const currentLanguageString = this.storageService.getString("currentLanguage");
    let currentLanguage: any;

    if (currentLanguageString !== null) {
      currentLanguage = JSON.parse(currentLanguageString);
      this.selectedLanguageObj = this.languages.find(language => language.id == currentLanguage);
    }
    // this.requestSubscription = this.dataSharedService.collapseMenu.subscribe({
    //   next: (res) => {
    //     if (res)
    //       this.isCollapsed = res;
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     // this.toastr.error("An error occurred", { nzDuration: 3000 });
    //   }
    // })
  }
  openComment() {
    this.isVisible = true;
  }
  handleCancel(): void {
    this.isVisible = false;
  }
  setLanguage(lang: string): void {

    this.selectedLanguageObj = this.languages.find(
      (record) => record.id === lang
    );
    this.dataSharedService.setLanguageChange(lang);
    this.storageService.storeString(
      'currentLanguage',
      JSON.stringify(lang)
    );
    this.translate.use(lang);
  }
  ngOnDestroy() {
    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
    }
  }
  menuCollapsed() {
    if (this.selectedTheme.layout != 'horizental') {
      this.selectedTheme.isCollapsed = !this.selectedTheme.isCollapsed;
    }
  }
}
