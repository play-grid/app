import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  DateTimeInput,
  FileInput,
  FileField,
} from "@/components/admin";
import { BooleanInput } from "@/components/admin/boolean-input";
import { required } from "ra-core";

// Convert URL string to file object for display
const formatImageUrl = (value: string | null) => {
  if (!value) return null;
  // For URLs (either data URLs or R2 URLs), return as-is
  return {
    src: value,
    title: 'Banner Image',
  };
};

export const CreateBanner = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput
        source="titleEn"
        label="Title (English)"
        validate={[required()]}
      />
      <TextInput
        source="titleAr"
        label="Title (Arabic)"
        validate={[required()]}
      />
      <TextInput
        source="descriptionEn"
        label="Description (English)"
        multiline
      />
      <TextInput
        source="descriptionAr"
        label="Description (Arabic)"
        multiline
      />
       <FileInput
         source="imageFile"
         label="Banner Image"
         accept={{ 'image/*': [] }}
         multiple={false}
         format={formatImageUrl}
       >
         <FileField source="src" title="title" />
       </FileInput>
      <TextInput source="linkUrl" label="Link URL" />
      <BooleanInput source="isActive" label="Active" defaultValue={true} />
      <NumberInput source="position" label="Position" defaultValue={0} />
      <DateTimeInput source="startDate" label="Start Date" />
      <DateTimeInput source="endDate" label="End Date" />
    </SimpleForm>
  </Create>
);