// Trigger.dev tasks run on Trigger.dev cloud workers.
// tasks.trigger() in server actions calls the Trigger.dev API directly
// using TRIGGER_SECRET_KEY — no webhook handler required here.
export async function GET() {
  return new Response("ok", { status: 200 });
}
