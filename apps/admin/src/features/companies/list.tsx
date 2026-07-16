import { useRecordContext } from 'ra-core';
import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  DeleteButton,
  EditButton,
  List,
  RefreshButton,
  SearchInput,
} from '@/components/admin';
import { BadgeField } from '@/components/admin/badge-field';

function CompaniesActions() {
  return (
    <div className="flex items-center gap-2">
      <ColumnsButton />
      <CreateButton />
      <RefreshButton />
    </div>
  );
}

function ListIdBadge({ source }: { source: string }) {
  const record = useRecordContext();
  const value = record?.[source];
  return (
    <BadgeField
      source={source}
      className={value === 'saudi' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}
    />
  );
}

function ActiveBadge({ source }: { source: string }) {
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

const companyFilters = [
  <SearchInput source="q" alwaysOn />,
];

export function ListCompanies() {
  return (
    <List filters={companyFilters} actions={<CompaniesActions />}>
      <DataTable>
        <DataTable.Col label="Name (EN)" source="nameEn" sortable />
        <DataTable.Col label="Name (AR)" source="nameAr" />
        <DataTable.Col label="List" source="listId">
          <ListIdBadge source="listId" />
        </DataTable.Col>
        <DataTable.Col label="Active" source="isActive">
          <ActiveBadge source="isActive" />
        </DataTable.Col>
        <DataTable.Col label="Last Synced">
          <DateField
            source="lastSyncedAt"
            options={{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }}
          />
        </DataTable.Col>
        <DataTable.Col label="Created At">
          <DateField
            source="createdAt"
            options={{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }}
          />
        </DataTable.Col>
        <DataTable.Col label="Actions">
          <div className="flex gap-2">
            <EditButton />
            <DeleteButton />
          </div>
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
