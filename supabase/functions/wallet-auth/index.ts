// supabase/functions/wallet-auth/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import nacl from "https://esm.sh/tweetnacl@1.0.3"
import { decode as decodeBase58 } from "https://esm.sh/bs58@5.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { publicKey, signature, message, nonce } = await req.json()

    // 1. Verify nonce
    const { data: nonceData, error: nonceError } = await supabaseAdmin
      .from("auth_nonces")
      .select()
      .eq("nonce", nonce)
      .eq("wallet", publicKey)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (nonceError || !nonceData) {
      return new Response(JSON.stringify({ error: "Invalid or expired nonce" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Verify signature
    const isValid = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      new Uint8Array(signature),
      decodeBase58(publicKey)
    )

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Delete used nonce
    await supabaseAdmin.from("auth_nonces").delete().eq("nonce", nonce)

    // 4. Create or get user
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select()
      .eq("wallet", publicKey)
      .single()

    let userId: string
    if (profileError || !existingProfile) {
      const email = `${publicKey.toLowerCase()}@crowdradar.wallet`
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        user_metadata: { wallet: publicKey },
        email_confirm: true,
      })
      
      if (createError) throw createError
      userId = newUser.user.id
      
      const { error: insertError } = await supabaseAdmin.from("profiles").insert({
        id: userId,
        wallet: publicKey
      })
      if (insertError) throw insertError
    } else {
      userId = existingProfile.id
    }

    // 5. Create session
    const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: userId
    })
    
    if (sessionError) throw sessionError

    return new Response(JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
