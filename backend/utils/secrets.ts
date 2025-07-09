import { SecretManagerServiceClient } from '@google-cloud/secret-manager';


const client = new SecretManagerServiceClient();
const cached: Record<string, string> = {};

export async function getSecret(key: string): Promise<string> {
  if (cached[key]) return cached[key];

  const projectId = "gpti-project-465101"; 
  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${key}/versions/latest`,
  });

  const value = accessResponse.payload?.data?.toString() ?? '';
  cached[key] = value;
  return value;
}