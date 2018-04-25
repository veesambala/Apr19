import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UgcComponent } from './ugc.component';
import { routes, UgcGuard } from './ugc.routes';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    UgcComponent
  ],
  entryComponents: [],
  providers: [
    UgcGuard
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class UgcModule {}
