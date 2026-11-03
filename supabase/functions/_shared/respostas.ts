import { corsHeaders } from "./cors.ts";

export function responder(status: number, dados: unknown): Response {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}