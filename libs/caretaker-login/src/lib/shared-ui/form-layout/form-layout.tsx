import { FormEvent, useState } from 'react';
import { Form, FormItem, FormItemType } from '@caretaker/caretaker-types';
import { formItemRenderers } from '../../const/form-item-renderers';
import { Button } from '@caretaker/caretaker-ui';
import { validateFormField } from './form-validation';
import styles from './form-layout.module.scss';

export function FormLayout<T extends Record<string, unknown>>(props: Form<T>) {
  const [formState, setFormState] = useState<T>({} as T);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = (id: keyof T, value: unknown) => {
    const item = props.items.find((i) => i.id === id);
    if (!item) return '';
    return validateFormField(item, value, formState);
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    props.items.forEach((item) => {
      const error = validateField(item.id, formState[item.id]);
      if (error) {
        newErrors[item.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = props.items.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouched(allTouched);

    if (validateForm() && formState) {
      props.onSubmit(formState);
    }
  };

  const handleBlur = (id: keyof T) => {
    setTouched((prev) => ({ ...prev, [id]: true }));
    const error = validateField(id, formState[id]);
    setErrors((prev) => ({ ...prev, [id]: error }));
  };

  const renderFormItem = (item: FormItem<keyof T>) => {
    const showError = touched[item.id] && !!errors[item.id];
    return formItemRenderers[item.type]({
      onChange: (e) => {
        const currentState = formState || {};
        const newValue = e.target.value;
        setFormState({ ...currentState, [item.id]: newValue });
        
        if (touched[item.id]) {
          const error = validateField(item.id, newValue);
          setErrors((prev) => ({ ...prev, [item.id]: error }));
        }
      },
      onBlur: () => handleBlur(item.id),
      className: styles.formItem,
      label: item.label,
      id: item.id as string,
      key: `formItem_${String(item.id)}`,
      required: item.required,
      error: showError,
      helperText: showError ? errors[item.id] : undefined
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {props.items.map((item) => renderFormItem(item))}
      <div className={styles.buttonsContainer}>
        {props.buttonsConfig.map((config, index) => (
          <Button key={'formButton_' + index} {...config}>
            {config.text}
          </Button>
        ))}
      </div>
    </form>
  );
}

export default FormLayout;
