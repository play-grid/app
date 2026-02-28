import { BubbleChatQuestionIcon, Image01Icon, MessageQuestionIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { createFileRoute } from '@tanstack/react-router';
import { Resource } from 'ra-core';
import { Admin } from '@/components/admin';
import { CreateBanner } from '@/features/banners/create';
import { EditBanner } from '@/features/banners/edit';
import { ListBanners } from '@/features/banners/list';
import { ListQuestionFeedback } from '@/features/question-feedback/list';
import { CreateQuestions } from '@/features/questions/create';
import { EditQuestions } from '@/features/questions/edit';
import { ListQuestions } from '@/features/questions/list';
import dataProvider from '@/lib/data-provider';

export const Route = createFileRoute('/')({
  component: App,
});
// TODO refactor icons one icons in package/ui and use design tokens
function QuestionIcon() {
  return (
    <HugeiconsIcon
      icon={BubbleChatQuestionIcon}
      size={20}
      color="currentColor"
      strokeWidth={1.5}
    />
  );
}

function QuestionFeedbackIcon() {
  return (
    <HugeiconsIcon
      icon={MessageQuestionIcon}
      size={20}
      color="currentColor"
      strokeWidth={1.5}
    />
  );
}

function BannerIcon() {
  return (
    <HugeiconsIcon
      icon={Image01Icon}
      size={20}
      color="currentColor"
      strokeWidth={1.5}
    />
  );
}

function App() {
  return (
    <Admin dataProvider={dataProvider}>
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
