// types/env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      TZ: string
      PORT: string
      HOST: string
      LOG_LEVEL: 'info' | 'debug' | 'warn' | 'error'
      APP_KEY: string
      NODE_ENV: 'development' | 'production' | 'test'
  
      DB_HOST: string
      DB_PORT: string
      DB_USER: string
      DB_PASSWORD?: string
      DB_DATABASE: string
  
      SERPAPI_KEY: string
  
      WHATSAPP_PHONE_ID: string
      WHATSAPP_ACCESS_TOKEN: string
      WHATSAPP_VERIFY_TOKEN: string
    }
  }
  