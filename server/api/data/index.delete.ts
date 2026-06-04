import { clearCompletedItems } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { supabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const userId = session.userId

  // Delete all user data
  const tables = ['tasks', 'goals', 'study_plans', 'deadlines', 'calendar_entries', 'completed_items']
  for (const table of tables) {
    const { error } = await supabase!.from(table).delete().eq('user_id', userId)
    if (error) throw new Error(`Failed to delete from ${table}: ${error.message}`)
  }

  return { success: true }
})
