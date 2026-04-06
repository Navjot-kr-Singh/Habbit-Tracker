import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Today from './pages/Today';
import Tracker from './pages/Tracker';
import Analytics from './pages/Analytics';
import Journey from './pages/Journey';
import Plan from './pages/Plan';
import { HabitProvider } from './context/HabitContext';

// Protected Layout
function ProtectedLayout({ children }) {
  return (
    <>
      <SignedIn>
        <HabitProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </HabitProvider>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/sign-in/*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />

        <Route path="/" element={<ProtectedLayout><Today /></ProtectedLayout>} />
        <Route path="/plan" element={<ProtectedLayout><Plan /></ProtectedLayout>} />
        <Route path="/journey" element={<ProtectedLayout><Journey /></ProtectedLayout>} />
        <Route path="/tracker" element={<ProtectedLayout><Tracker /></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
