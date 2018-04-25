import { TestBed, async, inject } from '@angular/core/testing';
import { MediaUploadService, MediaUploadInstance, MediaUpload } from './media-upload.service';
import {
  Response, Http, BrowserXhr, BaseRequestOptions,
  ConnectionBackend, HttpModule
} from '@angular/http';
import { FileService, MediaDetails, MediaFile, MediaFileObserverData, MediaFileInstance } from './file/file.service';
import { MockBackend } from '@angular/http/testing';
import { Observable } from 'rxjs/Observable';
import { PlatformHttpService } from '../platform-http.service';
import { FileChunk, FileChunkService, ChunkObserverData, ChunkInstance } from './file/file-chunk/file-chunk.service';

import { ConfigService } from '../../../core/services/config/config.service';

class MockCreateFileList {
  fileList: any = [];
  constructor(files: any[]) {
    files.forEach((file, idx) => {
      this.fileList.push(file);
    });
  }
}

class MockFileService {

}

class MockPlatformHttpService {
  post(a, b, c) {
    return Observable.of();
  }
}

class MockFileChunkService {
  post(a, b, c) {
    return Observable.of();
  }
}

//let  img = new Image('https://www.gstatic.com/webp/gallery/4.sm.jpg', { type: "application/jpg" });
let img;
this.img = new Image();
this.img.src = 'https://www.gstatic.com/webp/gallery/4.sm.jpg';
this.img.stretch = 'none';
let file1 = new File([img], 'image1', { type: 'text/json;charset=utf-8' });
let file2 = new File([img], 'image2', { type: 'text/json;charset=utf-8' });
let mediaUploadInst: MediaUploadInstance;
let fileObserver: MediaFileObserverData;
this.fileObserver = {
  observerType: 'UPLOAD-PROGRESS',
  chunkId: '', // chunk file id
  isError: false, // true indicates error
  errorMessage: 'error', // error message
  progressInBytes: 0,
  progressInPercent: 0
};
let fileList: FileList;
let blob: Blob;
// let mediaUpload: MediaUpload;
let fileId: ' ';
let progress: Observable<any>;
let mediaFile: MediaFile;
this.mediaUpload = {
  mediaItems: [file1, file2], // list of files which are added by user.
  instanceId: '', // in-case in future we want multiple instances of the mediaUPload, than this will identify mediaUpload instance uniquely
  isActive: true, // defines if MediaUpload is created and is active
  isUploadInProgress: true, // true indicates upload is in progress.
  isUploadPaused: false,
  progressObserver: this.progress, // overall file upload progress observer
  pendingQue: ['', ''], // array of mediaFileIDs which have not started yet
  progressQue: ['', ''], // array of mediaFileIDs which are currently in progress
  finishedQue: ['', ''], // array of mediaFileIDs which have finished upload. contains both successful upload and failed upload
  failedQue: ['', ''], // array of mediaFileIDs which have failed to upload.
  successfulQue: ['', '']
};
let fileListObject: FileList = (new MockCreateFileList([file1, file2])).fileList;

describe('Service: MediaUploadService', () => {
  let _service: MediaUploadService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MediaUploadInstance],
      imports: [HttpModule],
      providers: [
        {
          provide: FileService,
          useClass: MockFileService,
        }
        , BaseRequestOptions, PlatformHttpService, FileChunkService, ConfigService,
        MockBackend,
        {
          provide: Http,
          useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        }, ]
    });

    let mockPlatformHttpObject: any = new MockPlatformHttpService();
    let fileService = new FileService(mockPlatformHttpObject, null, null);
    _service = new MediaUploadService(fileService);
  }));

  it('MediaUploadService should be true', () => {
    expect(_service).toBeTruthy;
  });

  it(' Create MediaUpload to check mediaUpload thruthiness', () => {
    _service.createMediaUpload();
    expect(_service.mediaUpload).toBeTruthy();
  });
  it('Check whether mediaUpload is active', () => {
    _service.createMediaUpload();
    expect(_service.mediaUpload.isActive).toBeTruthy();
  });

  it('Create MediaUpload called when it was called already', () => {
    _service.createMediaUpload();

    // expect(console.error).toThrow('local-media-file upload instance already created. Call resetMediaItems() instead.');

    expect(() => {
      _service.createMediaUpload();
    }).toThrow('local-media-file upload instance already created. Call resetMediaItems() instead.');
    // expect(_service.createMediaUpload).toHaveBeenCalledWith('local-media-file upload instance already created. Call resetMediaItems() instead.');
  });

  it('ResetMediaItems called without createMediaUpload', () => {
    expect(() => {
      _service.resetMediaItems();
    }).toThrow('reset called on an invalid local-media-file-upload instance');
  });

  it('ResetMediaItems', () => {
    _service.createMediaUpload();

    _service.resetMediaItems();

    expect(_service.mediaUpload.mediaItems.length).toBe(0);
  });

  it('Add Media', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    expect(_service.mediaUpload.mediaItems.length).toBe(2);
  });

  it('removeMediaById without fileId', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    expect(() => {
      _service.removeMediaById('');
    }).toThrow('Please pass a fileId to remove a file from the upload list');
  });

  it('removeMediaById', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    let toBeRemovedFileId = _service.mediaUpload.mediaItems[0].id;

    _service.removeMediaById(_service.mediaUpload.mediaItems[0].id);

    expect(_service.mediaUpload.mediaItems[0].id).not.toBe(toBeRemovedFileId);
  });
  it('Start Upload when no files are selected', () => {
    _service.createMediaUpload();

    expect(() => {
      _service.startUpload();
    }).toThrow('Files are not selected.');
  });
  it('Start Upload when upload already started', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(MediaFileInstance.prototype, 'startUpload').and.callFake(() => {
      return true;
    });

    _service.startUpload();

    expect(() => {
      _service.startUpload();
    }).toThrow('Upload has already started');
  });

  it('Start Upload', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    spyOn(_service.mediaUpload, 'startUpload');

    _service.startUpload();

    expect(_service.mediaUpload.startUpload).toHaveBeenCalled();
  });

  it('Start Upload upload in progress', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    spyOn(_service.mediaUpload, 'uploadNext').and.callFake(() => {
      return true;
    });

    _service.startUpload();

    expect(_service.mediaUpload.isUploadInProgress).toBe(true);
  });

  it('Next upload when upload is paused', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    _service.mediaUpload.isUploadPaused = true;

    expect(_service.mediaUpload.uploadNext()).toEqual(null);
  });

  it('Next Upload checking pending Que', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(MediaFileInstance.prototype, 'startUpload').and.callFake(() => {
      return true;
    });

    expect(_service.mediaUpload.startUpload()).toBeTruthy();
  });

  it('Next Upload checking uploadFinished called', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    let finishedCalled = false;
    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(_service.mediaUpload, 'uploadFinished').and.callFake(() => {
      finishedCalled = true;
    });

    _service.mediaUpload.pendingQue = [];

    _service.mediaUpload.progressQue = [];

    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(_service.mediaUpload, 'updatePendingQue').and.callFake(() => {
      return true;
    });

    _service.startUpload();

    expect(finishedCalled).toBeTruthy();
  });

  it('Pause Upload when upload is already paused', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    _service.pauseUpload();

    expect(() => {
      _service.pauseUpload();
    }).toThrow('Upload is already paused.');
  });

  it('Pause Upload', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    let uploadPaused = false;

    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(MediaFileInstance.prototype, 'pauseUpload').and.callFake(() => {
      uploadPaused = true;
      return true;
    });
    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(MediaFileInstance.prototype, 'startUpload').and.callFake(() => {
      return true;
    });

    _service.startUpload();

    _service.pauseUpload();

    expect((uploadPaused && _service.mediaUpload.isUploadPaused)).toBeTruthy();
  });

  it('Resume Upload without pausing the upload', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    expect(() => {
      _service.resumeUpload();
    }).toThrow('Upload is not paused.');

  });

  it('Resume Upload', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    let isUploadResumed;

    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(MediaFileInstance.prototype, 'resumeUpload').and.callFake(() => {
      isUploadResumed = true;
      return true;
    });

    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(MediaFileInstance.prototype, 'startUpload').and.callFake(() => {
      return true;
    });

    _service.startUpload();

    _service.pauseUpload();

    _service.resumeUpload();

    expect((!_service.mediaUpload.isUploadPaused && isUploadResumed)).toBeTruthy();

  });

  it('Get failed local-media-file items', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    expect(_service.mediaUpload.getFailedMediaItems().length).toBe(0);
  });

  it('Get successful local-media-file items', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    expect(_service.mediaUpload.getSuccessfulMediaItems().length).toBe(0);
  });

  it('Upload Next observer Success', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    spyOn(ChunkInstance.prototype, 'startUpload').and.callFake(() => {
      return;
    });

    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(MediaFileInstance.prototype, 'startUpload').and.callFake(() => {
      return true;
    });

    _service.startUpload();

    _service.mediaUpload.mediaItems[0].updateObserver({
      observerType: 'UPLOAD-SUCCESS',
      mediaFileId: _service.mediaUpload.mediaItems[0].id,
      isError: false,
      errorMessage: ''
    });
  });

  it('Upload Next observer Error', () => {
    _service.createMediaUpload();
    _service.addMedia(fileListObject);

    spyOn(ChunkInstance.prototype, 'startUpload').and.callFake(() => {
      return;
    });

    // spy on startUpload of MediaItems so that HTTP call is not reached.
    spyOn(MediaFileInstance.prototype, 'startUpload').and.callFake(() => {
      return true;
    });

    _service.startUpload();

    _service.mediaUpload.mediaItems[0].updateObserver({
      observerType: 'UPLOAD-ERROR',
      mediaFileId: _service.mediaUpload.mediaItems[0].id,
      isError: false,
      errorMessage: ''
    });
  });

});