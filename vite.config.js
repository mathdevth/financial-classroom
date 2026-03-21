import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // เปลี่ยนชื่อตรงนี้ให้ตรงกับชื่อ Repository บน GitHub ของคุณ
  base: '/financial-classroom/', 
})