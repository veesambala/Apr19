import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'ugc',
    templateUrl: './ugc.component.html'
})
export class UgcComponent {
    constructor (private _route: ActivatedRoute) {
    }
}