import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges
} from '@angular/core';


@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements AfterViewInit, OnChanges {

  @Input() arrows: 'inside' | 'outside' | 'none' = 'outside';
  @Input() borderSwipe = 50;
  @Input() infinity = true;
  @Input() timeMove = 500;
  @Input() pointColor = '#3f51b5';

  @ViewChild('content', {static: false}) viewContent: ElementRef;

  private readonly timingFunction = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  private infoPointer: { id: number, check: boolean }[] = [];
  private content: HTMLDivElement;
  private firstElement: HTMLDivElement;
  private lastElement: HTMLDivElement;
  private mouseDown: boolean;
  private startMousePositionX: number;
  private startContentPositionX: number;
  private calmMove: boolean;

  constructor(private cd: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.cd.detach();

    this.content = this.viewContent.nativeElement as HTMLDivElement;

    for (let i = 0; i < this.content.children.length; i++) {
      const elem = this.content.children.item(i) as HTMLDivElement;
      elem.style.position = 'absolute';
      elem.style.left = (i * 100) + '%';
      elem.style.width = '100%';
      elem.style.height = '100%';
      this.infoPointer.push({ id: i, check: false });
    }

    this.firstElement = this.content.children.item(0) as HTMLDivElement;
    this.lastElement = this.content.children.item(this.content.children.length - 1) as HTMLDivElement;

    this.setInfoPointer(0);
    this.cd.detectChanges();
  }

  ngOnChanges() {
    this.cd.detectChanges();
  }

  onMouseDown(event: MouseEvent) {
    if (this.calmMove || this.content.children.length < 2)
      return;

    this.mouseDown = true;
    this.startMousePositionX = this.getClientX(event);
    this.startContentPositionX = parseInt(this.content.style.left);

    if (!this.startContentPositionX)
      this.startContentPositionX = 0;
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.mouseDown)
      return;

    const clientX = this.getClientX(event);
    const pos = this.startContentPositionX + (clientX - this.startMousePositionX) / this.content.clientWidth * 100;

    if (Math.abs(pos - this.startContentPositionX) >= 100)
      return this.onMouseUp();

    this.checkNextElement(pos);

    this.content.style.left = pos + '%';
  }

  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchend', ['$event'])
  onMouseUp() {
    if (!this.mouseDown)
      return;

    this.mouseDown = false;

    const posContentX = parseFloat(this.content.style.left);

    let mn = Math.round(this.borderSwipe / 2);

    if (posContentX <= this.startContentPositionX)
      mn *= -1;

    const pos = Math.round((posContentX + mn) / 100) * 100;

    if (this.checkInfinity(pos))
      this.swithSlide(pos);
  }

  arrowSwitchSlide(direction: number) {
    if (this.calmMove || this.content.children.length < 2)
      return;

    if (!this.content.style.left)
      this.content.style.left = '0%';

    const pos = parseInt(this.content.style.left) + 100 * direction;

    if (this.checkInfinity(pos))
      this.swithSlide(pos, true);
  }

  pointerSwitchSlide(id: number) {
    if (this.calmMove || this.content.children.length < 2)
      return;

    this.swithSlide(id * -100);
  }

  getInfoPointer(): { id: number, check: boolean }[] {
    return this.infoPointer;
  }

  private checkInfinity(pos: number): boolean {
    if (this.infinity)
      return true;

    if (pos > 0) {
      this.swithSlide(0);
      return false;
    }

    if (pos < -(this.content.children.length - 1) * 100) {
      this.swithSlide(-(this.content.children.length - 1) * 100);
      return false;
    }

    return true;
  }

  private swithSlide(pos: number, arrow: boolean = false) {
    if (arrow)
      this.checkNextElement(pos);

    this.setTransition();

    this.content.style.left = pos + '%';

    setTimeout(() => {
      if (!arrow)
        this.checkNextElement(pos);

      this.finaly();
    }, this.timeMove);
  }

  private finaly() {

    this.clearTransition();

    if (this.lastElement.style.left === '-100%') {

      const pos = ((this.content.children.length - 1) * 100) + '%';
      this.lastElement.style.left = pos;

      if (this.content.style.left === '100%')
        this.content.style.left = '-' + pos;

    }

    if (this.firstElement.style.left === (this.content.children.length * 100) + '%') {

      const pos = '0%';
      this.firstElement.style.left = pos;

      if (this.content.style.left === -(this.content.children.length * 100) + '%')
        this.content.style.left = '-' + pos;

    }

    this.setInfoPointer(Math.abs(parseInt(this.content.style.left)) / 100);
    this.cd.detectChanges();
  }

  private setInfoPointer(id: number) {

    for (let i = 0; i < this.infoPointer.length; i++)
      if (i === id) this.infoPointer[i].check = true;
      else this.infoPointer[i].check = false;
  }

  private checkNextElement(pos: number) {
    if (this.infinity && pos < -(this.content.children.length - 1) * 100) {
      this.firstElement.style.left = (this.content.children.length * 100) + '%';
      return;
    }

    if (this.infinity && pos > 0) {
      this.lastElement.style.left = '-100%';
      return;
    }

    this.firstElement.style.left = '0%';
    this.lastElement.style.left = ((this.content.children.length - 1) * 100) + '%';
  }

  private getClientX(event): number {
    return event.targetTouches ? event.targetTouches[0].clientX : event.clientX;
  }

  private setTransition() {
    this.content.style.transition = `left ${this.timeMove}ms ${this.timingFunction}`;
    this.calmMove = true;
  }

  private clearTransition() {
    this.content.style.transition = 'none';
    this.calmMove = false;
  }

}
