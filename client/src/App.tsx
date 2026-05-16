import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from './components/layout/AuthGuard';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/layout/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import StudyPage from './pages/StudyPage';
import CardFormPage from './pages/CardFormPage';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route
            element={
              <ErrorBoundary>
                <AppShell />
              </ErrorBoundary>
            }
          >
            <Route path="/" element={<LibraryPage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/cards/new" element={<CardFormPage />} />
            <Route path="/cards/:id/edit" element={<CardFormPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
