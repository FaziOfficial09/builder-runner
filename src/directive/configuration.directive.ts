import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

@Directive({
  selector: '[appConfigurable]'
})
export class ConfigurableDirective implements OnInit, OnDestroy {
  @Input('appConfigurable') configs: Array<{event: string, action: {url: string, method: string, data?: any, headers?: any}}>;

  private unsubscribe$ = new Subject<void>();

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit() {
    this.configs.forEach(config => {
      if (config && config.event && config.action) {
        this.renderer.listen(this.el.nativeElement, config.event, () => {
          const { url, method, data, headers } = config.action;
          // this.applicationService.callApi(url, method, data, headers)
          //   .pipe(takeUntil(this.unsubscribe$))
          //   .subscribe(response => {
          //     // handle API response
          //   });
        });
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.unsubscribe$.unsubscribe();
  }
}
