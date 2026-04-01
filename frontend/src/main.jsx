import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import 'react-calendar-heatmap/dist/styles.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key in .env. Authentication will fail.")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-sm">
          <h1 className="text-xl font-bold mb-2">Clerk Config Missing</h1>
          <p className="text-slate-400">Please provide VITE_CLERK_PUBLISHABLE_KEY in the frontend .env file.</p>
        </div>
      </div>
    )}
  </StrictMode>,
)
