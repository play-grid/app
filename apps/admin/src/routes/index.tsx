import { createFileRoute } from '@tanstack/react-router';
import { Resource } from 'ra-core';
import { Admin } from '@/components/admin';
import dataProvider from '@/lib/data-provider';
import { HugeiconsIcon } from '@hugeicons/react';
import { BubbleChatQuestionIcon, MessageQuestionIcon, Image01Icon } from '@hugeicons/core-free-icons';
import { ListQuestions } from '@/features/questions/list';
import { CreateQuestions } from '@/features/questions/create';
import { EditQuestions } from '@/features/questions/edit';
import { ListQuestionFeedback } from '@/features/question-feedback/list';
import { ListBanners } from '@/features/banners/list';
import { CreateBanner } from '@/features/banners/create';
import { EditBanner } from '@/features/banners/edit';

export const Route = createFileRoute('/')({
  component: App,
});
// TODO refactor icons one icons in package/ui and use design tokens 
const QuestionIcon = () => (
  <HugeiconsIcon
    icon={BubbleChatQuestionIcon}
    size={20}
    color="currentColor"
    strokeWidth={1.5}
  />
);

const QuestionFeedbackIcon = () => (
  <HugeiconsIcon
    icon={MessageQuestionIcon}
    size={20}
    color="currentColor"
    strokeWidth={1.5}
  />
);

const BannerIcon = () => (
  <HugeiconsIcon
    icon={Image01Icon}
    size={20}
    color="currentColor"
    strokeWidth={1.5}
  />
);

function App() {
  return (
    <Admin dataProvider={dataProvider} >
      <Resource
        name="questions"
        list={ListQuestions}
        icon={QuestionIcon}
        create={CreateQuestions}
        edit={EditQuestions}
      />
      <Resource
        name="question-feedback"
        list={ListQuestionFeedback}
        icon={QuestionFeedbackIcon}
      />
      <Resource
        name="banners"
        list={ListBanners}
        icon={BannerIcon}
        create={CreateBanner}
        edit={EditBanner}
      />
      <Resource name="categories" />
    </Admin>
  );
}