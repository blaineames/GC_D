import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FamilyProvider } from './context/FamilyContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Chores } from './pages/Chores';
import { Shopping } from './pages/Shopping';
import { Calendar } from './pages/Calendar';
import { MealPlanner } from './pages/MealPlanner';
import { Notes } from './pages/Notes';

export default function App() {
  return (
    <FamilyProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/chores" element={<Chores />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/meals" element={<MealPlanner />} />
            <Route path="/notes" element={<Notes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FamilyProvider>
  );
}
