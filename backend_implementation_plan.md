# Frontend-Backend Integration Plan: Chat UI

This plan outlines the steps to wire up the static React frontend (`chat.tsx`) to the newly built FastAPI backend.

## Overview
Currently, the chat interface uses hardcoded arrays for threads and messages. We will replace this with React state and connect it to a new backend endpoint. Since the full LangGraph/LLM pipeline is on the roadmap but not yet built, the backend will return a simulated AI response for now to establish the full-stack communication.

## Proposed Changes

### Backend (FastAPI)
We need to create the actual endpoints that the frontend will call.
#### [NEW] `backend/routers/chat.py`
- Create an API router with a `POST /chat/message` endpoint.
- The endpoint will:
  1. Receive the user's message.
  2. Save the user's message to the PostgreSQL database via `MessageService`.
  3. Generate a mock AI response (placeholder until GPT-4o is integrated).
  4. Save the AI response to the database.
  5. Return the new messages to the frontend.

#### [MODIFY] `backend/main.py`
- Include the new `chat` router.

### Frontend (React / Vite)
We need to update the chat page to send and receive real data.
#### [MODIFY] `src/routes/chat.tsx`
- Remove the hardcoded `messages` array.
- Introduce `useState` to manage the list of messages and the current input text.
- Implement a `handleSend` function that makes a `fetch` `POST` request to `http://localhost:8000/chat/message`.
- Update the UI to render messages from state and clear the input on successful send.

## Open Questions

> [!IMPORTANT]
> Please review before we proceed:

1. **API Client:** Currently, I plan to use standard `fetch` for simplicity. Do you want to use a specific library like `axios`, or standard `fetch` with `@tanstack/react-query` mutations?
2. **User Identity:** The backend requires a `user_id` to save messages. For now, I will hardcode a dummy user ID (e.g., `user_id=1`) in the requests until we implement actual Authentication. Does that work for you?
