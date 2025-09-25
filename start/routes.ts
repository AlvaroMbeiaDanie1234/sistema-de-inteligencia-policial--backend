

import AlvosController from '#controllers/alvos_controller'
import MotorDeBuscasController from '#controllers/motor_de_buscas_controller'
import OsintSearchController from '#controllers/osint_searches_controller'
import VerificacoaBisController from '#controllers/verificacoa_bis_controller'
import WhatsAppController from '#controllers/whatsapps_controller'
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  router.post('/registar', [AlvosController, 'store'])
  router.get('/listar', [AlvosController, 'index'])
  router.get('/mostrar/:id', [AlvosController, 'show'])
  router.put('/atualizar/:id', [AlvosController, 'update'])
  router.delete('/eliminar/:id', [AlvosController, 'destroy'])
}).prefix('/api/alvos')



router.group(() => {
  router.get('/webhook', [ WhatsAppController, 'verifyWebhook'])
  router.post('/webhook', 'WhatsAppController.handleWebhook')
  router.post('/send', [WhatsAppController, 'sendMessage'])
  router.get('/messages', [WhatsAppController, 'getAllMessages'])
}).prefix('/api/whatsapp')


router.group(() => {
  router.get('/consultar', [VerificacoaBisController, 'index'])
}).prefix('/api/bi')



router.group(() => {
  router.get('', [MotorDeBuscasController, 'index'])
  router.post('/registar', [MotorDeBuscasController, 'store'])
  router.get('/mostrar/:id', [MotorDeBuscasController, 'show'])
  router.put('/atualizar/:id', [MotorDeBuscasController, 'update'])
  router.get('/buscar', [MotorDeBuscasController, 'search'] )
}).prefix('/api/motor-de-buscas')


router.get('/api/search-osint', [OsintSearchController, 'search'])