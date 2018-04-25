// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import {
//   inject,
//   async,
//   TestBed,
//   ComponentFixture
// } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { GanService } from './core/services/gan/gan.service';

// /**
//  * Load the implementations that should be tested
//  */
// import { AppComponent } from './app.component';
// import { AppState } from './core/services/utils/utils.service';

// describe(`App`, () => {
//   let comp: AppComponent;
//   let fixture: ComponentFixture<AppComponent>;

//   /**
//    * async beforeEach
//    */
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [RouterTestingModule],
//       declarations: [AppComponent],
//       schemas: [NO_ERRORS_SCHEMA],
//       providers: [AppState, GanService]
//     })
//       /**
//        * Compile template and css
//        */
//       .compileComponents();
//   }));

//   /**
//    * Synchronous beforeEach
//    */
//   beforeEach(() => {
//     fixture = TestBed.createComponent(AppComponent);
//     comp = fixture.componentInstance;

//     /**
//      * Trigger initial data binding
//      */
//     fixture.detectChanges();
//   });

//   it(`should be readly initialized`, () => {
//     expect(fixture).toBeDefined();
//     expect(comp).toBeDefined();
//   });

// });
