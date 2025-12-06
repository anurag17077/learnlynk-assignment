# LearnLynk CRM – Technical Assignment

This project is my submission for the LearnLynk technical test.  
It implements a minimal CRM tasks dashboard using **Next.js**, **React Query**, and **Supabase**.

## 🚀 Features Implemented

### ✅ Task Dashboard

- Displays all **tasks due today**
- Uses Supabase as the backend
- Uses React Query for data fetching and caching
- Allows marking tasks as **completed**
- Automatic UI updates without page refresh

### ✅ Database Design (Supabase)

- Tables included:
  - `teams`
  - `user_teams`
  - `leads`
  - `applications`
  - `tasks`
- Basic row-level security (RLS) enabled
- Insert and update logic for tasks
- Indexes added for performance

### ✅ UI/UX Improvements

- Clean responsive layout built with **Tailwind CSS v4**
- Colored status badges
- Styled action buttons
- Hover effects and spacing for improved readability

### 🧪 Sample Data

5 sample tasks were inserted for demonstration.  
They appear under the “Tasks Due Today” dashboard page.

---

## 🏗️ Tech Stack

- **Next.js (App Router)**
- **React Query**
- **Supabase Database**
- **Supabase Auth (basic setup)**
- **TypeScript**

## ▶️ Running the Project

### 1. Install dependencies

```bash
cd frontend
npm install
```

cd frontend
npm install

### 2. Setup environment file

Create `.env.local`:

NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

### 3. Start the development server

npm run dev

---

## 📝 Assumptions & Notes

1. **Edge Function `create-task`**

   - Implemented as a bonus but not required for core assignment
   - Deployment issues on Windows CLI were documented
   - Function code is included but not required to run UI

2. **Tasks Page**

   - "Today’s Tasks" filters by comparing `due_at` to current date
   - Marking a task as completed updates Supabase instantly using React Query

3. **Sample Data**

   - Five valid tasks were inserted with proper foreign keys
   - Ensures UI loads properly for demonstration

4. **Architecture**
   - Code is modular
   - Supabase client stored in `/lib/supabase.ts`
   - UI separated from logic

---

## Section 5 — Stripe Checkout Integration (Point-wise Explanation)

- I would create an API route that calls `stripe.checkout.sessions.create()` with line items, success/cancel URLs, and the `application_id` stored in metadata.

- When the user clicks “Pay”, the frontend requests this API route, receives the session URL, and redirects the user to the Stripe Checkout page.

- After payment, Stripe sends a `checkout.session.completed` event to a secure webhook endpoint in my backend.

- The webhook handler verifies the Stripe signature to ensure the event is authentic.

- The handler then stores a new record in a `payment_request` table, including the `application_id`, amount, `session_id`, and payment status.

- Using session metadata, the system updates the related application's status in Supabase (e.g., from `"pending_payment"` → `"paid"`).

- A new timeline entry is also inserted to record that the payment was successfully received.

- The frontend uses React Query or Supabase real-time updates to refresh the application view without requiring a page reload.

---

## 📦 Submission

This repository (or zipped folder) contains:

- Complete working frontend
- Database schema
- A clean, readable codebase
- A simple and scalable architecture
