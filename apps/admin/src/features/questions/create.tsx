import { required } from 'ra-core';
import {
  AutocompleteInput,
  Create,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export function CreateQuestions() {
  return (
    <Create redirect="list">
      <SimpleForm>
        <TextInput
          source="text"
          label="Question Text"
          validate={[required()]}
          multiline
        />

        <ReferenceInput
          source="categoryId"
          reference="categories"
          label="Category"
        >
          <AutocompleteInput optionText="nameEn" validate={[required()]} />
        </ReferenceInput>

        <SelectInput
          source="difficulty"
          label="Difficulty"
          validate={[required()]}
          choices={[
            { id: 'easy', name: 'Easy' },
            { id: 'medium', name: 'Medium' },
            { id: 'hard', name: 'Hard' },
          ]}
        />
      </SimpleForm>
    </Create>
  );
}
