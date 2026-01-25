import type { ExtractRecordPaths, HintedString } from 'ra-core';
import type { HTMLAttributes } from 'react';
import type { FieldProps } from '@/lib/field.type';
import get from 'lodash/get';
import { useFieldValue, useTranslate } from 'ra-core';
import { cn } from '@/lib/utils';

/**
 * Displays an image from a record field.
 *
 * @example
 * <ImageField source="url" title="title" />
 */
export function ImageField<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
>(props: ImageFieldProps<RecordType>) {
  const {
    className,
    empty,
    title,
    src,
    defaultValue,
    source,
    record,
    imageClassName,
    ...rest
  } = props;
  const sourceValue = useFieldValue({ defaultValue, source, record });
  const titleValue
    = useFieldValue({
      ...props,
      // @ts-expect-error We ignore here because title might be a custom label or undefined instead of a field name
      source: title,
    })?.toString() ?? title;
  const translate = useTranslate();

  if (
    sourceValue == null
    || (Array.isArray(sourceValue) && sourceValue.length === 0)
  ) {
    if (!empty) {
      return null;
    }

    return (
      <div className={cn('inline-block', className)} {...rest}>
        {typeof empty === 'string' ? translate(empty, { _: empty }) : empty}
      </div>
    );
  }

  const imgClasses = cn('max-h-40 max-w-full object-contain rounded', imageClassName);

  if (Array.isArray(sourceValue)) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)} {...rest}>
        {sourceValue.map((file, index) => {
          const fileTitleValue = title ? get(file, title, title) : title;
          const srcValue = src ? get(file, src, title) : title;

          return (
            <img
              key={index}
              src={srcValue}
              alt={fileTitleValue}
              title={fileTitleValue}
              className={imgClasses}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('inline-block', className)} {...rest}>
      <img
        src={sourceValue?.toString()}
        alt={titleValue}
        title={titleValue}
        className={imgClasses}
      />
    </div>
  );
}

export interface ImageFieldProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
> extends FieldProps<RecordType>,
  HTMLAttributes<HTMLElement> {
  /**
   * The source of the image, for an array of files.
   */
  src?: string;
  title?: HintedString<ExtractRecordPaths<RecordType>>;
  /**
   * Class name for the img element.
   */
  imageClassName?: string;
}
