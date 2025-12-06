// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { application_id, task_type, due_at } = body;

  const valid = ["call", "email", "review"];
  if (!application_id || !valid.includes(task_type) || !due_at) {
    return new Response(JSON.stringify({ error: "Invalid input fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dueDate = new Date(due_at);
  if (dueDate <= new Date()) {
    return new Response(
      JSON.stringify({ error: "due_at must be a future date" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      related_id: application_id,
      type: task_type,
      due_at,
      title: `Auto-generated ${task_type} task`,
      tenant_id: crypto.randomUUID(),
    })
    .select("id")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, task_id: data.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
