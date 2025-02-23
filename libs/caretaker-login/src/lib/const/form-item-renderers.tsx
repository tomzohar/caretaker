import { TextField, TextFieldProps } from '@mui/material';
import { ReactElement } from 'react';
import { FormItemType } from '@caretaker/caretaker-types';

export const formItemRenderers: Record<
  FormItemType,
  (props: TextFieldProps) => ReactElement
> = {
  [FormItemType.TEXT]: (props: TextFieldProps) => {
    const key = props.key;
    delete props.key;
    return <TextField key={key} {...props} type={'text'} />;
  },
  [FormItemType.EMAIL]: (props: TextFieldProps) => {
    const { key } = props;
    delete props.key;
    return <TextField key={key} {...props} type={'email'} />;
  },
  [FormItemType.NUMBER]: (props: TextFieldProps) => {
    const { key } = props;
    delete props.key;
    return <TextField key={key} {...props} type={'number'} />;
  },
  [FormItemType.PASSWORD]: (props: TextFieldProps) => {
    const { key } = props;
    delete props.key;
    return <TextField key={key} {...props} type={'password'} />;
  },
};
