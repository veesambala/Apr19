import { Routes } from '@angular/router';
import { Page404Component } from './page404.component';

export const Page404Routes: Routes = [{
    path: '',
    component: Page404Component,
    children: [
        {
          path: '',
          component: Page404Component
        }
    ]
}];
