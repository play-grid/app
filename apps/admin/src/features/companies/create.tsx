import { required } from 'ra-core';
import {
  Create,
  SelectInput,
  SimpleForm,
  TextInput,
} from '@/components/admin';
import { BooleanInput } from '@/components/admin/boolean-input';

export function CreateCompany() {
  return (
    <Create redirect="list">
      <SimpleForm>
        <TextInput
          source="nameEn"
          label="Name (English)"
          validate={[required()]}
        />
        <TextInput
          source="nameAr"
          label="Name (Arabic)"
        />
        <SelectInput
          source="listId"
          label="List"
          validate={[required()]}
          defaultValue="companies"
          choices={[
            { id: 'companies', name: 'Global' },
            { id: 'saudi', name: 'Saudi' },
          ]}
        />
        <BooleanInput
          source="sync"
          label="Sync logo immediately"
          defaultValue={true}
        />
      </SimpleForm>
    </Create>
  );
}
