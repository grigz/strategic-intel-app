import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processIntelItem } from "@/lib/inngest/functions/process-intel";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processIntelItem],
});
