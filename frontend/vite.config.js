import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // Cho phép ngrok truy cập vào Frontend của nhóm
        allowedHosts: [
            'cling-blinks-idealize.ngrok-free.dev'
        ]
    }
})