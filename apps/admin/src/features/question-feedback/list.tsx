import { 
  List, 
  DataTable, 
  TextField, 
  DateField,
  ColumnsButton,
  ExportButton,
} from "@/components/admin";

const QuestionFeedbackActions = () => (
    <div className="flex items-center gap-2">
      <ColumnsButton />
      <ExportButton />
    </div>
);

export const ListQuestionFeedback = () => {
  return (
    <List  actions={<QuestionFeedbackActions />}>
      <DataTable>
        <DataTable.Col label="Question">
          <TextField source="questionText" />
        </DataTable.Col>
        <DataTable.Col label='Type'>
          <TextField source="type" />
        </DataTable.Col>
        <DataTable.Col label='Comment'>
          <TextField source="comment" />
        </DataTable.Col>
        <DataTable.Col label="createdAt">
          <DateField source="createdAt" showTime />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};
