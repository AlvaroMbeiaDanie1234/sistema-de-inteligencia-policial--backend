import type { HttpContext } from '@adonisjs/core/http'

// app/Controllers/Http/VerificacoaBisController.ts

import axios from 'axios';

const EXTERNAL_API_URL = 'https://consulta.edgarsingui.ao/consultar';

export default class VerificacoaBisController {
  public async index({ params, response }: HttpContext) {
    const numero = params.numero;

    if (!numero) {
      return response.status(400).json({ error: true, message: 'Número de consulta é obrigatório' });
    }

    try {
      const apiResponse = await axios.get(`${EXTERNAL_API_URL}/${numero}`);
      return response.json(apiResponse.data);
    } catch (error) {
      console.error('Erro ao consultar API externa:', error);
      return response.status(500).json({ error: true, message: 'Erro interno ao processar a consulta' });
    }
  }
}