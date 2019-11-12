import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  arrows: string = 'outside';
  borderSwipe: number = 50;
  infinity: number = 1;
  timeMove: number = 500;
  pointColor: string = '#3f51b5';
  autoplay: boolean = true;
  autoplaySpeed: number = 2000;
}
