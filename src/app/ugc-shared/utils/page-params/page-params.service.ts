import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { BurstLogService } from '../../../core/services/logging/log.service';
import { jwtDecode } from './jwt.parser';

@Injectable()
export class PageParamsService {
  private _jwt: string;
  private _partnerId: string;
  private _bubbleId: string;

  public get jwt(): string {
    return this._jwt;
  }

  public get partnerId(): string {
    return this._partnerId;
  }

  public get bubbleId(): string {
    return this._bubbleId;
  }

  constructor(
    private _log: BurstLogService
  ) { }

  public updateParams(params: Params): void {
    this._jwt = params['jwt'];
    this.parseJwt();
  }

  private parseJwt(): void {
    try {
      let parsed = jwtDecode(this._jwt);
      this._partnerId = parsed['pid'];
      this._bubbleId = parsed['bid'];
    } catch (ex) {
      this._partnerId = null;
      this._bubbleId = null;
      this._log.error({
        description: 'PageParamsService: could not parse jwt',
        error: ex
      });
    }
  }
}
