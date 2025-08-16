import { env } from '@/env'

export function generateCompanyLogoUrl(name: string): string {
  const query = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `https://api.logo.dev/search?q=${query}`
}

export async function fetchCompanyLogo(companyName: string): Promise<string | null> {
  if (!env.VITE_LOGO_DEV_API_KEY) {
    console.warn('Logo.dev API key not configured')
    return null
  }

  try {
    const response = await fetch(generateCompanyLogoUrl(companyName), {
      headers: {
        Authorization: `Bearer: ${env.VITE_LOGO_DEV_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Logo.dev API error: ${response.status}`)
    }

    const data = await response.json()

    // Return the first logo URL if available
    if (data && data.length > 0 && data[0].logo_url) {
      return data[0].logo_url
    }

    return null
  }
  catch (error) {
    console.error('Error fetching company logo:', error)
    return null
  }
}
