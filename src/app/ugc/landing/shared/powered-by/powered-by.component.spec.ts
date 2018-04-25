import { UgcCustomizationService } from '../../../../ugc-shared/http/customization/customization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoweredByComponent } from './powered-by.component';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';

describe(' PoweredByComponent  ', () => {
    it('creation of PoweredByComponent', () => {
        let env: TestEnv = setup('');
        expect(env.component).toBeDefined();
    });
    it('powered By text is set based on Ugc11nJSON', () => {
        let env: TestEnv = setup('Powered By');
        expect(env.component.poweredByText).toEqual('Powered By');
    });
});
describe(' PoweredByComponent Dom testing', () => {
    it ('powered By text is being set correctly or not based on JSON ', () => {
        let env: TestEnv = setup('Powered By');
        let poweredByEl = env.fixture.nativeElement.querySelector('.powered-by-text');
        env.fixture.detectChanges();
        expect(poweredByEl.textContent).toEqual('Powered By');

    });
});

function setup(powertext: string): TestEnv {
    let service = {
        locales: {
            current: () => {
                return service.locales.locale;
            },
            locale: {
                poweredByText: powertext
            },
        }

    };
    TestBed.configureTestingModule({
        declarations: [PoweredByComponent],
        providers: [
            { provide: UgcCustomizationService, useValue: service },
            { provide: ComponentFixtureAutoDetect, useValue: true }
        ]
    });
    let fixture = TestBed.createComponent(PoweredByComponent);

    return {
        fixture: fixture,
        component: fixture.componentInstance,
        customizationService: TestBed.get(UgcCustomizationService)
    };
}

interface TestEnv {
    fixture: ComponentFixture<PoweredByComponent>;
    component: PoweredByComponent;
    customizationService: Partial<UgcCustomizationService>;
}
