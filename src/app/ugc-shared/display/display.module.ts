import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplayLogoComponent } from './logo/logo.component';
import { DisplayLocalMediaFileComponent } from './local-media-file/local-media-file.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { DefaultConfig } from '../default-loader-config.factory';

@NgModule({
  declarations: [
    DisplayLogoComponent,
    DisplayLocalMediaFileComponent
  ],
  imports: [
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 300
    }),
    CommonModule
  ],
  exports: [
    DisplayLogoComponent,
    DisplayLocalMediaFileComponent
  ]
})
export class UgcDisplayModule {}
