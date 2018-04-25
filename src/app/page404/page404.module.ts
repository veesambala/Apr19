import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Page404Routes } from './page404.routes';
import { Page404Component } from './page404.component';

@NgModule({
  declarations: [
    Page404Component
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(Page404Routes)
  ],
  exports: [Page404Component]
})
export class Page404Module { }
