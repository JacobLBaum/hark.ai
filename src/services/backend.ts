export type AvailablePodcast = { topic: string; duration: string };

interface ViteImportMetaEnv {
  VITE_GCP_FUNCTION_URL?: string;
}

function getGcpGatewayUrl(): string {
  // Prefer explicit env var if provided
  const envUrl = (import.meta.env as unknown as ViteImportMetaEnv)?.VITE_GCP_FUNCTION_URL;
  if (envUrl) return envUrl;

  // Default to the GCP Gateway URL
  return 'https://podcast-gw-clhumpgw.uc.gateway.dev';
}

export async function fetchAvailablePodcastTopics(): Promise<string[]> {
  const baseUrl = getGcpGatewayUrl();
  const response = await fetch(`${baseUrl}/podcast_topics`);
  if (!response.ok) {
    throw new Error('Failed to fetch podcast topics');
  }
  return response.json();
}

export interface Podcast {
  created_at: string;
  id: string;
  summary: string;
  title: string;
}

export async function fetchPodcastsForTopic(topic: string): Promise<Podcast[]> {
  const baseUrl = getGcpGatewayUrl();
  const response = await fetch(`${baseUrl}/podcasts/${encodeURIComponent(topic)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch podcasts for topic');
  }
  const podcasts: Podcast[] = await response.json();
  // Sort by most recent first (descending order by created_at)
  return podcasts.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export interface PresignedUrlResponse {
  url: string;
}

export async function fetchPresignedUrl(podcastId: string): Promise<string> {
  const baseUrl = getGcpGatewayUrl();
  const response = await fetch(`${baseUrl}/podcasts/audio/${encodeURIComponent(podcastId)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch presigned URL');
  }
  const data: PresignedUrlResponse = await response.json();
  return data.url;
}
