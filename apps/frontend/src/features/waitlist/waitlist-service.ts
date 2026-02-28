const WAITLIST_API = 'https://api.freewaitlists.com/waitlists/cmm6cqw9908fn01sze5g0vule';

export interface JoinWaitlistResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function joinWaitlist(email: string): Promise<JoinWaitlistResponse> {
  const response = await fetch(WAITLIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      meta: {
        type: 'creator',
        source: 'landing-page-creator-path',
        timestamp: new Date().toISOString(),
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to join waitlist');
  }

  return response.json();
}
