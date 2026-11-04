import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import './styles/common.css' 

const app = createApp(App)
app.use(Vant)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
