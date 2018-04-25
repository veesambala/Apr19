import { UgcCustomizationService } from '../../../../ugc-shared/http/customization/customization.service';
import { Logo } from '../../../../ugc-shared/http/customization/customization.factory';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadComponent } from './upload.component';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';

describe('UploadComponent of Landing', () => {
  describe('creation', () => {
    it('component creation', () => {
      let env: TestEnv = setup('', '', '', '');
      expect(env.component).toBeDefined();

    });
    it('when returnUrl is empty NotNow shown is disabled', () => {
      let env: TestEnv = setup('', '', '', '');
      expect(env.component.notNowShown).toBeFalsy();
    });
    it('when returnUrl is given NotNow shown is enabled', () => {
      let env: TestEnv = setup('', '', '', 'sassa');
      expect(env.component.notNowShown).toBe(true);
    });
    it('To check if Texts like Upload text,prompt text... are correctly set based on UgcC11n', () => {
      let env: TestEnv = setup('upload', 'NotNow', 'UploadPrompt', 'sassa');
      expect(env.component.uploadText).toEqual('upload');
      expect(env.component.promptText).toEqual('UploadPrompt');
      expect(env.component.notNowText).toEqual('NotNow');
    });
    it('to check not Now click eventEmitter', (done) => {
      let env: TestEnv = setup('', '', '', 'www.burst.com');
      env.component.onNotNowClicked.subscribe((g) => {
        expect(g).toEqual('www.burst.com');
        done();
      });
      env.component.notNowClick();
    });
    it('to Upload click eventEmitter', (done) => {
      let env: TestEnv = setup('', '', '', 'www.burst.com');
      env.component.onUploadClicked.subscribe((g) => {
        expect(g).toBeUndefined();
        done();
      });
      env.component.uploadClick();
    });
  });
});
describe(' UploadComponent  Dom testing', () => {
  it ('Prompt Text  is being set correctly or not based on JSON ', () => {
      let env: TestEnv = setup('', '', 'landingPagePrompt', 'www.burst.com');
      let poweredByEl = env.fixture.nativeElement.querySelector('.promptText');
      env.fixture.detectChanges();
      expect(poweredByEl.textContent).toEqual('landingPagePrompt');
  });
  it ('upload Text  is being set correctly on click event or not based on JSON ', () => {
    let env: TestEnv = setup('uploadText', '', 'landingPagePrompt', 'www.burst.com');
    let uploadButton: HTMLInputElement = env.fixture.nativeElement.querySelector('.upload-button');
    uploadButton.dispatchEvent(new Event('input'));
    env.fixture.detectChanges();
    expect(uploadButton.value).toEqual('uploadText');
  });
  fit ('NotNow Text  is being set correctly on click event or not based on JSON ', () => {
    let env: TestEnv = setup('uploadText', 'notNow', 'landingPagePrompt', 'www.burst.com');
    let NotNow: HTMLInputElement = env.fixture.nativeElement.querySelector('.not-now-button');
    NotNow.dispatchEvent(new Event('input'));
    env.fixture.detectChanges();
    expect(NotNow.value).toEqual('notNow');
  });
});

/*
Mock parameters for testing
 */
function setup(uploadtext: string,
               notnowtext: string,
               landingpageUploadPrompt: string,
               returnurl: string): TestEnv {
  let service = {

    ugcC11n: {
      returnUrl: returnurl
    },
    locales: {
      current: () => {
        return service.locales.locale;
      },
      locale: {
        uploadText: uploadtext,
        notNowText: notnowtext,
        landingPageUploadPrompt: landingpageUploadPrompt,
      },

    }

  };
  TestBed.configureTestingModule({
    declarations: [UploadComponent],
    providers: [
      { provide: UgcCustomizationService, useValue: service },
      { provide: ComponentFixtureAutoDetect, useValue: true }
    ]
  });
  let fixture = TestBed.createComponent(UploadComponent);

  return {
    fixture: fixture,
    component: fixture.componentInstance,
    customizationService: TestBed.get(UgcCustomizationService)
  };
}
interface TestEnv {
  fixture: ComponentFixture<UploadComponent>;
  component: UploadComponent;
  customizationService: Partial<UgcCustomizationService>;
}
