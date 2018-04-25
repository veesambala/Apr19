import {Injectable, Renderer2} from '@angular/core';
import { extractTargetDescriptor } from '../';

/**
 * @type {number} The max number of clicks to keep in history array, once exceeded will keep the latest
 */
const MAX_HISTORY_COUNT = 32;

/**
 * A service for handling tracking of clicks throughout the application by hooking into the document level events.
 * Allows the click history to be accessed via the history getter, keeps MAX_HISTORY_COUNT as length of array.
 *
 * To be usable, set renderer() must be called from a component.
 * Services do not have access to the renderer.
 */
@Injectable()
export class ClickTrackingService {
  private _renderer: Renderer2;
  private _removeClickListener: any;
  private _history: ClickHistoryItem[];

  constructor() {
    this._history = [];
  }

  /**
   * @param value The injectable Renderer from angular core, used for subscribing to events at the document level
   */
  set renderer(value: Renderer2) {
    this._renderer = value;
    this.dettachClickListener();
    this.attachClickListener();
  }

  /**
   * @return {Renderer2} The injectable Renderer from angular core, used for subscribing to events at the document level
   */
  get renderer(): Renderer2 {
    return this._renderer;
  }

  /**
   * @returns {Array<ClickHistoryItem>} The current history of clicks that have occurred up to the MAX_HISTORY_COUNT.
   *                                    The latest will be at the beginning of the array and the oldest at the end.
   */
  public get history(): ClickHistoryItem[] {
    return this._history;
  }

  private attachClickListener(): void {
    this._removeClickListener = this._renderer.listen('document', 'click', (event: any) => {
      this.addClickHistory(event);
    });
  }

  private dettachClickListener() {
    if (this._removeClickListener) {
      this._removeClickListener();
      this._removeClickListener = null;
    }
  }

  private addClickHistory(event: any): void {
    let item: ClickHistoryItem = createClickHistoryItem(event);

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
 * Create a ClickHistoryItem from a javascript click event
 * If event is null, will return null
 *
 * @param event The javascript click event that was triggered
 * @return {ClickHistoryItem}
 */
export function createClickHistoryItem(event: any): ClickHistoryItem {
  if (!event) {
    return null;
  }

  let item: ClickHistoryItem = {
    buttonNum: event.button,
    buttonsNum: event.buttons,
    keys: [],
    path: []
  };

  if (event.path && event.path.length) {
    for (let target of event.path) {
      item.path.push(extractTargetDescriptor(target));
    }
  } else if (event.target) {
    item.path.push(extractTargetDescriptor(event.target));
  }

  if (event.ctrlKey) {
    item.keys.push('ctrl');
  }

  if (event.shiftKey) {
    item.keys.push('shift');
  }

  if (event.altKey) {
    item.keys.push('alt');
  }

  if (event.metaKey) {
    item.keys.push('meta');
  }

  return item;
}

/**
 * An interface to define the structure of an item stored in the history for a click event.
 *
 * buttonNum is the number of the button clicked 0 for left button, 1 for middle button, 2 for right button
 * buttonsNum is a combination of all the buttons that are pressed: left=1, right=2, middle=4, back=8, forward=16
 *            If two or more are pressed then logical sum of the buttons pressed is returned
 * keys is a list of any keys pressed while the click occurred.
 * path is the dom traversal of the html that was clicked.
 */
export interface ClickHistoryItem {
  buttonNum: number;
  buttonsNum: number;
  keys: string[];
  path: string[];
}
