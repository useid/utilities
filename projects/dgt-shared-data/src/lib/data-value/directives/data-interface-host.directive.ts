import { Directive, EventEmitter, Output, ViewContainerRef } from '@angular/core';
import { DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[dgtDataInterfaceHost]',
})
export class DGTDataInterfaceHostDirective {
  /** Used to emit valueUpdated events */
  @Output()
  valueUpdated: EventEmitter<{value: DGTLDResource, newObject: any}>;
  /** Used to emit submit events */
  @Output()
  submit: EventEmitter<any>;

  constructor(
    public viewContainerRef: ViewContainerRef,
    private paramChecker: DGTParameterCheckerService,
  ) {
    this.valueUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(val: {value: DGTLDResource, newObject: any}): void {
  this.paramChecker.checkParametersNotNull({val}, 1);
  this.valueUpdated.emit(val);
  }

  /**
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onSubmit(): void {
    this.submit.emit();
  }

}
