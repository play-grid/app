import {
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  AutocompleteInput,
  ReferenceInput,
  SelectInput,
} from "@/components/admin";
import { required } from "ra-core";

export const EditQuestions = () => {
  return (
    <Edit mutationMode="pessimistic">
      <SimpleForm>
        <TextInput source="id" disabled className="text-gray-500" />

          <TextInput
            source="text"
            label="Question Text"
            validate={[required()]}
            multiline
            rows={3}
          />

          <SelectInput
            source="difficulty"
            label="Difficulty"
            validate={[required()]}
            choices={[
              { id: "easy", name: "Easy" },
              { id: "medium", name: "Medium" },
              { id: "hard", name: "Hard" },
            ]}
          />
        <ReferenceInput
          source="categoryId"
          reference="categories"
          label="Category"
        >
          <AutocompleteInput optionText="nameEn" validate={[required()]} />
        </ReferenceInput>


        {/* Read only date field for reference */}
        <DateInput source="createdAt" disabled />
      </SimpleForm>
    </Edit>
  );
};