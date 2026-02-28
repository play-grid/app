import { useRecordContext } from 'ra-core';
import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  EditButton,
  ExportButton,
  ImageField,
  List,
} from '@/components/admin';

function BannersActions() {
  return (
    <div className="flex items-center gap-2">
      <ColumnsButton />
      <CreateButton />
      <ExportButton />
    </div>
  );
}

function BooleanDisplay({ source }: { source: string }) {
  const record = useRecordContext();
  const value = record?.[source];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      value
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }`}
    >
      {value ? 'Active' : 'Inactive'}
    </span>
  );
}

export function ListBanners() {
  return (
    <List actions={<BannersActions />}>
      <DataTable>
        <DataTable.Col label="Image" source="imageUrl">
          <ImageField source="imageUrl" imageClassName="h-10 w-20" />
        </DataTable.Col>
        <DataTable.Col label="Title (EN)" source="titleEn" />
        <DataTable.Col label="Title (AR)" source="titleAr" />
        <DataTable.Col label="Active" source="isActive">
          <BooleanDisplay source="isActive" />
        </DataTable.Col>
        <DataTable.NumberCol label="Position" source="position" />
        <DataTable.Col label="Start Date">
          <DateField
            source="startDate"
            options={{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }}
          />
        </DataTable.Col>
        <DataTable.Col label="End Date">
          <DateField
            source="endDate"
            options={{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }}
          />
        </DataTable.Col>
        <DataTable.Col label="Actions">
          <EditButton />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
