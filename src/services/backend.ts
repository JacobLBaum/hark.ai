export type AvailablePodcast = { topic: string; duration: string };

interface ViteImportMetaEnv {
  VITE_WORKER_URL?: string;
}

function getWorkerBaseUrl(): string {
  // Prefer explicit env var if provided
  const envUrl = (import.meta.env as unknown as ViteImportMetaEnv)?.VITE_WORKER_URL;
  if (envUrl) return envUrl;

  // Auto-detect local vs production
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8787';
    }
  }

  // Default production Worker URL
  return 'https://daily-podcast-generator.jacoblbaum.workers.dev';
}

export async function fetchAvailablePodcastTopics(): Promise<AvailablePodcast[]> {
  const baseUrl = getWorkerBaseUrl();
  const response = await fetch(`${baseUrl}/api/podcast-topics`);
  if (!response.ok) {
    throw new Error('Failed to fetch podcast topics');
  }
  return response.json();
}
