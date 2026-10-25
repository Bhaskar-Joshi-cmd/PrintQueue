# 01 — Project Brief

## Project name
**PrintQueue — Campus Printing Queue & Job Tracker**

## Problem statement
During busy submission periods, students may have to visit a campus print shop just to place a print request, ask about its progress, or discover whether it is ready. The shop operator may also need to handle requests and explain the queue repeatedly. PrintQueue provides one small place to submit a request and follow its status.

## Proposed solution
A responsive website with two user roles:

- **Student:** submits a job request, sees their own jobs and their status, estimates the waiting time, and cancels a job while it is still queued.
- **Shop staff:** sees the shared queue and updates a job through the printing workflow.

## Value
- Reduces repeated status enquiries.
- Makes the request queue visible and organised.
- Gives students a simple way to check status before walking to the shop.
- Demonstrates the main building blocks of a full-stack web application.

## Target users
1. College students who use the campus printing shop.
2. One or more shop staff members responsible for processing jobs.

## Primary workflow
1. Student registers and logs in.
2. Student submits job details: document label, pages, copies, print mode, sides, optional note.
3. A job is created with status `queued`.
4. Staff views queued jobs in oldest-first order.
5. Staff changes status: `queued` → `printing` → `ready_for_pickup` → `completed`.
6. Student sees the updated status on their dashboard.

## Success criteria
- A student can register, log in, submit a valid job, and see it in their own list.
- A student cannot view or edit another student's job.
- Staff can see the queue and move a job through the allowed status sequence.
- Invalid data receives a useful error message rather than silently failing.
- The app works on a desktop and a mobile-width screen.
- The deployed frontend can communicate with the deployed API and Supabase database.
- The student can explain the main components and one complete request from frontend to database.

## Project level
Medium-size academic mini project. The core workflow should be finished before any optional styling or extras are started.
