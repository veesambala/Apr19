import { BaseFactory } from '../../base.factory';

export const BURST_LOGO: Logo = {
  imageUrl: 'assets/img/ico-logo.svg',
  clickThroughUrl: null
};

export class CustomizationFactory {
   /**
    * @param c11nJsonObject The javascript object to convert into a C11nJson
    * @param enforce {boolean} If the creation should enforce structure and known types.
    *                if true will throw errors for missing, false to add the errors to errors array
    * @param objectName  Name of container object.
    * @return {string[]} array of all validation errors
    */
   public static validateC11nJson(c11nJsonObject: any, objectName: string, enforce: boolean): string[] {
     let validationErrors: string[] = [];
     let c11nJson: UgcC11nJson = BaseFactory.validateObject<UgcC11nJson>(c11nJsonObject, objectName, enforce,
     validationErrors);

     BaseFactory.validateObjectField<object>(c11nJson, objectName, 'locales', {}, enforce, validationErrors);
     let localesErrors: string[] = CustomizationFactory.validateLocales(c11nJson.locales, 'locales', enforce);
     validationErrors.push.apply(validationErrors, localesErrors);

     BaseFactory.validateObjectField<object>(c11nJson, objectName, 'ugcC11n', {}, enforce, validationErrors);
     let ugcC11nErrors: string[] = CustomizationFactory.validateUgcC11n(c11nJson.ugcC11n, 'ugcC11n', enforce);
     validationErrors.push.apply(validationErrors, ugcC11nErrors);

     return validationErrors;
   }

  /**
   * @param localesObject The javascript object to convert into a Locales
   * @param enforce {boolean} If the creation should enforce structure and known types.
   *                          if true will throw errors for missing, false to add the errors to errors array
   * @param objectName  Name of container object.
   * @return {string[]} array of all validation errors
   */
  public static validateLocales(localesObject: any, objectName: string, enforce: boolean): string[] {
    let validationErrors: string[] = [];
    let locales: Locales = BaseFactory.validateObject<Locales>(localesObject, objectName, enforce, validationErrors);

    BaseFactory.validateObjectField<string>(locales, objectName, 'default', 'en-us', enforce, validationErrors);
    BaseFactory.validateObjectField<any>(locales, objectName, 'supported', {}, enforce, validationErrors);

    Object.keys(locales.supported).forEach((key) => {
      let localeErrors: string[] = CustomizationFactory.validateLocale(locales.supported[key], objectName, enforce);
      validationErrors.push.apply(validationErrors, localeErrors);
    });
    locales._current = null;
    locales.current = (): Locale => {
      if (locales._current) {
        return locales._current;
      }

      let userLocale = navigator.language.toLowerCase().replace('_', '-');

      if (locales.supported.hasOwnProperty(userLocale)) {
        locales._current = locales.supported[userLocale];
      } else if (locales.supported.hasOwnProperty(locales.default)) {
        locales._current = locales.supported[locales.default];
        validationErrors.push('Could not load user locale of ' + userLocale);
      } else {
        let fallBack: object = {};
        CustomizationFactory.validateLocale(fallBack, objectName, false);
        locales._current = fallBack as Locale;
        validationErrors.push('Could not load user locale of ' + userLocale +
        ' or default locale of ' + locales.default);
      }

      return locales._current;
    };
    locales.current(); // invoke so that locale is immediately ready to go and if there are any issues
                      // they are placed into errors array

    return validationErrors;
  }

  /**
   * @param localeObject The javascript object to convert into a Locale
   * @param enforce {boolean} If the creation should enforce structure and known types.
   *                          if true will throw errors for missing, false to add the errors to errors array
   * @param objectName  Name of container object.
   * @return {string[]} array of all validation errors
   */
  public static validateLocale(localeObject: any, objectName: string, enforce: boolean): string[] {
    let validationErrors: string[] = [];
    let locale: Locale = BaseFactory.validateObject<Locale>(localeObject, objectName, enforce, validationErrors);

    BaseFactory.validateObjectField<any>(locale, objectName, 'formField', {}, enforce, validationErrors);

    Object.keys(locale.formFields).forEach((key) => {
      let formFieldlocaleErrors: string[] = CustomizationFactory.validateLocaleFormField(locale.formFields[key],
      objectName, enforce);
      validationErrors.push.apply(validationErrors, formFieldlocaleErrors);
    });

    BaseFactory.validateObjectField<string>(locale, objectName, 'landingPageTitle', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'landingPageTitlePrompt', '',
    enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'landingPageTipText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'landingPageUploadPrompt', '',
    enforce, validationErrors);

    BaseFactory.validateObjectField<string>(locale, objectName, 'addMediaPrompt', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'addMediaPageTitle', '', enforce, validationErrors);

    BaseFactory.validateObjectField<string>(locale, objectName, 'formPageHeadlineText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'formPageTitle', '', enforce, validationErrors);

    BaseFactory.validateObjectField<string>(locale, objectName, 'termsAndConditionsPageTitle', '',
    enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'termsAndConditionsAutoAcceptText', '',
    enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'termsAndConditionsManualAcceptText', '',
    enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'termsAndConditionAgreePrompt', '',
    enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'termsAndConditionAgreementText', '',
    enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'termsAndConditionsFlowRule', '',
    enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'termsConditionsType', '',
    enforce, validationErrors);

    BaseFactory.validateObjectField<string>(locale, objectName, 'mediaTitleText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'ageConfirmationText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'progressIssuePrompt', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'emailHelpPrompt', '', enforce, validationErrors);

    BaseFactory.validateObjectField<string>(locale, objectName, 'poweredByText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'addMediaText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'currentNumMediaText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'uploadText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'notNowText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'nextText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'backText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'cancelText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'requiredText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'addMoreText', '', enforce, validationErrors);

    BaseFactory.validateObjectField<string>(locale, objectName, 'successTextPrompt', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'finishedText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'viewMediaText', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'shareMediaPrompt', '', enforce, validationErrors);

    BaseFactory.validateObjectField<string>(locale, objectName, 'duplicateMediaError', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'maxMediaError', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'maxVideosError', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'unsupportedMediaError', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(locale, objectName, 'emptyMediaError', '', enforce, validationErrors);

    return validationErrors;
  }

  /**
   * @param UgcLocaleFormFieldObject The javascript object to convert into a UgcThemeObject
   * @param enforce  {boolean} If the creation should enforce structure and known types.
   * if true will throw errors for missing, false to add the errors to errors array
   * @param objectName  Name of container object.
   * @return {Array<string>} array of all validation errors
   */
  public static validateLocaleFormField(formFieldObject: any, objectName: string, enforce: boolean): string[] {
    let validationErrors: string[] = [];
    let formField: FormField = BaseFactory.validateObject<FormField>(
      formFieldObject, objectName, enforce, validationErrors);

    BaseFactory.validateObjectField<string>(formField, objectName, 'placeholder', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(formFieldObject, objectName, 'type', '', enforce, validationErrors);
    BaseFactory.validateObjectField<boolean>(formFieldObject, objectName, 'required', false, enforce, validationErrors);
    BaseFactory.validateObjectField<string>(formFieldObject, objectName,
      'validationRegex', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(formFieldObject, objectName,
      'validationError', '', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(formFieldObject, objectName, 'iconName', '', enforce, validationErrors);

    return validationErrors;
  }

  /**
   * Validates a ugc c11n object for the correct structure
   * Returns any errors that occurred while validating and fills in missing values
   * If enforce is true, then will throw an error for missing fields
   *
   * @param ugcC11nObject The javascript object to convert into a Advertisements
   * @param objectName The field name that was used to get the advertisementsObject in the parent object
   * @param enforce {boolean} If the creation should enforce structure and known types.
   *                          if true will throw errors for missing, false to add the errors to errors array
   * @return {string[]} a list of errors that occurred, if any, while validating
   */
  public static validateUgcC11n(ugcC11nObject: any, objectName: string, enforce: boolean): string[] {
    let validationErrors: string[] = [];
    let ugcC11n: UgcC11n = BaseFactory.validateObject<UgcC11n>(ugcC11nObject, objectName, enforce, validationErrors);

    BaseFactory.validateObjectField<boolean>(ugcC11n, objectName, 'returnUrl', false, enforce, validationErrors);

    BaseFactory.validateObjectField<object>(ugcC11n, objectName, 'landing', {}, enforce, validationErrors);
    let facePanelErrors: string[] = CustomizationFactory.validateLanding(ugcC11n.landing, 'landing', enforce);
    validationErrors.push.apply(validationErrors, facePanelErrors);

    BaseFactory.validateObjectField<object>(ugcC11n, objectName, 'branding', {}, enforce, validationErrors);
    let brandingErrors: string[] = CustomizationFactory.validateBranding(ugcC11n.branding, 'branding', enforce);
    validationErrors.push.apply(validationErrors, brandingErrors);

    BaseFactory.validateObjectField<object>(ugcC11n, objectName, 'theme', {}, enforce, validationErrors);
    let themeErrors: string[] = CustomizationFactory.validateTheme(ugcC11n.theme, 'theme', enforce);
    validationErrors.push.apply(validationErrors, themeErrors);

    return validationErrors;
  }

  /**
   * Validates a landing object for the correct structure
   * Returns any errors that occurred while validating and fills in missing values
   * If enforce is true, then will throw an error for missing fields
   *
   * @param landingObject The javascript object to convert into a Advertisements
   * @param objectName The field name that was used to get the advertisementsObject in the parent object
   * @param enforce {boolean} If the creation should enforce structure and known types.
   *                          if true will throw errors for missing, false to add the errors to errors array
   * @return {string[]} a list of errors that occurred, if any, while validating
   */
  public static validateLanding(landingObject: any, objectName: string, enforce: boolean): string[] {
    let validationErrors: string[] = [];
    let landing: LandingC11n = BaseFactory.validateObject<LandingC11n>(landingObject, objectName,
      enforce, validationErrors);

    BaseFactory.validateObjectField<string>(landing, objectName, 'submissionBannerLogo', 'NONE',
    enforce, validationErrors);
    BaseFactory.validateObjectField<string>(landing, objectName, 'submissionBannerImageUrl', '',
    enforce, validationErrors);

    return validationErrors;
  }

  /**
   * Validates a branding object for the correct structure
   * Returns any errors that occurred while validating and fills in missing values
   * If enforce is true, then will throw an error for missing fields
   *
   * @param brandingObject The javascript object to convert into a Advertisements
   * @param objectName The field name that was used to get the advertisementsObject in the parent object
   * @param enforce {boolean} If the creation should enforce structure and known types.
   *                          if true will throw errors for missing, false to add the errors to errors array
   * @return {string[]} a list of errors that occurred, if any, while validating
   */
  public static validateBranding(brandingObject: any, objectName: string, enforce: boolean): string[] {
    let validationErrors: string[] = [];
    let branding: Branding = BaseFactory.validateObject<Branding>(
      brandingObject, objectName, enforce, validationErrors);

    BaseFactory.validateObjectField<object>(branding, objectName, 'logos', {}, enforce, validationErrors);
    Object.keys(branding.logos).forEach((key: string) => {
      let logo: Logo = branding.logos[key];
      let logoName: string = objectName + '.logos-' + key;
      BaseFactory.validateObjectField<string>(logo, logoName, 'imageUrl', '', enforce, validationErrors);
      BaseFactory.validateObjectField<string>(logo, logoName, 'clickThroughUrl', '', enforce, validationErrors);
    });
    branding.logos.getLogo = (key: string): Logo => {
      if (key === 'NONE') {
        return null;
      }

      if (key === 'BURST') {
        return branding.logos.getBurstLogo();
      }

      if (!(key in branding.logos) || !branding.logos[key].imageUrl) {
        return null;
      }

      return branding.logos[key];
    };
    branding.logos.getBurstLogo = (): Logo => {
      return BURST_LOGO;
    };
    BaseFactory.validateObjectField<string>(branding, objectName, 'primaryLogo', 'BURST', enforce, validationErrors);
    BaseFactory.validateObjectField<string>(branding, objectName, 'sponsorLogo', 'NONE', enforce, validationErrors);

    return validationErrors;
  }

  /**
   * Validates a theme object for the correct structure
   * Returns any errors that occurred while validating and fills in missing values
   * If enforce is true, then will throw an error for missing fields
   *
   * @param themeObject The javascript object to convert into a Advertisements
   * @param objectName The field name that was used to get the advertisementsObject in the parent object
   * @param enforce {boolean} If the creation should enforce structure and known types.
   *                          if true will throw errors for missing, false to add the errors to errors array
   * @return {string[]} a list of errors that occurred, if any, while validating
   */
  public static validateTheme(themeObject: any, objectName: string, enforce: boolean): string[] {
    let validationErrors: string[] = [];
    let theme: Theme = BaseFactory.validateObject<Theme>(themeObject, objectName, enforce, validationErrors);
    BaseFactory.validateObjectField<string>(theme, objectName, 'themeName', 'burst-theme-default-light',
    enforce, validationErrors);
    BaseFactory.validateObjectField<boolean>(theme, objectName, 'enableMobileBackgroundPattern', true,
    enforce, validationErrors);
    BaseFactory.validateObjectField<boolean>(theme, objectName, 'enableDesktopBackgroundPattern', true,
      enforce, validationErrors);
    BaseFactory.validateObjectField<boolean>(theme, objectName, 'enableDesktopIconBackgrounds', true,
      enforce, validationErrors);

    return validationErrors;
  }
}

/**
 * The root json, contains:
 * ugcC11n - the json object to describe customizations throughout the ugc site
 * locales - contains specific languages for messages to display to the user throughout the ugc site
 */
export interface UgcC11nJson {
  ugcC11n: UgcC11n;
  locales: Locales;
}

/**
 * Interface that defines the fields and methods expected for controlling how the ugc SPA is setup and appears
 * returnUrl - a url to return the user to after completion of upload or if they choose not to upload
 * landing - corresponds to configurations for the landing page
 * branding - corresponds to generic branding configurations
 * theme - corresponds to generic theme configurations
 */
export interface UgcC11n {
  returnUrl: string;
  landing: LandingC11n;
  branding: Branding;
  theme: Theme;
}

/**
 * Interface that defines the fields and methods expected for controlling how the landing screen appears, contains:
 * submissionBannerLogo - the logo shown over/in the corner of the submissionBannerImage, see SubmissionPromptComponent
 * submissionBannerImageUrl - the image to be shown under the Media Submission title, see SubmissionPromptComponent
 */
export interface LandingC11n {
  submissionBannerLogo: 'NONE'|string;
  submissionBannerImageUrl: string;
}

/**
 * Interface that defines the fields and methods expected for theming the ugc site, contains:
 * themeName - the name of the theme to use and load for the site, ex: default-light
 */
export interface Theme {
  themeName: string;
  enableMobileBackgroundPattern: boolean;
  enableDesktopBackgroundPattern: boolean;
  enableDesktopIconBackgrounds: boolean;
}

/**
 * Interface that defines the fields and methos expected for branding the ugc site, contains:
 * logos - a dictionary of the logos available for use throughout the site
 * primaryLogo - the logo to use to display (large) in the branding logos component
 *               -- mobile=logo on landing, desktop=logo in background
 * sponsorLogo - the logo to use to display (small) in the branding logos component
 *               -- mobile=logo on landing, desktop=logo in background
 */
export interface Branding {
  logos: {
    getLogo(key: string): Logo;
    getBurstLogo(): Logo;
  };
  primaryLogo: string|'BURST'|'NONE';
  sponsorLogo: string|'NONE';
}

/**
 * Interface that defines the fields and methods expected for logos, contains:
 * imageUrl - url for where to locate the image for the logo
 * clickThroughUrl - the url to direct to if the logo is interacted with such as with a click
 */
export interface Logo {
  imageUrl: string;
  clickThroughUrl: string;
}

/**
 * Interface that defines the fields and methods expected for the locales object
 */
export interface Locales {
  default: string;
  supported: {
    [key: string]: Locale;
  };
  _current: Locale;
  current(): Locale;
}

/**
 * interface defining supported locales
 */
export interface Locale {
  formFields: {
    [key: string]: FormField;
  };
  landingPageTitle: string;
  landingPageTitlePrompt: string;
  landingPageTipText: string;
  landingPageUploadPrompt: string;

  addMediaPrompt: string;
  addMediaPageTitle: string;

  formPageHeadlineText: string;
  formPageTitle: string;

  termsAndConditionsPageTitle: string;
  termsAndConditionsAutoAcceptText: string;
  termsAndConditionsManualAcceptText: string;
  termsAndConditionAgreePrompt: string;
  termsAndConditionAgreementText: string;
  termsAndConditionsFlowRule: string;
  termsConditionsType: TermsAndConditionType;

  mediaTitleText: string;
  ageConfirmationText: string;
  progressIssuePrompt: string;
  emailHelpPrompt: string;

  poweredByText: string;
  addMediaText: string;
  currentNumMediaText: string;
  uploadText: string;
  notNowText: string;
  nextText: string;
  backText: string;
  cancelText: string;
  requiredText: string;
  addMoreText: string;

  successTextPrompt: string;
  finishedText: string;
  viewMediaText: string;
  shareMediaPrompt: string;

  duplicateMediaError: string;
  maxMediaError: string;
  maxVideosError: string;
  unsupportedMediaError: string;
  emptyMediaError: string;
}

export interface FormField {
  placeHolder: string;
  type: string;
  required: boolean;
  validationRegex: string;
  validationError: string;
  iconName: string;
}

export type TermsAndConditionType = 'NONE' | 'LINK' | 'CHECKBOX' | 'PAGE';
