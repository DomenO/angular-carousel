import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements AfterViewInit {

  @Input('arrows') arrows: 'inside' | 'outside' | 'none' = 'outside';
  @Input('borderSwipe') borderSwipe: number = 50;
  @Input('infinity') infinity: boolean = true;
  @Input('timeMove') timeMove: number = 500;
  @Input('pointColor') pointColor: string = '#3f51b5';  

  @ViewChild('content') viewContent: ElementRef;

  private infoPointer: { id:number, check:boolean }[] = [];
  private content: HTMLDivElement;
  private firstElement: HTMLDivElement;
  private lastElement: HTMLDivElement;
  private mouseDown: boolean;
  private startMousePositionX: number;
  private startContentPositionX: number;

  private calmMove: boolean;

  constructor(private cd: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.init();
  }

  private init() {

    this.cd.detach();

    this.content = this.viewContent.nativeElement as HTMLDivElement;

    for(let i=0; i<this.content.children.length; i++) {   
      let elem = this.content.children.item(i) as HTMLDivElement;
      elem.style.position = 'absolute';
      elem.style.left = (i*100)+'%';
      elem.style.width = '100%';
      elem.style.height = '100%';
      this.infoPointer.push({ id:i, check: false });
    }

    this.firstElement = this.content.children.item(0) as HTMLDivElement;
    this.lastElement = this.content.children.item(this.content.children.length-1) as HTMLDivElement;

    this.setInfoPointer(0);
    this.cd.detectChanges();

  }

  ngOnChanges() {
    this.cd.detectChanges();
  }

  onMouseDown(event) {
    if(this.calmMove || this.content.children.length < 2) return;

    this.mouseDown = true;
    this.startMousePositionX = this.getClientX(event);
    this.startContentPositionX = parseInt(this.content.style.left);

    if(!this.startContentPositionX) this.startContentPositionX = 0;
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onMouseMove(event) {
    if(!this.mouseDown) return;

    let clientX = this.getClientX(event);
    let pos = this.startContentPositionX + (clientX - this.startMousePositionX) / this.content.clientWidth * 100;

    if(Math.abs(pos - this.startContentPositionX) >= 100) return this.onMouseUp();

    this.checkNextElement(pos);

    this.content.style.left = pos+'%';
  }
  
  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchend', ['$event'])
  onMouseUp() {
    if(!this.mouseDown) return;

    this.mouseDown = false;

    let posContentX = parseFloat(this.content.style.left);
    
    let mn = Math.round(this.borderSwipe/2);
    if(posContentX <= this.startContentPositionX) mn *= -1;

    let pos = Math.round((posContentX+mn)/100) * 100;

    if(this.checkInfinity(pos))
      this.swithSlide(pos);
  }

  arrowSwitchSlide(direction: number) {
    if(this.calmMove || this.content.children.length < 2) return; 
    
    let pos = parseInt(this.content.style.left) + 100 * direction;

    if(this.checkInfinity(pos))
      this.swithSlide(pos, true);
  }

  pointerSwitchSlide(id: number) {
    if(this.calmMove || this.content.children.length < 2) return; 

    this.swithSlide(id*-100);
  }

  private checkInfinity(pos: number):boolean {
    if(!this.infinity)
      if(pos > 0) {
        this.swithSlide(0);
        return false;
      }
      else if(pos < -(this.content.children.length-1)*100) {
        this.swithSlide(-(this.content.children.length-1)*100);
        return false;
      }
    return true;
  }

  private swithSlide(pos: number, arrow:boolean = false) {

    if(!pos) pos = 0;

    if(arrow) this.checkNextElement(pos);

    this.setTransition();

    this.content.style.left = pos+'%';

    setTimeout(() => {
      if(!arrow) this.checkNextElement(pos);
      this.finaly();
    }, this.timeMove);
  }

  private finaly() {

    this.clearTransition();

    if(this.lastElement.style.left == '-100%') {

      let pos = ((this.content.children.length-1) * 100)+'%';
      this.lastElement.style.left = pos;

      if(this.content.style.left == '100%')
        this.content.style.left = '-'+pos;

    }
    if(this.firstElement.style.left == (this.content.children.length * 100)+'%') {

      let pos = '0%';
      this.firstElement.style.left = pos;

      if(this.content.style.left == -(this.content.children.length * 100)+'%')
        this.content.style.left = '-'+pos;

    }

    this.setInfoPointer(Math.abs(parseInt(this.content.style.left))/100);

    this.cd.detectChanges();
    
  }

  getInfoPointer(): { id:number, check: boolean }[] {
    return this.infoPointer;
  }

  private setInfoPointer(id: number) {

    for (let i = 0; i < this.infoPointer.length; i++)
      if(i == id) this.infoPointer[i].check = true;
      else this.infoPointer[i].check = false;
  }

  private checkNextElement(pos: number) {
    if(this.infinity && pos < -(this.content.children.length - 1) * 100) {
      this.firstElement.style.left = (this.content.children.length * 100)+'%';
      return;
    }
    
    if(this.infinity && pos > 0) {
      this.lastElement.style.left = '-100%';
      return;
    }

    this.firstElement.style.left = '0%';
    this.lastElement.style.left = ((this.content.children.length-1) * 100)+'%';
  }

  private getClientX(event): number {
    return event.targetTouches?event.targetTouches[0].clientX:event.clientX;
  }

  private setTransition() {
    this.content.style.transition = `left ${this.timeMove}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    this.calmMove = true;
  }

  private clearTransition() {
    this.content.style.transition = 'none';
    this.calmMove = false;
  }

}
 