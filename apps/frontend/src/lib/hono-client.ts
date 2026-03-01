import { hcWithType } from '@playgrid/api-client';

const apiBase = import.meta.env.DEV ? 'http://localhost:8787' : '';

const client = hcWithType(apiBase);

export default client;
