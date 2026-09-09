# Soup's Kitchen

A personal platform of small, independent apps (habit tracking, a knowledge
base, a Swiss departure board, a question card game, file resources) plus a
portfolio. One user base and one backend; each app has its own vocabulary,
grouped below.

## Language

### Platform

**App**:
One self-contained tool reachable under `/apps/<name>`, with its own navbar
title, icon and installable manifest.
_Avoid_: module, feature, tool

**Resource**:
An uploaded file stored once and embeddable from any app by its id.
_Avoid_: attachment, upload, asset, media

### Access

**Account**:
A person who can sign in. Accounts are created by an Admin; there is no
self-signup.
_Avoid_: user (ambiguous with anonymous visitors), member

**Visitor**:
Anyone using the site without signing in. Visitors can read the Knowledge
Base and nothing else.
_Avoid_: anon, guest, public user

**Role**:
The permission level an Account holds on one app's data: Viewer, Manager or
Admin. Roles are granted per app, not globally.
_Avoid_: permission, scope, claim

**Viewer**:
The Role that may read but never write.
_Avoid_: reader, read-only user

**Manager**:
The Role that may create, edit and delete within its app. Every Admin is also
a Manager.
_Avoid_: editor, writer, owner

**Admin**:
The highest Role. A Global Admin holds it across every app.
_Avoid_: superuser, root

### Habits

**Action**:
A repeatable activity worth tracking (e.g. "100 Squats", "Learn: Go"), with
an Action Type and a Level.
_Avoid_: task, exercise, activity, habit type

**Action Type**:
The broad category of an Action: Sports, Bad Habits or Learning. The Feed and
Score Graph show one Action Type at a time.
_Avoid_: category, kind

**Level**:
The weight of an Action, summed into a Score. Harder Actions have a higher
Level.
_Avoid_: points, difficulty, weight

**Habit**:
One logged completion of an Action at a point in time, with an optional Note.
_Avoid_: entry, log, record, activity, check-in

**Note**:
Free text attached to a Habit, describing what was actually done.
_Avoid_: comment, description

**Score**:
The sum of the Levels of all Habits completed on one day for one Action Type.
_Avoid_: total, points

**Feed**:
The reverse-chronological list of Habits for one Action Type.
_Avoid_: history, timeline, list

**Score Graph**:
The calendar heat-map of daily Scores; selecting a day filters the Feed to
that day.
_Avoid_: heatmap, chart, calendar

**Ride**:
A cycling activity imported from Strava. Every Ride yields a "Cycling" Habit.
_Avoid_: activity (Strava's word), workout, session

### Knowledge Base

**Entry**:
One piece of knowledge, framed as a Question with a Summary and an optional
Detail.
_Avoid_: note, article, post, page, card

**Question**:
The title of an Entry, always phrased as a question.
_Avoid_: title, heading

**Summary**:
The short answer to an Entry's Question, shown in the list.
_Avoid_: excerpt, abstract, description

**Detail**:
The long-form body of an Entry, in Markdown, optionally embedding Resources.
_Avoid_: body, content, article

**Tag**:
A named label attached to Entries. Every Tag is either a Topic or a Concept.
_Avoid_: label, keyword, category

**Topic**:
A broad Tag that groups Entries and carries a colour (e.g. "Databases").
_Avoid_: area, domain, subject

**Concept**:
A narrow Tag naming a specific idea inside a Topic (e.g. "DB Indexing").
_Avoid_: keyword, term, sub-topic

### Fragespiel

**Prompt**:
One playable question of the game, available in German and English, with an
Intensity, a Category and an audience flag for Couples.
_Avoid_: question (clashes with the Knowledge Base), card (that is its
on-screen form)

**Group**:
Who is playing: Friends or Couple. Determines which Prompts are eligible.
_Avoid_: mode, audience, player type

**Intensity**:
How personal a Prompt is, from 1 (light) to 3 (deep).
_Avoid_: difficulty, level, depth

**Category**:
The theme a Prompt belongs to; a Round mixes Categories in random order.
_Avoid_: topic (Knowledge Base term), tag

**Round**:
A fixed-size draw of Prompts (16, 32 or 64) balanced across Intensities,
played once from start to finish.
_Avoid_: game, session, set

**Deck**:
The ordered stack of Cards for the current Round.
_Avoid_: pile, queue, list

**Card**:
A Prompt as shown on screen; swiped away once answered.
_Avoid_: slide, tile

### Fahrplan

**Station**:
A public-transport stop in Switzerland, found by name.
_Avoid_: stop, halt, location

**Departure Board**:
The live list of the next Departures from one Station.
_Avoid_: timetable, schedule, stationboard

**Departure**:
One vehicle leaving a Station: line, destination, time and delay.
_Avoid_: connection, trip, journey

**Transport Type**:
The vehicle class of a Departure (train, tram, bus, boat, ...), used as a
filter.
_Avoid_: mode, vehicle, category
