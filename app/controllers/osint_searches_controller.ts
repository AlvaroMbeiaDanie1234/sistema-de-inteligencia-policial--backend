// backend/controllers/OsintSearchController.ts
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'

export default class OsintSearchController {
  public async search({ request, response }: HttpContext) {
    const query = request.input('q')

    if (!query) {
      return response.status(400).json({ error: 'Query parameter "q" is required' })
    }

    const serpApiKey = process.env.SERPAPI_KEY
    if (!serpApiKey) {
      return response.status(500).json({ error: 'SerpAPI key is not configured' })
    }

    try {
      const params = new URLSearchParams({
        engine: 'google',
        q: query,
        api_key: serpApiKey,
        num: '10',
      })

      const serpResponse = await axios.get(`https://serpapi.com/search?${params.toString()}`)

      // Imprimindo o resultado bruto da SerpAPI no console
      console.log('Resultado da pesquisa SerpAPI:', JSON.stringify(serpResponse.data, null, 2))

      // Formatando a resposta para o frontend
      const formattedResponse = {
        success: true,
        results: serpResponse.data.organic_results || [],
        images: serpResponse.data.inline_images || [], // Incluindo inline_images
        total: serpResponse.data.search_information?.total_results || 0,
        query: serpResponse.data.search_information?.query || query,
      }

      // Imprimindo a resposta formatada no console
      console.log('Resposta formatada para o frontend:', JSON.stringify(formattedResponse, null, 2))

      return response.json(formattedResponse)
    } catch (error) {
      console.error('OSINT search error:', error)
      return response.status(500).json({ error: 'Failed to perform OSINT search' })
    }
  }
}