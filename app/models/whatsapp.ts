import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Whatsapp extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare from: string  // Número do remetente

  @column()
  declare to: string  // Seu número

  @column()
  declare type: string  // ex: 'text', 'image'

  @column()
  declare content: string  // Corpo da mensagem

  @column()
  declare status: string  // ex: 'received', 'sent'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}