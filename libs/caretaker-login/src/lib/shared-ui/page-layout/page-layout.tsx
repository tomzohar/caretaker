import styles from './page-layout.module.scss';
import { Card, Typography } from '@mui/material';
import { ComponentProps, PropsWithChildren } from 'react';
import classNames from 'classnames';

export function PageLayout(props: PropsWithChildren<ComponentProps<'div'> & {title: string}>) {
  const { title, children } = props;
  return (
    <div className={styles.signupPage}>
      <Card {...props} className={classNames(styles.signupFormWrapper, props.className)}>
        <h3>EDITING</h3>
        <Typography variant={'h2'}>{title}</Typography>
        {children}
      </Card>
    </div>
  );
}

export default PageLayout;
