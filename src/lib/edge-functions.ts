const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export async function invokeEdgeFunction<TReq, TRes>(name: string, payload: TReq): Promise<TRes> {
  const resp = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!resp.ok) throw new Error(`Erreur lors de l'appel à ${name}`)
  return resp.json() as Promise<TRes>
}
