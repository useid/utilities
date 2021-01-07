import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DGTCategory, DGTDataInterfaceHostDirective, DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTDataInterfaceFactoryService } from '../../services/dgt-data-interface-factory.service';

@Component({
  selector: 'dgt-data-category',
  templateUrl: './dgt-data-category.component.html',
  styleUrls: ['./dgt-data-category.component.scss'],
})
export class DGTDataCategoryComponent implements AfterViewInit {

  /** Updates in children that need updating */
  public valuesToUpdate: Map<string, { value: DGTLDResource, newObject: any }>;

  @ViewChild(DGTDataInterfaceHostDirective) host: DGTDataInterfaceHostDirective;

  /** Data values that belong under this group */
  private _values: DGTLDResource[];
  public get values(): DGTLDResource[] {
    return this._values;
  }
  @Input() public set values(values: DGTLDResource[]) {
    this._values = values;
    this.updateReceived(values, this.category);
  }

  /** Categories of this group */
  private _category: DGTCategory;
  public get category(): DGTCategory {
    return this._category;
  }
  @Input() public set category(category: DGTCategory) {
    this._category = category;
    this.updateReceived(this.values, category);
  }

  /** Used to emit feedbackEvent events */
  @Output()
  valueUpdated: EventEmitter<{ value: DGTLDResource, newObject: any }>;

  /** Used to emit infoClicked events */
  @Output()
  infoClicked: EventEmitter<DGTCategory>;

  constructor(
    private interfaces: DGTDataInterfaceFactoryService,
    private paramChecker: DGTParameterCheckerService,
    private logger: DGTLoggerService,
  ) {
    this.valueUpdated = new EventEmitter();
    this.infoClicked = new EventEmitter();
    this.valuesToUpdate = new Map();
  }

  ngAfterViewInit(): void {
    if (this.host) {
      this.interfaces.create(this.host, this.category, this.values);
    }
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
  */
  public onValueUpdated(val: { value: DGTLDResource, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val }, 1);
    this.valuesToUpdate.set(val.value.uri, val);
  }

  public updateValues(values: Map<string, { value: DGTLDResource, newObject: any }>): void {
    values.forEach(value => this.valueUpdated.emit(value));
    this.valuesToUpdate.clear();
  }

  public clickedInfo(category: DGTCategory): void {
    this.logger.debug(DGTDataCategoryComponent.name, 'Clicked info in category component, emitting');
    this.infoClicked.emit(category);
  }

  updateReceived(values: DGTLDResource[], categories: DGTCategory): any {
    if (values && categories) {
      this.ngAfterViewInit();
    }
  }
}
