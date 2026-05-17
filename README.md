# sensor-monitor

A web application that acts as the server-side companion for a microcontroller HTTP client. The microcontroller's HTTP server sends JSON payloads to the appropriate route. Next.js API routes validate and write the data to MongoDB. The frontend polls those same routes at a user-controlled frequency and renders the current value plus historical charts.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
git clone https://github.com/massylamarni/sensor-monitor.git
cd sensor-monitor
npm install
```

### Configuration

Create a `.env.local` file at the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
```

### Running locally

```bash
npm run dev
```

---

## API Routes

### `POST /api/post/ping`

```json
{ "ping": "message" }
```

### `POST /api/post/temperature` · `POST /api/post/gas`

```json
{ "data": "value" }
```

### `POST /api/post/movement`

```json
{ "data": "0 || 1" }
```

### `POST /api/post/rfid`

```json
{ "data": { "uid": "uid", "is_valid": "1 || 0" } }
```

### `GET /api/get/{temperature|gas|movement|rfid}`

Accepts optional query parameters to filter by time range:

```
?timeStart=<timestamp>&timeEnd=<timestamp>
```

---
