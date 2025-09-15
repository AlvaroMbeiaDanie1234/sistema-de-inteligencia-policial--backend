import Alvo from '#models/alvo'
import type { HttpContext } from '@adonisjs/core/http'

export default class AlvosController {
  async index({ response }: HttpContext) {
    const alvos = await Alvo.all()
    return response.status(200).json({ message: 'Alvos listados com sucesso!', alvos})
  }

  async store({ request, response }: HttpContext) {
    const alvos = await new Alvo()
    try {
      alvos.nome = request.input('nome')
      alvos.numero_identificacao = request.input('numero_identificacao')
      alvos.telefone = request.input('telefone')
      alvos.email = request.input('email')
      alvos.genero = request.input('genero')
      await alvos.save()
      return response.status(201).json({ message: 'Alvo registado com sucesso!', alvos })
    } catch (error) {
      return response.status(500).json({ message: 'Erro ao registar o alvo.', error })
    }
  }

  async show({ params, response }: HttpContext) {
    const alvos = await Alvo.find(params.id)
    return response.status(200).json({ message: 'Alvo encontrado com sucesso!', alvos })
  }

  async update({ params, request, response }: HttpContext) {
    const alvos = await Alvo.findOrFail(params.id)
    try {
      alvos.nome = request.input('nome')
      alvos.numero_identificacao = request.input('numero_identificacao')
      alvos.telefone = request.input('telefone')
      alvos.email = request.input('email')
      alvos.genero = request.input('genero')
      await alvos.save()
      return response.status(200).json({ message: 'Alvo atualizado com sucesso!', alvos })
    } catch (error) {
      
    }
  }

  async destroy({ params, response }: HttpContext) {
    const alvos = await Alvo.findOrFail(params.id)
    try {
      await alvos.delete()
      return response.status(200).json({ message: 'Alvo eliminado com sucesso!', alvos })
    } catch (error) {
      return response.status(500).json({ message: 'Erro ao eliminar o alvo.', error })
    }
  }
}