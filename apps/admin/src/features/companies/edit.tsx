import { required } from 'ra-core';
import {
  DateInput,
  Edit,
  SelectInput,
  SimpleForm,
  TextInput,
} from '@/components/admin';
import { BooleanInput } from '@/components/admin/boolean-input';

export function EditCompany() {
  return (
    <Edit mutationMode="pessimistic">
      <SimpleForm>
        <TextInput source="id" disabled className="text-gray-500" />
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
          choices={[
            { id: 'companies', name: 'Global' },
            { id: 'saudi', name: 'Saudi' },
          ]}
        />
        <BooleanInput
          source="isActive"
          label="Active"
        />
        <DateInput source="createdAt" disabled />
      </SimpleForm>
    </Edit>
  );
}
