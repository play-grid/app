import { hcWithType } from '@guess-logo/api-client';
import { env } from '@/env';

const client = hcWithType(env.VITE_API_URL);

export default client;
