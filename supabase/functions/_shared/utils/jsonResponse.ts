import { corsHeaders } from '../cors.ts'

export default function jsonResponse(body: object, status: number): Response {
    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    });
  }