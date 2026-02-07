import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "strategic-intel-app",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
