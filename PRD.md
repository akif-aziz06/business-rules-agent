# PRODUCT REQUIREMENT DOCUMENT

## Purpose
The application is an AI-driven service designed to safely convert plain English, natural language business requirements into optimized, standard, server-side ServiceNow Business Rules. Its primary purpose is to automate the backend configuration process while rigorously enforcing system safety—preventing critical platform errors such as halted database writes, recursive data loops, transaction thread exhaustion, or systemwide performance degradation. 

## User and Roles
* **Requirement Submitter (e.g., Business Analyst / Process Owner):** Inputs unstructured, natural language operational statements outlining backend processing rules.
* **ServiceNow Administrator / Developer:** Governs the platform, reviews AI-suggested optimizations, and manages the overall system architecture.
* **AI Agent (System Role):** The core intelligence that parses inputs, maps table contexts, assigns execution timing, evaluates existing logic, performs conflict sweeps, and deploys the final configuration records.

## Data Model
* **Core Application Tables:**
  * Target Tables: Dynamically identified based on user input (e.g., `incident` table for incident closure requests, `change_request` table for change approvals).
  * Child Tables: Task tables queried via relational links (e.g., child tasks matching a parent incident link).
* **System/Registry Tables:**
  * `sys_script`: The primary table where the final Business Rule record is created and stored.
* **Key Fields (populated in `sys_script`):**
  * Name
  * Table (Target Table definition)
  * When (Execution Timing: Before, After, Async)
  * Active flag
  * Condition schema fields
  * Script (Syntactically correct JavaScript handlers)
* **Relationships:** Must understand database schemas to establish parent-child object links and map shorthand expressions to precise physical database schemas.

## Business Rules (App Enforcements)
The application itself enforces the following internal logic and validation matrix:
* **Requirement Parsing Rule:** Must successfully categorize input into three functional parameters: Trigger event (insert/update/delete/query), Business condition filters, and Desired automation action.
* **Execution Timing Rule:** Must map requirements to optimal hook points:
  * *Before:* Data validation or submission abort operations.
  * *After:* Notifications, logging, or independent record tracking.
  * *Async:* Complex background processes or third-party integrations.
* **Conflict & Duplication Rule:** Must cross-check existing configurations (active Business Rules, Flow Designer structures, Script Includes, Client UI Policies, Data Policies) to prevent overlap and functional deadlocks.
* **Script Performance Rule:** Strictly forbids the generation of `current.update()` calls inside 'Before' or 'After' scripts to prevent recursive execution loops. 
* **Condition Optimization Rule:** Must utilize standard platform condition builder fields (populating condition text metadata) instead of dumping massive unoptimized JavaScript into the main script body.
* **Architectural Optimization Rule:** Must actively intercept inefficient user requests (e.g., using an 'After' hook to modify the same record), warn the user of platform risks, and recommend best practices (e.g., converting to a 'Before' rule to reduce database strain).

## Integrations
* **Internal Platform Integrations (ServiceNow Context):**
  * Sweeps and reads from native ServiceNow configuration layers (Flow Designer, UI Policies, Client Scripts, Data Policies, Script Includes) to perform Conflict Detection (Step 7).
  * Direct insert operations into the `sys_script` table to generate the final record (Step 9).
* **Logging and Error Handling:**
  * Generates clean script handlers that include explicit exception logging parameters to track execution and errors seamlessly within the platform.
* **External Integrations:**
  * Designed to create Async Business Rules specifically configured for handling complex third-party system integrations without blocking the main user interface thread.
