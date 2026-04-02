# Habit Tracker

A comprehensive, full-stack 100-Day Habit Tracking platform designed to help users build and maintain routines. This project is built using the **MERN** stack (MongoDB, Express, React, Node.js) with **Clerk** for robust authentication.

## Features

- **✅ 100-Day Tracking**: Special focus on a 100-day habit building challenge with a dynamic GitHub-style heatmap extending from April to December.
- **🔐 Secure Authentication**: Integrated with Clerk for seamless and secure user authentication and management.
- **⏰ Habit Scheduling**: Add specific time slots (AM/PM) for habits, with automatic sorting and organization.
- **🔄 Everyday Automations**: Configure routines that automatically reset or populate tasks daily without manual intervention.
- **📊 Analytics Dashboard**: Visualize your progress and 100-day trends through interactive charts using Recharts.
- **🌙 Dark Theme UI**: A sleek, modern user interface built with Tailwind CSS, fully supporting dark mode.

## Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Authentication**: Clerk React SDK
- **Data Visualization**: Recharts, React Calendar Heatmap
- **Icons**: Lucide React

### Backend
- **Server**: Node.js & Express
- **Database**: MongoDB & Mongoose
- **Authentication**: Clerk Node SDK
- **Utilities**: CORS, dotenv

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB account/cluster
- Clerk account

### Installation

1. **Clone the repository** (if applicable) and navigate to the project root.

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```
   Start the backend server (dev mode):
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory with your Clerk publishable key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_URL=http://localhost:5000
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/frontend` - React Vite application containing components, pages, and UI logic.
- `/backend` - Express REST API handling database interactions, routes, and Clerk webhook/auth verification.

## License

This project is licensed under the ISC License.
