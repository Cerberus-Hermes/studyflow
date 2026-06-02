import { ensureAdminUser } from '../utils/db'

export default defineNitroPlugin(async () => {
  await ensureAdminUser()
})
