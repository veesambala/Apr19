import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { UgcCustomizationService } from './customization/customization.service';
import { Http } from '@angular/http';
import { MediaUploadService } from './media-upload/media-upload.service';
import { FileService } from './media-upload/file/file.service';
import { FileChunkService } from './media-upload/file/file-chunk/file-chunk.service';
import { UserInfoService } from './user-info/user-info.service';
import { PlatformHttpService } from './platform-http.service';
import { UgcErrorReportService } from './error-report/ugc-error-report.service';
import { PageParamsService } from '../utils/page-params/page-params.service';

@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class UgcHttpModule {}
