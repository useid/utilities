import { configuration } from 'test.configuration';
import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
import { DGTBrowserDataInterfaceEmailComponent } from './data-interface-email.component';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { mockCategoryEmail, mockTypeWork, mockValueEmail, mockReferenceEmail } from 'test.data.mock-data';

describe('DataInterfaceEmailComponent', () => {
    const testService = new DGTTestRunnerComponent<DGTBrowserDataInterfaceEmailComponent>(configuration);
    testService.setup(DGTBrowserDataInterfaceEmailComponent);
    let hostElement: HTMLElement;

    beforeEach(() => {
        testService.component.category = mockCategoryEmail;
        testService.component.values = [mockValueEmail, mockReferenceEmail, mockTypeWork];
        testService.fixture.detectChanges();
        hostElement = testService.fixture.nativeElement;
    });

    it('should be created', () => {
        expect(testService.component).toBeTruthy();
    });

    describe('onValueUpdated function', () => {
        it('should emit valueUpdated with correct val', () => {
            spyOn(testService.component.valueUpdated, 'emit');
            testService.component.onValueUpdated({value: mockValueEmail, newObject: 'test'});
            expect(testService.component.valueUpdated.emit).toHaveBeenCalled();
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

    describe('html view', () => {
        it('should contain interface-email-values', () => {
            const emailValues = hostElement.querySelectorAll('dgt-data-interface-email-value');
            expect(emailValues.length).toBeGreaterThan(0);
        });
    });
});