import catalog from '../../server/catalog.json';
import { createJobHandler } from '../../server/job-service.mjs';

const handleJob = createJobHandler(catalog);
export const onRequest = ({ request, env }) => handleJob(request, env);
