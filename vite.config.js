import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"
// 按需导入element-plus组件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  define: {
    'process.env': {
      APP_IS_DEBUG: true,
      CONDITION_IMAGE: "https://www.bqdnao.com/static/condition.png",
      STAMP_IMAGE:"https://www.bqdnao.com/static/stamp.png",
      PLANE_IMAGE: "https://www.bqdnao.com/static/plane.png",
      CLOSE_WHITE_IMAGE: 'https://www.bqdnao.com/static/close_white.png'
    },
  },
  plugins: [
    vue(),
    //按需导入element-plus组件
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  build: {
    //配置导出组件
    lib: {
      entry: path.resolve(__dirname, 'src/components/index.js'),
      name: 'gstep-vue',
      fileName: (format) => `gstep-vue.${format}.js`
    },
    //配置不想打包进来的依赖库:vue,element-plus
    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          "element-plus": "ElementPlus"
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
