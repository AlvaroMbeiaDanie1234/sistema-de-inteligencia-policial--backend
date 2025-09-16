import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,
  origin: ['http://localhost:3000', 'https://sacip.vercel.app'], // Remove '*' and trailing slash
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true, // Keep if you need cookies/auth headers
  maxAge: 90,
})

export default corsConfig