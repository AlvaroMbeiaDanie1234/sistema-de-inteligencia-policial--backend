import type { HttpContext } from '@adonisjs/core/http'
import MotorDeBusca from '#models/motor_de_busca'
import Mention from '#models/mention'
import { TwitterApi } from 'twitter-api-v2'

export default class MotorDeBuscasController {
  // Configura cliente do X com validação do token
  private twitterClient: TwitterApi

  constructor() {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN
    if (!bearerToken) {
      throw new Error('TWITTER_BEARER_TOKEN não está definido no ambiente (.env)')
    }
    this.twitterClient = new TwitterApi(bearerToken)
  }

  async index({ response }: HttpContext) {
    const motorDeBuscas = await MotorDeBusca.all()
    return response.status(200).json({ message: 'Motores de Busca listados com sucesso!', motorDeBuscas })
  }

  async store({ request, response }: HttpContext) {
    const motorDeBuscas = new MotorDeBusca()
    try {
      motorDeBuscas.nome = request.input('nome')
      motorDeBuscas.descricao = request.input('descricao')
      motorDeBuscas.rssUrl = request.input('rssUrl')
      await motorDeBuscas.save()
      return response.status(201).json({ message: 'Motor de Busca registado com sucesso!', motorDeBuscas })
    } catch (error) {
      console.error('Erro ao registrar Motor de Busca:', error.message)
      return response.status(400).json({ message: 'Erro ao registrar', error: error.message })
    }
  }

  async show({ params, response }: HttpContext) {
    const motorDeBuscas = await MotorDeBusca.find(params.id)
    if (!motorDeBuscas) {
      return response.status(404).json({ message: 'Motor de Busca não encontrado' })
    }
    return response.status(200).json({ message: 'Motor de Busca encontrado com sucesso!', motorDeBuscas })
  }

  async update({ params, request, response }: HttpContext) {
    const motorDeBuscas = await MotorDeBusca.findOrFail(params.id)
    try {
      motorDeBuscas.nome = request.input('nome')
      motorDeBuscas.descricao = request.input('descricao')
      motorDeBuscas.rssUrl = request.input('rssUrl')
      await motorDeBuscas.save()
      return response.status(200).json({ message: 'Motor de Busca atualizado com sucesso!', motorDeBuscas })
    } catch (error) {
      console.error('Erro ao atualizar Motor de Busca:', error.message)
      return response.status(400).json({ message: 'Erro ao atualizar', error: error.message })
    }
  }

  async search({ response }: HttpContext) {
    try {
      const motorDeBuscas = await MotorDeBusca.all()
      const results: any[] = []
      const seenItems = new Set<string>()
      const errors: string[] = []
  
      if (motorDeBuscas.length === 0) {
        return response.status(200).json({
          message: 'Nenhum motor de busca configurado',
          results: [],
          errors: ['Nenhum motor de busca registrado no banco de dados']
        })
      }
  
      for (const motor of motorDeBuscas) {
        const keyword = motor.nome
        if (!keyword) {
          errors.push(`Palavra-chave ausente para um motor de busca`)
          continue
        }
        console.log(`Buscando no X para a palavra-chave: ${keyword}`)
        try {
          const query = `${keyword} lang:pt -is:retweet`
          const tweets = await this.twitterClient.v2.search(query, {
            max_results: 10,
            'tweet.fields': ['created_at', 'author_id', 'text']
          })
  
          if (tweets.data && Array.isArray(tweets.data)) {
            for (const tweet of tweets.data) {
              const entryId = tweet.id
              if (seenItems.has(entryId)) continue
              seenItems.add(entryId)
              const text = tweet.text
              const mention = new Mention()
              mention.externalId = entryId
              mention.text = text
              mention.authorId = tweet.author_id || 'N/A'
              mention.createdAtExternal = tweet.created_at || 'N/A'
              mention.keyword = keyword
              mention.source = 'X'
              await mention.save()
              results.push({
                source: 'X',
                keyword,
                text,
                link: `https://twitter.com/i/web/status/${entryId}`,
                createdAt: tweet.created_at
              })
            }
          } else {
            console.log(`Nenhum tweet encontrado ou dados inválidos para ${keyword}`)
          }
        } catch (twitterError) {
          if (twitterError.code === 429) {
            console.warn(`Limite de taxa atingido para ${keyword}. Aguardando reinício...`)
            errors.push(`Limite de taxa atingido para ${keyword}: ${twitterError.message}`)
            // Aguarda 15 segundos antes de continuar (ajuste conforme necessário)
            await new Promise(resolve => setTimeout(resolve, 15000))
            continue
          }
          console.error(`Erro ao buscar no X para ${keyword}:`, twitterError.message)
          errors.push(`Erro ao buscar no X para ${keyword}: ${twitterError.message}`)
        }
        // Adiciona um atraso de 1 segundo entre buscas
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
  
      if (results.length === 0 && errors.length > 0) {
        console.log('Nenhum resultado novo encontrado')
        return response.status(200).json({
          message: 'Nenhum resultado novo encontrado',
          results: [],
          errors,
        })
      } else if (results.length === 0) {
        console.log('Nenhum resultado novo encontrado')
        return response.status(200).json({
          message: 'Nenhum resultado novo encontrado',
          results: [],
        })
      }
  
      console.log(`Encontrados ${results.length} resultados`)
      return response.status(200).json({
        message: 'Busca realizada com sucesso!',
        results,
        errors: errors.length > 0 ? errors : undefined,
      })
    } catch (error) {
      console.error('Erro geral ao buscar menções:', error.message)
      return response.status(500).json({
        message: 'Erro ao buscar menções',
        error: error.message,
        results: [],
      })
    }
  }
}