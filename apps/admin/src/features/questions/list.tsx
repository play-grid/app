import {
  List,
  DataTable,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  ColumnsButton,
  CreateButton,
  ExportButton,
  NumberField,
} from "@/components/admin";
import { FilterableField } from "./FilterableField";

const QuestionsActions = () => (
    <div className="flex items-center gap-2">
      <ColumnsButton />
      <CreateButton />
      <ExportButton />
    </div>
);

export const ListQuestions = () => {
  return (
    <List actions={<QuestionsActions />} sort={{ field: 'createdAt', order: 'DESC' }}>
      <DataTable>
        <DataTable.Col label="Question">
          <TextField source="text" />
        </DataTable.Col>
        <DataTable.Col label='category'>
          <FilterableField source="categoryNameEn" filterSource="categoryId" />
        </DataTable.Col>
        <DataTable.Col label="Feedbacks">
          <NumberField source="feedbackCount" />
        </DataTable.Col>
        <DataTable.Col label="Difficulty">
          <FilterableField source="difficulty" />
        </DataTable.Col>
        <DataTable.Col label="createdAt">
          <DateField source="createdAt" showTime />
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
};