import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  DeleteButton,
  EditButton,
  ExportButton,
  List,
} from '@/components/admin';
import { FilterableField } from './FilterableField';

function QuestionsActions() {
  return (
    <div className="flex items-center gap-2">
      <ColumnsButton />
      <CreateButton />
      <ExportButton />
    </div>
  );
}

export function ListQuestions() {
  return (
    <List actions={<QuestionsActions />} sort={{ field: 'createdAt', order: 'DESC' }}>
      <DataTable>
        <DataTable.Col label="Question" source="text" />
        <DataTable.Col label="Category">
          <FilterableField source="categoryNameEn" filterSource="categoryId" />
        </DataTable.Col>

        <DataTable.NumberCol label="Feedbacks" source="feedbackCount" />

        <DataTable.Col label="Difficulty" source="difficulty" />
        <DataTable.Col label="Created At">
          <DateField
            source="createdAt"
            options={{
              weekday: 'long',
              year: 'numeric',
              month: 'long',
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
