import { createApp, type AppRole } from "./app";

const rawPort = process.env["PORT"] ?? "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const role: AppRole = process.env["APP_ROLE"] === "admin" ? "admin" : "public";
const app = createApp(role);

app.listen(port, () => {
  console.log(`Server (${role}) listening on port ${port}`);
});
