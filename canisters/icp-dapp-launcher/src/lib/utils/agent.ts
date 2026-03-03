import { HttpAgent } from '@icp-sdk/core/agent';
import { HOST } from '$lib/constants';
import { authStore } from '$lib/stores/auth';

export async function createHttpAgent(): Promise<HttpAgent> {
  const identity = await authStore.getIdentity();

  const agent = await HttpAgent.create({
    identity,
    host: HOST,
  });

  if (!PROD) {
    await agent.fetchRootKey();
  }

  return agent;
}
