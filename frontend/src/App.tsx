import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HabitsProvider } from './contexts/HabitsContext';
import { GoalsProvider } from './contexts/GoalsContext';
import { CheckInsProvider } from './contexts/CheckInsContext';
import { RemindersProvider } from './contexts/RemindersContext';
import { RewardsProvider } from './contexts/RewardsContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <HabitsProvider>
      <GoalsProvider>
        <CheckInsProvider>
          <RemindersProvider>
            <RewardsProvider>
              <Router>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                  </Routes>
                </Layout>
              </Router>
            </RewardsProvider>
          </RemindersProvider>
        </CheckInsProvider>
      </GoalsProvider>
    </HabitsProvider>
  );
}

export default App;

