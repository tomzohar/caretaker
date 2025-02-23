import styles from './form-layout.module.scss';
import { FormEvent, useState } from 'react';
import { Form, FormItem } from '@caretaker/caretaker-types';
import { formItemRenderers } from '../../const/form-item-renderers';
import { Button } from '@caretaker/caretaker-ui';

export function FormLayout<T extends Record<string, any>>(props: Form<T>) {
  const [formState, setFormState] = useState<T>({} as T);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formState) {
      props.onSubmit(formState);
    }
  };

  const renderFormItem = (item: FormItem<keyof T>) => {
    return formItemRenderers[item.type]({
      onChange: (e) => {
        const currentState = formState || {};
        setFormState({ ...currentState, [item.id]: e.target.value });
      },
      className: styles.formItem,
      label: item.label,
      id: item.id as string,
      key: `formItem_${String(item.id)}`
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {props.items.map((item) => renderFormItem(item))}
      <div className={styles.buttonsContainer}>
        {props.buttonsConfig.map((config, index) => (<Button key={'formButton_' + index} {...config}>{config.text}</Button>))}
      </div>
    </form>
  );
}

export default FormLayout;
