import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const FiveSecondsPage = lazy(() => import('./five-seconds-page'));

export default function FiveSecondsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FiveSecondsPage />} />
    </Routes>
  );
}
