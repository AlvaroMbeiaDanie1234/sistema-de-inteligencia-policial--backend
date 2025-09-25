import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'motor_de_buscas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string("nome")
      table.string('descricao')
      table.string('rssUrl')
      table.string('rss_url')
      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}