import {
  ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot,
  Routes
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { PageParamsService } from '../ugc-shared/utils/page-params/page-params.service';

@Injectable()
export class UgcGuard implements CanActivate, CanActivateChild {
  constructor(
    private _router: Router,
    private _pageParams: PageParamsService
  ) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<boolean> | Promise<boolean> | boolean {
    if (!this._pageParams.jwt || !this._pageParams.bubbleId) {
      this._router.navigateByUrl('404');

      return;
    }

    return true;
  }

  public canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }
}

export const routes: Routes = [
  {
    path: '',
    canActivate: [UgcGuard],
    children: [
        {
          path: '',
          redirectTo: 'landing',
          pathMatch: 'full'
        },
        {
          path: 'landing',
          loadChildren: './landing#UgcLandingModule'
        },
        {
          path: 'upload',
          loadChildren: './upload#UploadModule'
        }
    ]
  },
  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full'
  }
];
