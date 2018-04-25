declare const moment;

/**
 * This class holds all the utils values for the mobile widget
 */
export class StaticUtils {
  /**
   * @type {boolean} true if you are developing locally, will pull the local,
   * mock customizations; false otherwise and for anything running on an environment
   */
  public static IS_LOCALHOST = location.host.indexOf('localhost') > -1;
  public static useLocalStorage: boolean = (window.localStorage) ? true : false;

  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
   *
   * @type {number} key code from the keyboard event on key interaction
   */
  public static ESCAPE_KEYCODE = 27;

  /**
   * true if code is running on android platform.
   */
  public static isAndroid: boolean = navigator.userAgent.toLowerCase().indexOf('android') > -1;

  /**
   * true if code is running on ios platform.
   */
  public static isiOS: boolean = /iphone|ipod|ipad/.test(navigator.userAgent.toString().toLowerCase());

  /**
   * true if code is running on a mobile platform
   */
  public static isMobile: boolean =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());

  /**
   * See https://stackoverflow.com/questions/7944460/detect-safari-browser
   *
   * @type {boolean} true if the current browser is safari
   */
  public static isSafari: boolean = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  public static supportedImageExtensions: string[] =
    ['tif', 'jpeg', 'tiff', 'bmp', 'ico', 'png', 'pix', 'pict', 'jpg', 'svg', 'nef', 'dng', 'cr2'];

  public static supportedVideoExtensions: string[] =
    ['mts', '3gpp', 'mpg', 'ts', 'gif', 'mpe', 'tp', 'ogv', 'ogm', '3gp', 'pcx', 'x3f', 'webm',
      'ogg', 'avi', 'arw', 'mpeg', 'divx', 'wmv', 'mod', 'mkv', 'nsv', 'mov', 'dat', 'asf', 'exr',
      'm4v', 'flv', 'xcf', 'flac', '3ivx', 'tod', 'dv', '3vx', 'mp4', 'vob', 'orf', '3g2', 'asx',
      'mpeg4', 'mrw', 'mxf', 'dvx', 'tga', 'qt', 'f4v', 'mat', 'crw', 'dcr', 'm2ts'];

  public static smartMergeObjects(target: any, source: any) {
    if (!target || !source) {
      return;
    }

    let sourceKeys = Object.keys(source);

    sourceKeys.forEach((key: string) => {
      if (target.hasOwnProperty(key) && StaticUtils.isObject(target[key]) && StaticUtils.isObject(source[key])) {
        StaticUtils.smartMergeObjects(target[key], source[key]);
      } else {
        // primitive or not set in target, so override
        target[key] = source[key];
      }
    });
  }

  public static isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  public static createRandomString(): string {
    return (Math.PI * Math.max(0.01, Math.random())).toString(36);
  }

  public static getTimezoneName(dt: Date) {
    return moment.tz.guess();
  }

  public static getTimezoneOffset(dt: Date) {
    let tz = ((dt || new Date())).getTimezoneOffset().toString();
    let pre = (tz.split('')[0] === '-' ? '+' : '-'); // some logic of MDN
    let tm: number = Math.abs(parseInt(tz));
    let tmpTzMin = parseInt((tm % 60).toString());
    let tmpTzHrs = ((tm - tmpTzMin) / 60);

    let tzHr = (tmpTzHrs <= 9) ? '0' + tmpTzHrs : tmpTzHrs;
    let tzMin = (tmpTzMin <= 9) ? '0' + tmpTzMin : tmpTzMin;

    return pre + tzHr + ':' + tzMin;
  }

  public static getFileOrigin(file: File, fakePath: string, fileSelectTime: number) {
    if (!this.isMobile) {
      return 'API_CAMERA_ROLL_IMPORTED'; // 'API_CAMERA_CAPTURED_SUBMISSION' |
    }

    if (this.isiOS) {
      if (fakePath.indexOf('captured') !== -1 || fakePath.indexOf('.jpg') !== -1) {
        return 'API_CAMERA_CAPTURED_SUBMISSION';
      }
      return 'API_CAMERA_ROLL_IMPORTED';
    }

    let mediaDateTime = (new Date(file.lastModifiedDate)).getTime();
    if (mediaDateTime >= fileSelectTime) {
      return 'API_CAMERA_CAPTURED_SUBMISSION';
    }

    return 'API_CAMERA_ROLL_IMPORTED';
  }

  public static getFileTypeByFileBlob(file: File): 'video' | 'photo' | 'other' {
    let ext: any = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
    if (this.supportedImageExtensions.indexOf(ext) !== -1) {
      return 'photo';
    }

    if (this.supportedVideoExtensions.indexOf(ext) !== -1) {
      return 'video';
    }

    return ((file.type.indexOf('image/') === 0) ? 'photo' : ((file.type.indexOf('video/') === 0) ? 'video' : 'other'));
  }
}
