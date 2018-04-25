import { Routes } from '@angular/router';
import { PageParamsGuard } from './ugc-shared/utils/page-params/page-params.guard';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'ugc',
    pathMatch: 'full'
  },
  {
    path: 'ugc',
    loadChildren: './ugc/ugc.module.ts#UgcModule',
    canActivate: [PageParamsGuard]
  },
  {
    path: '404',
    loadChildren: './page404#Page404Module',
    canActivate: [PageParamsGuard]
  },
  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full'
  }
];
