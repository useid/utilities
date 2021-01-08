import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { configuration } from '../../../../test.configuration';
import { mockCategoryName, mockValueName } from '../../../../test.mock-data';
import { DGTDataInterfaceStandardComponent } from './dgt-data-interface-standard.component';

describe('DGTDataInterfaceStandardComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTDataInterfaceStandardComponent>(configuration);
    testService.setup(DGTDataInterfaceStandardComponent, false);
    let hostElement: HTMLElement;

    beforeEach(() => {
        hostElement = testService.fixture.nativeElement;
        testService.component.category = mockCategoryName;
        testService.component.values = [mockValueName];
        testService.fixture.detectChanges();
    });

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });

    describe('html view', () => {
        it('should contain data fields', () => {
            const dataFields = hostElement.querySelectorAll('dgt-data-field');
            expect(dataFields.length).toBeGreaterThan(0);
        });
    });

    describe('onValueUpdated function', () => {
        it('should emit valueUpdated with correct val', () => {
            const payload = {value: mockValueName, newObject: 'test'};
            spyOn(testService.component.valueUpdated, 'emit');
            testService.component.onValueUpdated(payload);
            expect(testService.component.valueUpdated.emit).toHaveBeenCalledWith(payload);
        });
        it('should throw DGTErrorArgument if val is null', () => {
            expect(() => { testService.component.onValueUpdated(null) }).toThrowError(DGTErrorArgument);
        });
    });

    describe('onSubmit function', () => {
        it('should emit submit', () => {
            spyOn(testService.component.submit, 'emit');
            testService.component.onSubmit();
            expect(testService.component.submit.emit).toHaveBeenCalled();
        });
    });

});
