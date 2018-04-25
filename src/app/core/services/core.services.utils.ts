import {Headers} from '@angular/http';

export function extractTargetDescriptor(target: any): string {
  if (!target) {
    return '';
  }

  let descriptor: string = '';

  if (target.nodeName) {
    descriptor = target.nodeName;
  }

  if (target.classList) {
    descriptor += '.' + target.classList.value;
  }

  if (target.id) {
    descriptor += '#' + target.id;
  }

  return descriptor;
}

/**
 * @returns {Headers} new instance of the no cache headers, Cache-Control=no-cache and Pragma=no-cache
 */
export function noCacheHeaders(): Headers {
  let headers: Headers = new Headers();
  headers.append('Cache-Control', 'no-cache');
  headers.append('Pragma', 'no-cache');
  headers.append('Expires', '-1');

  return headers;
}

/**
 * @returns {URLSearchParams} new instance of url search params with a random param set to force break cache
 */
export function randomParam(): URLSearchParams {
  let params: URLSearchParams = new URLSearchParams();
  let random: string = (1 + Math.random()).toString(16).substr(8);
  params.set('r', random);

  return params;
}
