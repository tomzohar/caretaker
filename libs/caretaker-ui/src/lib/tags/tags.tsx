import { Chip, Stack } from '@mui/material';
import styles from './tags.module.scss';
import clsx from 'clsx';

export interface Tag {
  id: string;
  label: string;
  color?: string;
}

export interface TagsProps {
  tags: Tag[];
  onDelete?: (tag: Tag) => void;
  onClick?: (tag: Tag) => void;
  className?: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

export function Tags({ 
  tags, 
  onDelete, 
  onClick,
  className,
  size = 'small',
  variant = 'filled'
}: TagsProps) {
  return (
    <Stack 
      direction="row" 
      spacing={1} 
      className={clsx(styles.tags, 'MuiStack-root', className)}
    >
      {tags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.label}
          size={size}
          variant={variant}
          className={clsx(styles.tag, 'MuiChip-root')}
          onClick={onClick ? () => onClick(tag) : undefined}
          onDelete={onDelete ? () => onDelete(tag) : undefined}
          sx={tag.color ? {
            backgroundColor: tag.color,
            '&:hover': {
              backgroundColor: tag.color,
              filter: 'brightness(0.9)'
            }
          } : undefined}
        />
      ))}
    </Stack>
  );
} 