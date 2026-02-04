# CLAUDE.md

## General

### Main Rules

- In all interactions and commit messages, be extremely concise and sacrifice
  grammar for the sake of concision.

### Grammar & Style

- When writing markdown text follow the CommonMark lint syntax.

## Git

### Commit Messages

- Each commit title should start with one of the following:
  - feat:
  - fix:
  - refactor:
  - chore:
  - docs:
- Do not add references to Claude in the commit messages

## Planning

- At the end of each plan, give me a list of unresolved questions to answer,
  if any. Make the questions extremely concise. Sacrifice grammar for the sake
  of concision.

## Project Overview

Multi-app platform ("Soup's Kitchen") hosting small tools as well as my portfolio.

Current apps: Habit Tracker (/habits), Blog (/work/experience), CV (/work/cv), Settings (/settings).

### Layout Components

- **Navbar**: Fixed top, centered logo + "Soup's Kitchen" title, dynamic subtitle, hamburger (left), profile icon (right)
- **Sidebar**: Slide-in from left, app navigation, transparent backdrop blurs main content
- **Footer**: Minimal, centered
