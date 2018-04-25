import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandingLogosComponent } from './branding-logos/branding-logos.component';
import { UgcDisplayModule } from '../display/display.module';

@NgModule({
  declarations: [
    BrandingLogosComponent
  ],
  imports: [
    CommonModule,
    UgcDisplayModule
  ],
  exports: [
    BrandingLogosComponent
  ]
})
export class UgcBrandingModule {}
