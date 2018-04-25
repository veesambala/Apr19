import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';

import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { FileChunkService, ChunkInstance, FileChunk, ChunkObserverData } from './file-chunk.service';
import {
  Response, Http, BrowserXhr, BaseRequestOptions,
  ConnectionBackend, HttpModule, RequestOptions,
  ResponseOptions,
  XHRBackend
} from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { PlatformHttpService } from '../../../platform-http.service';

import { MockBackend, MockConnection } from '@angular/http/testing';

import { ConfigService } from '../../../../../core/services/config/config.service';
import { FileService } from '../file.service';

let CHUNK_UPLOAD_RETRY_ATTEMPTS_LIMIT = 3;

class MockPlatformHttpService {

}
class MockBrowserXhr {
  build() {
    return new MockXhr();
  }
}
class mockblob {

}
class MockXhr {
  open() {
  }
  setRequestHeader() {
  }
  onload() {

  }
  onerror() {

  }
  ontimeout() {

  }
  onabort() {

  }
  send() {

  }
  abort(){

  }
  upload: any = {
    onprogress: () => {

    }
  };

}

let img;
this.img = new Image();
this.img.src = 'https://www.gstatic.com/webp/gallery/4.sm.jpg';
this.img.stretch = 'none';
let file1 = new File([img], 'image1', { type: 'text/json;charset=utf-8' });

describe('Service: FileChunkService', () => {
  let _service: FileChunkService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [HttpModule],
      providers: [FileChunkService,
        {
          provide: PlatformHttpService,
          useClass: MockPlatformHttpService,
        },
        BrowserXhr,
        {
          provide: BrowserXhr,
          useClass: MockBrowserXhr,
        },
        BaseRequestOptions, ConfigService, FileService,
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
    let mockBrowserXhr: any = new MockBrowserXhr();
    _service = new FileChunkService(mockPlatformHttpObject, mockBrowserXhr);

  }));

  it('FileChunkService should be true', () => {
    expect(_service).toBeTruthy();
  });

  it('createChunk', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');
    expect((chunk.progressObserver && chunk.blob)).toBeTruthy();
  });

  it('Chunk Upload On Error', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');
    let handleRetry = false;

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    spyOn(chunk, 'handleRetry').and.callFake(() => {
      handleRetry = true;
    });

    chunk.startUpload();

    chunk.xhr.onerror(null);

    expect(handleRetry).toBeTruthy();
  });
  it('Chunk Upload On progress', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    chunk.startUpload();

    (<any> chunk).xhr.upload.onprogress({
      lengthComputable: true,
      loaded: 10
    });

    expect(chunk.progressInBytes).toBe(10);
  });
  it('Chunk Upload On Abort', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');
    let handleRetry = false;

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    spyOn(chunk, 'handleRetry').and.callFake(() => {
      handleRetry = true;
    });

    chunk.startUpload();
    chunk.xhr.onabort(null);

    expect(handleRetry).toBeTruthy();
  });
  it('Chunk Upload On timeout', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');
    let handleRetry = false;

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    spyOn(chunk, 'handleRetry').and.callFake(() => {
      handleRetry = true;
    });

    chunk.startUpload();
    chunk.xhr.ontimeout(null);

    expect(handleRetry).toBeTruthy();
  });
  it('Chunk Upload On Success', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    chunk.startUpload();

    (<any> chunk).xhr.onload({
      currentTarget: {
        status: 200
      }
    });

    expect(chunk.isUploadSuccessful).toBeTruthy();
  });
  it('Chunk Upload On Load with no success', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    chunk.startUpload();

    (<any> chunk).xhr.onload({
      currentTarget: {
        status: 500
      }
    });

    expect(chunk.isUploadSuccessful).toBeFalsy();
  });
  it('Chunk Pause upload', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    chunk.startUpload();

    chunk.pauseUpload();

    expect(chunk.isUploadPaused).toBeTruthy();
  });
  it('Chunk Resume upload', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    chunk.startUpload();

    chunk.resumeUpload();

    expect(chunk.isUploadPaused).toBeFalsy();
  });
  it('Chunk Reset upload', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    chunk.resetUpload();

    expect(chunk.progressInPercent).toBe(0);
  });
  it('Chunk Retry behaviour when upload paused', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    chunk.isUploadPaused = true;

    expect(chunk.handleRetry()).toBe(false);
  });

  it('Chunk Retry behaviour when retryAttempts are less than MAX LIMIT', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';

    chunk.handleRetry();

    expect(chunk.retryAttemptCount).toBeGreaterThan(0);
  });

  it('Chunk Retry behaviour when retryAttempts exceed MAX LIMIT', () => {
    let chunk = _service.createChunk(file1.slice(0, 100), '');

    chunk.authorizationToken = 'SOME-JWT-AUTH-TOKEN';
    chunk.retryAttemptCount = 500;

    chunk.handleRetry();

    expect(chunk.retryAttemptCount).toBeGreaterThan(0);
  });
});