import { render } from '@testing-library/react';
import FormLayout from './form-layout';
import { Form, FormItemType } from '@caretaker/caretaker-types';

interface TestFormValue {
  testField: string;
}

describe('FormLayout', () => {
  it('should render successfully', () => {
    const mockForm: Form<TestFormValue> = {
      items: [
        {
          id: 'testField',
          type: FormItemType.TEXT,
          label: 'Test Field'
        }
      ],
      buttonsConfig: [
        {
          text: 'Submit',
          type: 'submit'
        }
      ],
      onSubmit: () => void 0,
    };

    const { baseElement } = render(<FormLayout {...mockForm} />);
    expect(baseElement).toBeTruthy();
  });
});
