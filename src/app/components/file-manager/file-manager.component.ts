import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'st-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() data: any;
  folderList: any[] = []
  filesList: any[] = [];
  saveLoader: boolean = false;
  folderName: string = '';

  tableLoader: any = false;
  loadRequestTab: any = false;
  collectionList: any[] = [];

  selectedDate: any;
  start = 1;
  end = 10;
  pnOrderId = 0;
  totalRecordCount = 0;
  customerList = [];
  constructor(private toastr: NzMessageService, private socketService: SocketService,private dataSharedService:DataSharedService) { }
  breadcrumbFolder: any[] = [];
  ngOnInit(): void {
    this.createDefaultFolder();
  }

  createDefaultFolder() {
    const { jsonData, newGuid } = this.socketService.makeJsonData('CreateUserFolder', '3017');
    this.dataSharedService.saveDebugLog('createDefaultFolder',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(res => {
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        if (res.isSuccess) {
          this.loadFolder();
        }
      }
    })
  }
  loadFolder() {
    if (this.breadcrumbFolder.length == 0) {
      this.getAllFolders();
    }
    else {
      this.getSubFolder(this.selectedFolder);
    }
  }

  getAllFolders() {
    this.isActiveShow = false;
    this.selectedFolder = {};
    this.breadcrumbFolder = [];
    const { jsonData, newGuid } = this.socketService.makeJsonData('GetParentFolder', '2019');
    this.dataSharedService.saveDebugLog('GetParentFolder',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(res => {
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata.data;
        if (res.isSuccess) {
          this.folderList = res.data || []
          console.log(res);
          console.log(res.data);
        } else {
          this.folderList = [];
        }
        this.filesList = [];
      }
    })
  }

  selectSubFolder(folder: any) {
    this.breadcrumbFolder.push(folder);
    this.getSubFolder(folder);
  }

  selectedFolder: any;
  getSubFolder(folder: any) {
    this.selectedFolder = folder;
    this.saveLoader = true;
    this.isActiveShow = false;
    this.folderName = '';
    this.folderList = [];
    const folderwithfiles: any = {
      id: folder.id
    }
    const { jsonData, newGuid } = this.socketService.makeJsonfileData('2022', folderwithfiles);
    this.dataSharedService.saveDebugLog('getSubFolder',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(res => {
      debugger
      this.saveLoader = false;
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        debugger
        res = res.parseddata.apidata;
      if (res.isSuccess) {
        debugger
        this.folderList = res?.data?.folderList?.data || [] ;
        this.filesList = res?.data?.filesList?.data|| [];
        this.collectionList = res?.data?.filesList?.data|| [];
        this.totalRecordCount = res.totalRecordCount;
        this.filesList = this.collectionList.length > 6 ? this.collectionList.slice(0, 6) : this.collectionList;
        this.end = this.filesList.length > 6 ? 6 : this.filesList.length;
      }
      else {
        this.filesList = [];
        this.folderList = [];
      }
    }
    })
  }
  gotoFolder(index: number) {
    this.isActiveShow = false;
    this.selectedFolder = this.breadcrumbFolder[index];
    this.breadcrumbFolder = this.breadcrumbFolder.splice(0, index + 1);
    this.getSubFolder(this.selectedFolder);
  }
  remove(item: any) {
    this.saveLoader = true;
    const removedata: any = {
      item: item
    }
    const { jsonData, newGuid } = this.socketService.makeJsonfileData('5005', removedata);
    this.dataSharedService.saveDebugLog('removeFolder',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(res => {
      this.saveLoader = false;
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        if (res.isSuccess) {
          this.toastr.success(res.message, { nzDuration: 3000 });
          this.loadFolder();
        }
      }
    })
  }
  deleteFolder(item: any) {
    debugger
    this.saveLoader = true;
    const removedata: any = {
      item: item
    }
    const { jsonData, newGuid } = this.socketService.makeJsonfileData('5004', removedata);
    this.dataSharedService.saveDebugLog('deleteFolder',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(res => {
      this.saveLoader = false;
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        if (res.isSuccess) {
          this.toastr.success(res.message, { nzDuration: 3000 });
          this.loadFolder();
        }
      }
    })
  }
  addFolder() {
    const gets3Folder = this.breadcrumbFolder.map(a => a.folderName);
    const model: any = {
      foldername: this.folderName,
      parentId: this.selectedFolder?._id,
      s3foldername: gets3Folder.length > 0 ? gets3Folder.join('/') + '/' + this.folderName : this.folderName
    };

    const { jsonData, newGuid } = this.socketService.makeJsonfileData('3016', model);
    this.dataSharedService.saveDebugLog('addFolder',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(res => {
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        if (res.isSuccess) {
          this.folderName = '';
          this.toastr.success(res.message, { nzDuration: 3000 });
          this.loadFolder();
        }
      }
    })
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.uploadFile(file);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async uploadFile(file: File) {
    this.saveLoader = true;
    const gets3Folder = this.breadcrumbFolder.map(a => a.folderName);
    const fileData: any = {
      originalname: file.name,
      mimetype: file.type,
      buffer:await this.socketService.readFileAsArrayBuffer(file),
      size: file.size,
      parentId: this.selectedFolder?.id,
      path: gets3Folder.join('/')
    };

    const { jsonData, newGuid } = this.socketService.makeJsonfileData('3018', fileData);
    this.dataSharedService.saveDebugLog('uploadFile',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          this.saveLoader = false;
          this.loadFolder();
          this.toastr.success(res.message, { nzDuration: 3000 });
          console.log('File uploaded successfully:', res);
        }
      },
      error: (err) => {
        this.saveLoader = false;
        // this.isLoading = false;
        console.error('Error uploading file:', err);
      }
    });

  }
  iconClass(fileType: string) {
    let iconName = 'fas fa-file'; // Default icon for unknown file types

    switch (fileType) {
      case 'application/pdf':
        iconName = 'fas fa-file-pdf';
        break;
      case 'image/png':
      case 'image/jpeg':
        iconName = 'fas fa-file-image';
        break;
      case 'text/plain':
        iconName = 'fas fa-file-alt';
        break;
      case 'application/msword':
        iconName = 'fas fa-file-word';
        break;
      case 'application/vnd.ms-excel':
        iconName = 'fas fa-file-excel';
        break;
      case 'application/vnd.ms-powerpoint':
        iconName = 'fas fa-file-powerpoint';
        break;
      case 'application/zip':
        iconName = 'fas fa-file-archive';
        break;
      case 'video/mp4':
        iconName = 'fas fa-file-video';
        break;
    }

    return iconName;
  }


  formatFileSize(by: any): string {
    const bytes = parseInt(by);
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
  }
  pageIndex: number = 1;
  pageSize: number = 6;

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.updatefilesList();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.updatefilesList();
  }

  updatefilesList(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.start = start == 0 ? 1 : ((this.pageIndex * this.pageSize) - this.pageSize) + 1;
    this.filesList = this.collectionList.slice(start, end);
    this.end = this.filesList.length != 6 ? this.collectionList.length : this.pageIndex * this.pageSize;
  }
  downloadFile(data: any) {
    window.open(this.data?.apiUrl || environment.nestImageUrl + data?.storagepath, '_blank');
  }

  isVisible = false;
  sharingEmail: string = ''
  tagging: string = ''
  updateFileDetails: any;
  showModal(file: any): void {
    this.updateFileDetails = file;
    this.tagging = file?.tagging;
    this.convertTagsToString(file?.tagging);
    this.sharingEmail = file?.share;
    this.isVisible = true;
  }
  convertTagsToString(tagging: any): void {
    // Convert the array of key-value pairs back into a string
    this.tagging = tagging?.map((tagObj: any) => tagObj.Key).join(', ');
  }
  handleOk(): void {
    this.updateFile();
    console.log('Button ok clicked!');
    this.isVisible = false;
  }

  handleCancel(): void {
    this.updateFileDetails = {};
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }
  tagsList: { Key: string, Value: string }[] = [];

  updateTagsList(): void {
    // Split the tagging string into an array using a comma as the delimiter
    const tags = this.tagging.split(',').map(tag => tag.trim());

    // Create an array of objects with key-value pairs
    this.tagsList = tags.map(tag => ({ Key: tag, Value: tag }));

    // You can trim the tags and remove any empty strings if needed
    this.tagsList = this.tagsList.filter(tagObj => tagObj.Key !== '');
  }

  updateFile() {

    this.updateFileDetails['share'] = this.sharingEmail;
    this.updateFileDetails['tagging'] = this.tagsList;
    this.saveLoader = true;
    const updatefiledata:any= {
      id:this.updateFileDetails?._id,
      filedetails:this.updateFileDetails
    }
    const { jsonData, newGuid } = this.socketService.makeJsonfileData('4005',updatefiledata );
    this.dataSharedService.saveDebugLog('updateFile',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
        this.saveLoader = false;
        if (res.isSuccess) {
          this.sharingEmail = ''
          this.tagging = ''
          this.toastr.success(res.message, { nzDuration: 3000 });
          this.loadFolder();
        } else {
          this.toastr.error(res.message, { nzDuration: 3000 });
        }
        this.updateFileDetails = {};
        console.log('File update successfully:', res);
      }
      },
      error: (err) => {
        this.saveLoader = false;
        // this.toastr.error(err, { nzDuration: 3000 });
        // this.isLoading = false;
        console.error('Error uploading file:', err);
      }
    });
  }
  isActiveShow: boolean = false
  getRecordsBySharedEmail() {
    this.isActiveShow = true;
    const { jsonData, newGuid } = this.socketService.makeJsonData('GetRecordsBySharedEmail', '2021');
    this.dataSharedService.saveDebugLog('getRecordsBySharedEmail',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(res => {
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata.data;
        if (res.isSuccess) {
          this.filesList = res.data
        }
      }
    })
  }
}
