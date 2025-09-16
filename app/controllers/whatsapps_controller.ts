import Whatsapp from '#models/whatsapp'
import type { HttpContext } from '@adonisjs/core/http'

import axios from 'axios'

export default class WhatsAppController {
  // Webhook verification (GET)
  public async verifyWebhook({ request, response }: HttpContext) {
    const mode = request.input('hub.mode')
    const token = request.input('hub.verify_token')
    const challenge = request.input('hub.challenge')

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return response.status(200).send(challenge)
    }

    return response.status(403).send('Verification failed')
  }

  // Receber mensagens via webhook (POST)
  public async handleWebhook({ request, response }: HttpContext) {
    const body = request.body()

    // Valide se é da Meta (opcional: cheque signature, mas por agora simples)
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages' && change.value.messages) {
            for (const msg of change.value.messages) {
              // Salve a mensagem recebida
              await Whatsapp.create({
                from: msg.from,
                to: change.value.metadata.display_phone_number,
                type: msg.type,
                content: JSON.stringify(msg[msg.type]),  // ex: msg.text.body
                status: 'received',
              })
            }
          }
          // Handle status updates if needed (ex: delivered, read)
        }
      }
    }

    return response.status(200).send('OK')  // Sempre responda 200 para evitar retries
  }

  // Enviar mensagem (POST /api/whatsapp/send)
  public async sendMessage({ request, response }: HttpContext) {
    const { to, type, template } = request.body()  // Ajuste conforme payload
    try {
      const apiUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`
      const headers = {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: type || 'template',
        template: template || { name: 'hello_world', language: { code: 'en_US' } },
      }
      const res = await axios.post(apiUrl, payload, { headers })
      // Salve a mensagem enviada
      await Whatsapp.create({
        from: process.env.WHATSAPP_PHONE_ID,
        to,
        type: payload.type,
        content: JSON.stringify(payload.template || payload),
        status: 'sent',
      })

      console.log('Mensagem enviada:', res.data)
      return response.status(200).json(res.data)
    } catch (error) {
      console.log(error)
      return response.status(500).json({ error: error.message })
      
    }
  }

  // Buscar todas mensagens (GET /api/whatsapp/messages)
  public async getAllMessages({ response }: HttpContext) {
    const messages = await Whatsapp.all()  // Ou filtre por conversa
    return response.status(200).json(messages)
  }
}