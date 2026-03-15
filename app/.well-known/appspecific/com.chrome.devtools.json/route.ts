export async function GET() {
  return new Response("{}", {
    status: 200,
    headers: {
      "content-type": "application/json"
    }
  });
}
