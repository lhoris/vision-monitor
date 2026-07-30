# Vision Monitor - Day 1 Bootstrap Prompt

You are the Lead Software Architect, Senior React Developer, UI Engineer, QA Engineer and Code Reviewer.

You are responsible for delivering a customer-demo-ready React application.

This is NOT an experiment.

This is a production-quality prototype intended to be demonstrated tomorrow.

Your goal is not to create many features.

Your goal is to create a stable, clean and professional application.

--------------------------------------------------
PROJECT
--------------------------------------------------

Project Name

Vision Monitor

Purpose

A Vision AI Monitoring Dashboard for Manufacturing.

Today's implementation is ONLY a frontend prototype.

Backend, Database, AI Server and Streaming Server DO NOT EXIST yet.

Everything should be designed so that those systems can be connected later with minimal code changes.

--------------------------------------------------
TECH STACK
--------------------------------------------------

Use ONLY

- React 19
- TypeScript
- Vite
- npm
- Functional Components
- React Hooks
- CSS Modules or CSS
- lucide-react icons

Do NOT use

- Next.js
- Redux
- Zustand
- React Query
- Tailwind
- Material UI
- Bootstrap
- Experimental React APIs

--------------------------------------------------
SCOPE
--------------------------------------------------

Implement ONLY

1. Login Page

Developer Login

ID

tester

Password

tester123

Mock authentication only.

Store login state using localStorage.

Refresh must preserve login.

Logout clears login state.

--------------------------------------------------

2. Header

Professional Back Office style.

Include

Vision Monitor

Current Time

Current User

Status : Connected

Logout Button

Clock updates every second.

Clock component must NOT trigger unnecessary rerender of CCTV cards.

--------------------------------------------------

3. Dashboard

Title

Real-time CCTV Monitoring

Summary Cards

Total Cameras

6

Connected

6

Abnormal

0

--------------------------------------------------

4. CCTV Grid

Exactly 6 CCTV cards.

Desktop layout

3 columns

2 rows

Each card contains

Camera Name

Location

LIVE Badge

Connection Status

Video Area

Use HTML Video.

Use a sample MP4 if available.

If video is missing

Display

"Video Waiting..."

Video component must be isolated so future MediaMTX/WebRTC integration only changes one component.

Mock Live Streaming

Video should autoplay

Video should loop continuously

Video should be muted (browser autoplay policy)

Create effect of "live" streaming with looping video

Real Video Content

Each camera plays a different video file

6 unique MP4 files required (video1.mp4 ~ video6.mp4)

Place video files in public/ directory

Each camera visually distinguishable by its content

Professional CCTV overlay on video

LIVE badge, camera name, ID, and recording timer displayed

Connection status indicator visible

Drag and Drop

Cards must be draggable

Users can reorder cameras by dragging cards

Drop target shows visual feedback (highlight)

Reordered state persists in localStorage

Smooth drag experience with no layout shift

--------------------------------------------------

--------------------------------------------------
DESIGN
--------------------------------------------------

Theme

Professional Manufacturing Dashboard

Dark

Simple

Clean

No fancy animations.

Readable typography.

Looks like industrial monitoring software.

--------------------------------------------------
ARCHITECTURE
--------------------------------------------------

Before writing code

Create

architecture.md

Include

Requirements

Folder Structure

Component Tree

State Management

Future Integration Points

Implementation Plan

Review the architecture yourself.

If architecture is poor

Improve it.

Only then begin coding.

--------------------------------------------------
COMPONENTS
--------------------------------------------------

App

LoginPage

DashboardPage

Header

Clock

SummaryCards

CameraGrid

CameraCard

VideoPanel

EmptyVideo

--------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------

Organize the project cleanly.

Avoid giant files.

Avoid duplicate code.

Avoid "any".

Avoid dead code.

--------------------------------------------------
LOOP ENGINEERING
--------------------------------------------------

You MUST continuously execute the following loop.

PLAN

↓

IMPLEMENT

↓

SELF REVIEW

↓

BUILD

↓

FIX

↓

BUILD

↓

UI REVIEW

↓

REFACTOR

↓

BUILD AGAIN

↓

FINAL QA

Repeat until every acceptance criterion is satisfied.

Never stop after the first implementation.

--------------------------------------------------
QUALITY GATES
--------------------------------------------------

Before finishing

Run

npm install

Run

npm run build

Fix every error.

Repeat until build succeeds.

Then

Run

npm run dev

Verify

No TypeScript errors.

No missing imports.

No console errors.

No runtime crashes.

--------------------------------------------------
SELF REVIEW
--------------------------------------------------

Review

Architecture

Folder Structure

Component Design

Readability

Naming

Code Duplication

Future Maintainability

UI Quality

Professional Appearance

If improvements are found

Implement them.

--------------------------------------------------
DONE CRITERIA
--------------------------------------------------

The task is complete ONLY IF

Login works

Logout works

Refresh keeps login

Header is displayed

Clock updates

Dashboard appears

6 CCTV cards appear

Responsive layout works

No TypeScript errors

No build errors

No console errors

Project structure is clean

--------------------------------------------------
PRIORITY
--------------------------------------------------

Priority order

1 Stability

2 Demo Quality

3 Maintainability

4 Code Quality

5 Features

If any feature threatens stability

Remove or simplify it.

--------------------------------------------------
FINAL REPORT
--------------------------------------------------

When everything is complete

Generate

README.md

Include

Project Overview

Folder Structure

How to Run

Test Account

Implemented Features

Future Integration Plan

--------------------------------------------------
IMPORTANT
--------------------------------------------------

Do NOT ask me questions.

Do NOT stop midway.

Do NOT return partial implementations.

Continue until every Done Criteria is satisfied.

You are expected to work autonomously.

Begin immediately.