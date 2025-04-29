# PollSystem+ – README

---

## &#x20;Team Information



> &#x20;**Action item:** Fill your names & IDs before submission.
Name: Paz Blutman, ID: 206000119
Name: Guy Hanan, ID: 208748376
Name: Noa Halali, ID: 211486725
Name: Daniel Yavnik, ID: 323818856
פש

---

## &#x20;Design Assumptions

1. **Runtime**: Node.js ≥ v20, Express ≥ 4.18.
2. **Stateless clients & in‑memory storage** – `PollsMemoryManagement` keeps data in a `Map`; restarting the server loses all polls & users.
3. **No authentication / authorization** – anyone may act as any username. The *creator* restriction is enforced by comparing the provided `username` to the stored `creator` field.
4. **Identifiers**: Poll IDs are UUID v4 strings generated via the `uuid` npm package.
5. **Options by index**: Votes reference an option’s **array index** (`0 … n‑1`), not its text value.
6. **Vote integrity**: Each user may vote **once per poll**; tracked in a private `Set` inside the `Poll` entity.
7. **Validation & errors**: Input is validated server‑side. Errors return JSON `{ "error": "…" }` with an appropriate HTTP status code.
8. **Formatting**: All requests & responses use `application/json`.

---

## &#x20;API Summary

- **Base URL**: `http://localhost:3000/api`
- **Content‑Type**: `application/json`
- **Authentication**: *None required*

### Endpoint Matrix

| Method   | Path                        | Description                  | Success Code  |
| -------- | --------------------------- | ---------------------------- | ------------- |
| `POST`   | `/users`                    | Create a new user            | `201`         |
| `GET`    | `/polls`                    | List *all* polls             | `200`         |
| `GET`    | `/polls/creator?username=…` | Polls created by user        | `200` / `404` |
| `GET`    | `/polls/voter?username=…`   | Polls a user voted in        | `200` / `404` |
| `POST`   | `/polls`                    | Create a poll                | `201`         |
| `POST`   | `/polls/:id/vote`           | Vote on a poll               | `200`         |
| `DELETE` | `/polls/:id`                | Delete a poll (creator only) | `200`         |

##  Request / Response Examples

### 1. Create User

```bash
POST /api/users
{
  "username": "alice"
}
```

```json
201 Created
{
  "message": "User \"alice\" created successfully."
}
```

### 2. Create Poll

```bash
POST /api/polls
{
  "question": "Best JS runtime?",
  "options": ["Node", "Deno", "Bun"],
  "username": "alice"
}
```

```json
201 Created
{
  "message": "Poll \"7f83‑…\" created successfully."
}
```

### 3. Vote

```bash
POST /api/polls/7f83…/vote
{
  "option": 2,
  "username": "bob"
}
```

```json
200 OK
{
  "message": "Vote recorded for option \"2\" by user \"bob\"."
}
```

### 4. Error (duplicate vote)

```json
400 Bad Request
{
  "error": "User \"bob\" has already voted in this poll."
}
```

---

## &#x20;Interface Contracts

### Entities

| Class  | Signature                                                        | Description                                               |
| ------ | ---------------------------------------------------------------- | --------------------------------------------------------- |
| `Poll` | `new Poll(question: string, options: string[], creator: string)` | Domain object, holds immutable UUID, tracks votes         |
|        | `vote(optionIndex: number, username: string): void`              | Registers one vote; throws on invalid input / repeat vote |
| `User` | `new User(userName: string)`                                     | Value object for a user identifier                        |

### Business‑Logic (Service) Layer

| Service        | Method                          | Params → Return                     | Notes                                        |
| -------------- | ------------------------------- | ----------------------------------- | -------------------------------------------- |
| `PollsManager` | `createPoll(q, opts, creator)`  | `(string, string[], string) → Poll` | Delegates to storage, returns created object |
|                | `getPolls()`                    | `() → Poll[]`                       | All polls                                    |
|                | `vote(id, optionIdx, username)` | `(string, number, string) → void`   | Validation + storage call                    |
|                | `deletePoll(id, username)`      | `(string, string) → void`           | Only if `creator === username`               |
|                | `listPollsByCreator(user)`      | `(string) → Poll[]`                 |                                              |
|                | `listPollsVotedByUser(user)`    | `(string) → Poll[]`                 |                                              |
| `UserManager`  | `createUser(name)`              | `(string) → void`                   | Adds to Set; duplicates error                |
|                | `userExists(name)`              | `(string) → boolean`                |                                              |
|                | `getAllUsers()`                 | `() → string[]`                     |                                              |

### Storage Layer (`PollsMemoryManagement`)

| Method                          | Params → Return                   |
| ------------------------------- | --------------------------------- |
| `addPoll(poll)`                 | `(Poll) → void`                   |
| `getPoll(id)`                   | `(string) → Poll \| null`         |
| `votePoll(id, optionIdx, user)` | `(string, number, string) → void` |
| `getAllPolls()`                 | `() → Poll[]`                     |
| `deletePoll(id)`                | `(string) → void`                 |

---

## &#x20;Team Retrospective

| What went well                                               |  What could be improved                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| Good teamwork, effective communication, and collaboration    | More frequent fixed meetings to define and review milestones  |
| Well-structured branch division enabling parallel work       | Less reliance on AI-generated code, with deeper manual review |
| Every team member contributed insights about working with AI |                                                               |

### Reflections on Collaboration

- Adopted **GitHub Flow** – feature branches & peer reviews.
- Pair‑programming on complex parts (validation, UUID workflow) reduced defects.
- Used Discord for quick questions.

### Lessons Learned on AI Usage

1. **Code generation vs understanding** – AI accelerated boilerplate (e.g., route scaffolding) but still required *manual* validation & refactor for readability.
2. ChatGPT was most helpful for *edge‑case tests* and *error‑message wording*.
3. Blindly trusting AI suggestions led to subtle bug  always run  tests.



---

##

