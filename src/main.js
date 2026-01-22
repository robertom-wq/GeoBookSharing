import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { NButton, NCard, NLayout, NMenu,NInput, NForm, NFormItem  } from 'naive-ui'


const app = createApp(App)
app.use(router)

//Mi permette di utilizzare questi componenti senza importarli ogni volta
app.component('NButton', NButton)
app.component('NCard', NCard)
app.component('NLayout', NLayout)
app.component('NMenu', NMenu)
app.component('NInput', NInput)
app.component('NForm', NForm)
app.component('NFormItem', NFormItem)


app.mount('#app')
