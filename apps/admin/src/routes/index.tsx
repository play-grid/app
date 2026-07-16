import { BubbleChatQuestionIcon, Building04Icon, Image01Icon, MessageQuestionIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { createFileRoute } from '@tanstack/react-router';
import { Resource } from 'ra-core';
import { Admin } from '@/components/admin';
import { CreateBanner } from '@/features/banners/create';
import { EditBanner } from '@/features/banners/edit';
import { ListBanners } from '@/features/banners/list';
import { CreateCompany } from '@/features/companies/create';
import { EditCompany } from '@/features/companies/edit';
import { ListCompanies } from '@/features/companies/list';
import { ListQuestionFeedback } from '@/features/question-feedback/list';
import { CreateQuestions } from '@/features/questions/create';
import { EditQuestions } from '@/features/questions/edit';
import { ListQuestions } from '@/features/questions/list';
import dataProvider from '@/lib/data-provider';

export const Route = createFileRoute('/')({
  component: App,
});

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

function CompanyIcon() {
  return (
    <HugeiconsIcon
      icon={Building04Icon}
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
        name="companies"
        list={ListCompanies}
        icon={CompanyIcon}
        create={CreateCompany}
        edit={EditCompany}
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
