import { createAdminClient } from '@insforge/sdk';

export const insforgeAdmin = createAdminClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || process.env.INSFORGE_URL || '',
  apiKey: process.env.INSFORGE_API_KEY || '',
});
