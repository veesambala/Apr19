import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UgcDisplayModule } from './display/display.module';
import { UgcBrandingModule } from './branding/branding.module';
import { FormModule } from './form/form.module';
import { UgcHttpModule } from './http/http.module';
import { UgcThemeModule } from './theme/theme.module';
import { ToasterModule } from './toaster/toaster.module';
import { UtilsModule } from './utils/utils.module';
import { UgcCustomizationService } from './http/customization/customization.service';
import { Http } from '@angular/http';
import { PageParamsService } from './utils/page-params/page-params.service';
import { PlatformHttpService } from './http/platform-http.service';
import { MediaUploadService } from './http/media-upload/media-upload.service';
import { FileService } from './http/media-upload/file/file.service';
import { FileChunkService } from './http/media-upload/file/file-chunk/file-chunk.service';
import { UserInfoService } from './http/user-info/user-info.service';
import { UgcErrorReportService } from './http/error-report/ugc-error-report.service';
import { PageParamsGuard } from './utils/page-params/page-params.guard';
import { UploadTrackerService } from './upload-tracker/upload-tracker.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    FormModule,
    ToasterModule,
    UtilsModule,

    UgcBrandingModule,
    UgcDisplayModule,
    UgcHttpModule,
    UgcThemeModule
  ],
  exports: [
    FormModule,
    ToasterModule,
    UgcBrandingModule,
    UgcDisplayModule,
    UgcHttpModule,
    UgcThemeModule
  ]
})
export class UgcSharedModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: UgcSharedModule,
      providers: [
        {
          provide: PageParamsService,
          useClass: PageParamsService
        },
        {
          provide: PageParamsGuard,
          useClass: PageParamsGuard,
          deps: [
            PageParamsService
          ]
        },
        {
          provide: UgcCustomizationService,
          useClass: UgcCustomizationService,
          deps: [
            Http,
            PageParamsService
          ]
        },
        {
          provide: APP_INITIALIZER,
          useFactory: loadUgcCustomizationFactory,
          deps: [
            UgcCustomizationService
          ],
          multi: true
        },
        PlatformHttpService,
        MediaUploadService,
        FileService,
        FileChunkService,
        UserInfoService,
        UgcErrorReportService,
        UploadTrackerService
      ]
    };
  }
}

export function loadUgcCustomizationFactory(UgcCustomization: UgcCustomizationService) {
  return () => {
    return UgcCustomization.load();
  };
}
