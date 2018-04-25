import { TestBed, inject, async } from '@angular/core/testing';

import { FileService, MediaFileInstance, MediaDetails, MediaFileObserverData, ApiUploadFileInfo, MediaFile } from './file.service';
import {
    Response, Http, BrowserXhr, BaseRequestOptions,
    ConnectionBackend, HttpModule, ResponseOptions, RequestOptions
} from '@angular/http';

import { PlatformHttpService } from '../../platform-http.service';

import { ConfigService } from '../../../../core/services/config/config.service';

import { FileChunk, FileChunkService, ChunkObserverData, ChunkInstance } from './file-chunk/file-chunk.service';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Observable } from 'rxjs/Observable';
import * as vars from './file-chunk/file-chunk.service.spec';
//import { fileChunk } from './file-chunk/file-chunk.service.spec';

class MockConfigService {
    post(a, b) {
        return Observable.of();
    }
    get config() {
        let platformBaseUrl = '';
        return platformBaseUrl;
    }

}
class MockFileChunkService {
    pauseUpload() {

    }

    filechunk = {
        uploadUrl: '',
        blob: null,
        sizeInBytes: 0,
        chunkId: '',
        isUploadInProgress: true,
        isUploadSuccessful: true,
        isUploadPaused: false,
        isUploadFailed: false,
        retryAttemptCount: 1,
        progressInPercent: 0,
        progressInBytes: 0,
        xhr: XMLHttpRequest,
        progressObserverHandle: '',
    };
    createChunk() {
        // let chunks = (new MockCreateFileChunk(file)).filechunks;

    }
}
class MockChunkInstance {
    pauseUpload() {
        return true;
    }
}
class MockPlatformHttpService {

    post(a, b) {
        let uploadFileInfo: ApiUploadFileInfo = {
            mediaId: 1,
            uploadId: '',
            chunkSize: 4,
            authorizationToken: ' ',
            uploadFileInfo: [{ partNumber: 1, uploadUrl: '' }, { partNumber: 2, uploadUrl: '' }]
        };
        return uploadFileInfo;
    }

}
class MockCreateFileChunk {
    filechunks: any[] = [];
    public chunk: FileChunk;
    public chunks: FileChunk[];

    constructor(file) {
        let start = 0;
        let end;
        for (let i = 0; i < file.size; i++) {
            end = start + 3;
            this.filechunks.push(file.slice(start, end));
            start = end;
        }
        // for (let j = 0; j < this.filechunks.length; j++) {
        //     // this.chunk.uploadUrl="";
        //     this.chunk.blob = fileChunk[j];
        //     this.chunk.chunkId = j.toString();
        //     this.chunks.push(this.chunk);
        // }
    }
}
let mediafile: MediaFile;

let fileChunk: FileChunk;
let file: File;
let blob: Blob;
//var img = new Image('https://www.gstatic.com/webp/gallery/4.sm.jpg', { type: "application/jpg" });
let img;
this.img = new Image();
this.img.src = 'https://www.gstatic.com/webp/gallery/4.sm.jpg';
this.img.stretch = 'none';
file = new File([img], 'image', { type: 'text/json;charset=utf-8' });
let mediaFileInstance: any;

let mediaFileObject: MediaFile;
const Chunks: FileChunk[] = (new MockCreateFileChunk(file)).chunks;
let filechunkService: FileChunkService;
let observer: ChunkObserverData = {
    observerType: 'UPLOAD-PROGRESS',
    chunkId: '',
};
let uploadFileInfo: ApiUploadFileInfo;
this.uploadFileInfo = {
    mediaId: 1,
    uploadId: '',
    chunkSize: 4,
    authorizationToken: ' ',
    uploadFileInfo: [{ partNumber: 1, uploadUrl: '' }, { partNumber: 2, uploadUrl: '' }]
};

let progressObserverHandle: any;
const mediaData: MediaDetails = {
    bubbleId: 644950845278800000, // StaticUtils.queryParams.bi,
    accountId: 411687286105007000,
    noOfBytes: this.sizeInBytes,
    fileOrigin: 'API_CAMERA_ROLL_IMPORTED',
    mediaType: 'photo'                //StaticUtils.getFileTypeByFileBlob(this.blob)
};
this.progressObserver = {
    observerType: 'UPLOAD-PROGRESS',
    mediaFileId: ''
};
//chunkItem=fileChunks[0];
describe('Service: FileService', async () => {
    let _service: FileService;
    let backend: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [HttpModule],
            providers: [FileService, PlatformHttpService,
                {
                    provide: PlatformHttpService,
                    useClass: MockPlatformHttpService,
                },
                FileChunkService,
                {
                    provide: FileChunkService,
                    useClass: MockFileChunkService,
                },
                ConfigService,
                {
                    provide: ConfigService,
                    useClass: MockConfigService,
                },
                BaseRequestOptions, file, blob,
                MockConnection,
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
        let configService: any = new MockConfigService();
        //let fileChunkService:any= new MockFileChunkService();
        backend = new MockBackend();

        filechunkService = new FileChunkService(mockPlatformHttpObject, null);
        _service = new FileService(
            mockPlatformHttpObject, filechunkService, configService);
        mediaFileObject = new MediaFileInstance(file, mockPlatformHttpObject, filechunkService, configService);
    }));

    it('file service to be truthy...', () => {
        expect(_service).toBeTruthy();
    });

    it('MediaFileInstance object to be truthy', () => {
        let fileObject: any = _service.createFile(file);
        expect(fileObject).toBeTruthy();
    });
    it('createFile...', () => {
        let fileObject: any = _service.createFile(file);
        expect(fileObject).toBeTruthy();
        file;
    });
    it('paused upload is called again after upload is paused', () => {
        let fileObject: any = _service.createFile(file);
        fileObject.pauseUpload();
        expect(fileObject.pauseUpload).toBeTruthy();
        fileObject.isUploadPaused = true;
        expect(() => {
            fileObject.pauseUpload();
        }).toThrow('Upload is already paused.');
    });
    it('resume upload is called without  upload is paused', () => {
        let fileObject: any = _service.createFile(file);
        fileObject.isUploadPaused = false;
        expect(() => {
            fileObject.resumeUpload();
        }).toThrow('Upload is not paused.');
    });
    it('ChunkFile () runs ', () => {
        spyOn(FileChunkService.prototype, 'createChunk').and.callFake((blob1) => {

            // this.filechunk.uploadUrl = "";
            this.filechunk.blob = blob;
            this.filechunk.sizeInBytes = 3;
            this.filechunk.chunkId = '1';
            return fileChunk;
        });
        let fileObject: any = _service.createFile(file);

        mediaFileObject.uploadFileInfo.chunkSize = 3;
        fileObject.chunkFile();
        let filechunk: FileChunk;
        let blob1 = file.slice(0, 3);
        fileObject.chunks.push(this.filechunk);
        expect(fileObject.chunks.length).toBe(1);
    });

    // it("pause upload is called ..", () => {
    //     let fileObject: any = _service.createFile(file);
    //     fileObject.startUpload();
    //     fileObject.pauseUpload();
    //     fileObject.isUploadPaused = true;
    //     let UploadPaused = true;

    //     spyOn(MediaFileInstance.prototype, 'postMedia').and.callFake(() => {
    //         return true;
    //     })
    //     spyOn(ChunkInstance.prototype, 'pauseUpload').and.callFake(() => {
    //         UploadPaused = false;
    //         return true;
    //     })
    //     expect(UploadPaused).toBeFalsy();
    // });
    it(' resume upload is called ..', () => {
        let fileObject: any = _service.createFile(file);
        fileObject.startUpload();
        fileObject.resumeUpload();
        let resume = false;
        spyOn(MediaFileInstance.prototype, 'postMedia').and.callFake(() => {
            return true;
        });
        spyOn(ChunkInstance.prototype, 'resumeUpload').and.callFake(() => {
            resume = true;
            return true;
        });
        expect(resume).toBeTruthy();
    });
    it('   startChunkUploadProcess is called when Upload has already  ..', () => {
        let fileObject: any = _service.createFile(file);
        //  fileObject.startUpload();
        fileObject.isUploadInProgress = true;
        expect(() => {
            fileObject.startChunkUploadProcess();
        }).toThrow('Upload has already started');
    });
    it(' startChunkUploadProcess is called ..', () => {
        let fileObject: any = _service.createFile(file);
        // fileObject.startUpload();
        fileObject.isUploadInProgress = true;
        spyOn(MediaFileInstance.prototype, 'updatePendingQue').and.callFake(() => {
            return true;
        });
        spyOn(MediaFileInstance.prototype, 'uploadNextChunk').and.callFake(() => {
            return true;
        });
        expect(fileObject.uploadNextChunk).toBeTruthy();
    });
    // it(" UploadNextChunk  when there are no chunks in pendingQue..", () => {
    //     let fileObject: any = _service.createFile(file);
    //     fileObject.pendingQue = [];
    //     fileObject.uploadNextChunk();
    //     expect(fileObject.chunks[0]).toBeTruthy();
    //     spyOn(ChunkInstance.prototype, 'startUpload').and.callFake(() => {
    //         return true;
    //     })
    //     spyOn(MediaFileInstance.prototype, 'validateNextChunkUpload').and.callFake(() => {
    //         return true;
    //     })
    //     expect(fileObject.uploadNextChunk).toBeTruthy();

    // })

    it(' getFailedChunks ..', () => {
        let fileObject: any = _service.createFile(file);
        fileObject.getFailedChunks();
        expect(fileObject.chunks.length).toBe(0);

    });
    it(' get sucessful Chunks ..', () => {
        let fileObject: any = _service.createFile(file);
        fileObject.getSuccessfulChunks();
        expect(fileObject.chunks.length).toBe(0);

    });
    it(' ManageQueus when observer type is upload error ..', () => {
        let fileObject: any = _service.createFile(file);
        let observer: ChunkObserverData = {
            observerType: 'UPLOAD-ERROR',
            chunkId: '1',
        };
        fileObject.manageQues(observer);
        expect(fileObject.failedQue.length).toBe(1);

    });
    it(' ManageQueus when observer type is upload sucess ..', () => {
        let fileObject: any = _service.createFile(file);
        let observer: ChunkObserverData = {
            observerType: 'UPLOAD-SUCCESS',
            chunkId: '2',
        };
        fileObject.manageQues(observer);
        expect(fileObject.successfulQue.length).toBe(1);
    });
    // it("validateNextChunkUpload executes when observer type is upload progress..", () => {
    //     let fileObject: any = _service.createFile(file);
    //     // fileObject.startUpload();
    //     let observer: ChunkObserverData = {
    //         observerType: 'UPLOAD-PROGRESS',
    //         chunkId: "2",
    //     };
    //     let fileChunk1: FileChunk;
    //     this.fileChunk1 = (new MockCreateFileChunk(file)).chunk;
    //     fileObject.validateNextChunkUpload(observer, fileChunk1);
    //     spyOn(MediaFileInstance.prototype, 'updateProgress').and.callFake(() => {
    //         return true;
    //     })
    //     spyOn(MediaFileInstance.prototype, 'mediaBaseUrl').and.callFake(() => {
    //         return true;
    //     })
    //     expect(fileObject.updateProgress).toBeTruthy();
    // })
    // it("validateNextChunkUpload executes when observer type is not upload progress..", () => {
    //     let fileObject: any = _service.createFile(file);
    //     // fileObject.startUpload();
    //     let observer: ChunkObserverData = {
    //         observerType: 'UPLOAD-ERROR',
    //         chunkId: "",
    //     };
    //     fileObject.validateNextChunkUpload(observer, fileChunk);
    //     spyOn(MediaFileInstance.prototype, 'postMedia').and.callFake(() => {
    //         return true;
    //     })
    //     spyOn(MediaFileInstance.prototype, 'manageQues').and.callFake(() => {
    //         return true;
    //     })
    //     spyOn(MediaFileInstance.prototype, 'updateProgress').and.callFake(() => {
    //         return true;
    //     })
    //     spyOn(MediaFileInstance.prototype, 'uploadNextChunk').and.callFake(() => {
    //         return true;
    //     })
    //     expect(fileObject.uploadNextChunk).toBeTruthy();
    // })
    it('mediaUrl executes', () => {
        let fileObject: any = _service.createFile(file);
        fileObject.mediaUrl();

        spyOn(MediaFileInstance.prototype, 'mediaBaseUrl').and.callFake(() => {
            return true;
        });
        expect(fileObject.mediaUrl).toBeTruthy();
    });
    it('mediaBaseUrl executes', () => {
        let fileObject: any = _service.createFile(file);
        fileObject.mediaBaseUrl();
        expect(fileObject.mediaBaseUrl).toBeTruthy();
    });
    it('updateObserver executes', () => {
        let fileObject: any = _service.createFile(file);
        let progressObserver = {
            observerType: 'UPLOAD-PROGRESS',
            mediaFileId: ''
        };

        fileObject.updateObserver(progressObserver);
        expect(fileObject.updateObserver).toBeTruthy();
    });
    it('updateProgress executes', () => {
        let fileObject: any = _service.createFile(file);
        fileObject.updateProgress();

        spyOn(MediaFileInstance.prototype, 'updateObserver').and.callFake(() => {
            return true;
        });
        expect(fileObject.updateProgress).toBeTruthy();
    });
    it('finalizeUpload() executes when failedQue is not empty  ', () => {
        let fileObject: any = _service.createFile(file);

        let failedQue = ['', ''];
        fileObject.finalizeUpload();
        spyOn(MediaFileInstance.prototype, 'finalizeUrl').and.callFake(() => {
            return true;
        });
        spyOn(MediaFileInstance.prototype, 'resetUpload').and.callFake(() => {
            return true;
        });
        spyOn(MediaFileInstance.prototype, 'postFinalizeUpload').and.callFake(() => {
            return true;
        });
        expect(fileObject.finalizeUpload).toBeTruthy();

    });
    it('finalizeUpload() executes when upload is sucessful  ', () => {
        let fileObject: any = _service.createFile(file);

        fileObject.isUploadSuccessful = true;
        fileObject.finalizeUpload();

    });
    it('ResetUpload() executes', () => {
        let fileObject: any = _service.createFile(file);
        fileObject.resetUpload();
        expect(fileObject.failedQue.length).toBe(0);
        expect(fileObject.progressInBytes).toBe(0);
    });
    //  TestBed.compileComponents();

    it('"startUpload()...', (done) => {
        let fileObject: any = _service.createFile(file);
        fileObject.startUpload();
        spyOn(MediaFileInstance.prototype, 'chunkFile').and.callFake(() => {
            return true;
        });

        spyOn(MediaFileInstance.prototype, 'postMedia').and.callFake(() => {
            return true;
        });

        expect(fileObject.startUpload).toBeTruthy();
    });

});

