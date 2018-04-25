import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UgcPageLayoutComponent } from './page-layout/page-layout.component';
import { DesktopRightPanelComponent } from './page-layout/desktop-right-panel/desktop-right-panel.component';
import { MobileHeaderComponent } from './page-layout/mobile-header/mobile-header.component';
import { UgcBackgroundComponent } from './background/background.component';
import { UgcDisplayModule } from '../display/display.module';
import { UgcBrandingModule } from '../branding/branding.module';

@NgModule({
  declarations: [
    UgcPageLayoutComponent,
    DesktopRightPanelComponent,
    MobileHeaderComponent,
    UgcBackgroundComponent
  ],
  imports: [
    CommonModule,
    UgcDisplayModule,
    UgcBrandingModule
  ],
  exports: [
    UgcPageLayoutComponent,
    UgcBackgroundComponent
  ]
})
export class UgcThemeModule {}
