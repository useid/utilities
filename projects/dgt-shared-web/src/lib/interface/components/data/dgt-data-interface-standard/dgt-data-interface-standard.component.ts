import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTCategory, DGTDataInterface, DGTDataValue } from '@digita/dgt-shared-data';
import { DGTCategoryFilterBGP } from '@digita/dgt-shared-data/lib/categories/models/dgt-category-filter-bgp.model';

@Component({
  selector: 'dgt-data-interface-standard',
  templateUrl: './dgt-data-interface-standard.component.html',
  styleUrls: ['./dgt-data-interface-standard.component.scss']
})
/**
 * The default way of displaying data. This component used the data-field component
 * to display itd values.
 */
export class DGTDataInterfaceStandardComponent implements OnInit, DGTDataInterface {

  /** Holds the category this interface belongs to */
  private _category: DGTCategory;
  public get category(): DGTCategory {
    return this._category;
  }
  @Input() public set category(category: DGTCategory) {
    this._category = category;

    this.updateReceived(this.values, category);
  }

  /** holds the values to display */
  private _values: DGTDataValue[];
  public get values(): DGTDataValue[] {
    return this._values;
  }
  @Input() public set values(values: DGTDataValue[]) {
    this._values = values;

    this.updateReceived(values, this.category);
  }

  /** List of category fields for which a value exists */
  public filteredFields: DGTDataValue[];

  /** Used to emit feedbackEvent events */
  @Output()
  public valueUpdated: EventEmitter<{ value: DGTDataValue, newObject: any }>;
  /** Used to emit submit events */
  @Output()
  public submit: EventEmitter<any>;

  constructor(
    private paramChecker: DGTParameterCheckerService,
    private logger: DGTLoggerService,
  ) {
    this.valueUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }

  ngOnInit() { }

  private updateReceived(values: DGTDataValue[], category: DGTCategory) {
    this.logger.debug(DGTDataInterfaceStandardComponent.name, 'Update received', { values, category });

    if (values && category) {
      const filteredPredicates = _.flatten(category.filters
        .map((filter: DGTCategoryFilterBGP) => filter.predicates)
      );

      this.filteredFields = values
        .filter((value: DGTDataValue) =>
          filteredPredicates.some(predicate => predicate.name === value.predicate.name &&
            predicate.namespace === value.predicate.namespace
          )
        );
    }
  }

  /**
   * @param val the original value and its updated object value
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(val: { value: DGTDataValue, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val }, 1);
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