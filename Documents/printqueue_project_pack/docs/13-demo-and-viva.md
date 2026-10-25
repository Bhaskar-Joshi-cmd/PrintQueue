# 13 — Demo Script and Viva Preparation

## Suggested 4–6 minute demonstration

1. **Introduce the problem (30 seconds):** Students often revisit a print shop to ask whether their job is ready. PrintQueue makes requests and statuses visible.
2. **Register/log in as a student (30 seconds):** Explain that registration creates a student role and password is hashed before storage.
3. **Create a job (45 seconds):** Submit an assignment, page count, copies, print mode and sides.
4. **Show the dashboard (30 seconds):** Explain how React fetches job data from the Express API.
5. **Show the staff workflow (60 seconds):** Sign in with a staff account. Move a job from queued to printing, ready for pickup, and completed.
6. **Show security behaviour (30 seconds):** Explain that a student cannot call staff endpoints or edit another student's job. Optionally demonstrate a 403 using Postman.
7. **Show database (30 seconds):** Open Supabase Table Editor and explain `users`, `print_jobs`, primary key and foreign key.
8. **Explain deployment (30 seconds):** Frontend and Express API are separate Vercel projects; Supabase hosts PostgreSQL.

## Likely viva questions and simple answers

**1. What is PrintQueue?**  
A full-stack website that lets students submit print requests and track their status while shop staff manage a shared queue.

**2. What is full-stack development?**  
Building the frontend users see, the backend that applies business rules, and the database that stores persistent information.

**3. Why React?**  
React lets us build the UI from reusable components and update it when state or fetched data changes.

**4. What are props and state?**  
Props pass data from a parent component to a child. State stores data that can change and cause the component to re-render.

**5. What does `useEffect` do here?**  
It can load jobs or the current user when a page is opened or when a relevant dependency changes.

**6. What is a REST API?**  
A set of HTTP endpoints used by the frontend to request or change server data. For example, POST creates a print job and GET lists jobs.

**7. Why use Express?**  
It provides routes and middleware for the API, input validation, authentication and permission checks.

**8. What is CRUD?**  
Create, Read, Update and Delete. PrintQueue creates jobs, reads job lists/details, updates queued job details/status, and permits cancellation according to the rules.

**9. What is middleware?**  
A function that runs during a request before the final route handler, for example verifying a JWT or allowing only staff users.

**10. Why bcrypt?**  
It hashes passwords with a salt so the application does not store the original password.

**11. What is JWT?**  
A signed token that the client sends with protected requests. The server verifies it to identify the user. It must have an expiry and be kept secret from other users.

**12. What is a primary key?**  
A column or set of columns that uniquely identifies a row. Here, each user and print job has a UUID primary key.

**13. What is a foreign key?**  
A database rule linking one table to another. `print_jobs.user_id` references `users.id` to show who owns a job.

**14. Why Supabase?**  
It provides hosted PostgreSQL and a JavaScript client so the project can use a managed database without maintaining a database server.

**15. Why Vercel?**  
It deploys the frontend and can run the Express application as a serverless function, with environment variables managed in project settings.

**16. Is Supabase PostgreSQL the same as MongoDB?**  
No. PostgreSQL is a relational SQL database; MongoDB is a document database. This project deliberately uses PostgreSQL, so it does not demonstrate Mongoose-specific operations.

**17. Why not let React talk directly to the database with the secret key?**  
Anything sent to the browser can be inspected. The Supabase secret key has elevated privileges, so only the server may hold it.

**18. How do you prevent students from changing other people's jobs?**  
The API gets the current user ID from the verified token and checks ownership before returning or changing a record. Hiding buttons in React is not enough.

**19. How is waiting time calculated?**  
For a queued job, the app counts earlier queued jobs and multiplies by an assumed five minutes. It is only an estimate.

**20. What would you improve in a future version?**  
After the core workflow is stable, possible improvements include email notifications, more accurate waiting estimates, a better session design, or a shop dashboard report. These are not required for version 1.

## Important viva honesty
Do not claim the app physically sends files to a printer, sends real-time notifications, or uses MongoDB. Those functions are outside the defined scope.
