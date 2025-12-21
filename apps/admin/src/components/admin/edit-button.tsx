import type { RaRecord } from 'ra-core';
import { Pencil } from 'lucide-react';
import {
  Translate,
  useCreatePath,
  useRecordContext,
  useResourceContext,
} from 'ra-core';
import React from 'react';
import { Link } from 'react-router';
import { buttonVariants } from '@/components/ui/button';

export interface EditButtonProps {
  record?: RaRecord;
  resource?: string;
  label?: string;
}

/**
 * A button that navigates to the edit page for a record.
 *
 * Works within RecordContext to automatically get the record ID.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/editbutton/ EditButton documentation}
 *
 * @example
 * import { DataTable, EditButton } from '@/components/admin';
 *
 * const PostList = () => (
 *   <DataTable>
 *     <DataTable.Col source="title" />
 *     <DataTable.Col source="author" />
 *     <DataTable.Col source="published_at" />
 *     <DataTable.Col>
 *       <EditButton />
 *     </DataTable.Col>
 *   </DataTable>
 * );
 */
export function EditButton(props: EditButtonProps) {
  const resource = useResourceContext(props);
  const record = useRecordContext(props);
  const createPath = useCreatePath();
  const link = createPath({
    resource,
    type: 'edit',
    id: record?.id,
  });
  return (
    <Link
      className={buttonVariants({ variant: 'outline' })}
      to={link}
      onClick={stopPropagation}
    >
      <Pencil />
      <Translate i18nKey={props.label ?? 'ra.action.edit'}>
        {props.label ?? 'Edit'}
      </Translate>
    </Link>
  );
}

// useful to prevent click bubbling in a datagrid with rowClick
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();
