// supabase/functions/auto-distribute/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async (req) => {
  try {
    // 1. Fetch expired active sayembaras
    const { data: expired, error: expiredError } = await supabaseAdmin
      .from('sayembaras')
      .select('*')
      .eq('status', 'active')
      .lt('deadline', new Date().toISOString())

    if (expiredError) throw expiredError
    if (!expired || expired.length === 0) {
      return new Response(JSON.stringify({ message: "No expired sayembaras to process" }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    const results = []

    for (const s of expired) {
      // 2. Fetch confirmed reports for this sayembara
      const { data: confirmations, error: confirmError } = await supabaseAdmin
        .from('sayembara_confirmations')
        .select('report_id, reports(reporter_wallet)')
        .eq('sayembara_id', s.id)

      if (confirmError) {
        console.error(`Error fetching confirmations for ${s.id}:`, confirmError)
        continue
      }

      const wallets = confirmations.map((c: any) => c.reports.reporter_wallet)

      // 3. Trigger Solana distribution (via server-side wallet or program interaction)
      // This part would typically call a backend service that has the authority to sign
      // or use a pre-signed transaction if applicable.
      // For now, we'll mark as 'distributed' and log.
      console.log(`Distributing rewards for sayembara ${s.id} to ${wallets.length} wallets.`)

      // Mocking on-chain distribution success
      const mockTxHash = '7d2x...9k2p'

      // 4. Update sayembara status
      const { error: updateError } = await supabaseAdmin
        .from('sayembaras')
        .update({ 
          status: 'distributed',
          distribute_tx: mockTxHash,
          reward_per_report: wallets.length > 0 ? (s.total_deposit / wallets.length) : 0
        })
        .eq('id', s.id)

      if (updateError) {
        console.error(`Error updating sayembara ${s.id}:`, updateError)
        continue
      }

      results.push({ id: s.id, wallets_count: wallets.length, tx: mockTxHash })
    }

    return new Response(JSON.stringify({ processed: results }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
