import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { PageParamsService } from './page-params.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PageParamsGuard implements CanActivate, CanActivateChild {
  constructor(
    private _pageParams: PageParamsService
  ) { }

  public canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this._pageParams.updateParams(route.queryParams);

    return true;
  }

  public canActivateChild(
      childRoute: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }
}