import {Injectable} from '@angular/core';
import {Router, NavigationEnd, Event} from '@angular/router';
import {Subject, Observable, Subscription} from 'rxjs';
import {ConfigService} from '../';

/**
 * @type {number} The max number of clicks to keep in history array, once exceeded will keep the latest
 */
const MAX_HISTORY_COUNT = 32;

/**
 * A service for handling tracking routing throughout the application.
 * Encapsulates the router because angular2 directly constructs it in places and does not use DI.
 * Allows the request history to be accessed via the history getter, keeps MAX_HISTORY_COUNT as length of array.
 * Also allows access for listening to routing error events.
 */
@Injectable()
export class EncapsulatedRouterService {
  private _history: RouteHistoryItem[];
  private _routerSubscription: Subscription;

  private _routingErrorEvents: Subject<any>;

  /**
   * @param router The router instance to encapsulate and listen for events on as well report errors for
   */
  constructor(
    public router: Router
  ) {
    this._history = [];

    this._routerSubscription = null;
    this._routingErrorEvents = new Subject();
    this.connectToRouter();
  }

  /**
   * @returns {Array<ClickHistoryItem>} The current history of clicks that have occurred up to the MAX_HISTORY_COUNT.
   *                                    The latest will be at the beginning of the array and the oldest at the end.
   */
  public get history(): RouteHistoryItem[] {
    return this._history;
  }

  /**
   * @returns {Observable<any>} An observable to allow for listening for routing error events if they occur
   */
  public get routingErrorEvents(): Observable<any> {
    return this._routingErrorEvents.asObservable();
  }

  private connectToRouter(): void {
    this._routerSubscription = this.router.events.share().subscribe((url: Event) => {
      if (url instanceof NavigationEnd) {
        // now that we're at end of navigation, add to the nav history
        this.addNavHistory(url);
      }
    }, (error: Event) => {
      this._routingErrorEvents.next(error);
    });
  }

  private disconnectFromRouter(): void {
    if (this._routerSubscription) {
      this._routerSubscription.unsubscribe();
      this._routerSubscription = null;
    }
  }

  private addNavHistory(url: NavigationEnd): void {
    let item: RouteHistoryItem = createRouteHistoryItem(url);

    if (!item) {
      return;
    }

    this._history.unshift(item);

    if (this._history.length > MAX_HISTORY_COUNT) {
      // only pop one off since we check the length of every add -- length array can't go over MAX_HISTORY_COUNT + 1
      this._history.pop();
    }
  }
}

/**
 * Create a RouteHistoryItem from a routing navigation end object
 * If event is null, will return null
 *
 * @param url The navagation end object that was triggered
 * @return {RouteHistoryItem}
 */
export function createRouteHistoryItem(url: NavigationEnd): RouteHistoryItem {
  if (!url) {
    return null;
  }

  return {
    url: url.toString()
  };
}

/**
 * A type to define the structure of an item stored in the history for a routing event.
 *
 * command is any of url, urltree, or list of commands to control the routing
 * extras is any NavigationExtras that were used along with the routing command
 */
export type RouteHistoryItem = {
  url: string
};
