import { createRouter, createWebHistory } from 'vue-router'

// Importo pagine (lazy loading) in quanto rende piu veloce il caricamento dell'applicazione. Solo su richiesta
const Welcome = () => import('@/pages/Welcome.vue')


const routes = [
    //Home, la prima pagina
    {
        path: '/',
        component: Welcome,
        name: 'Home'
    },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})


export default router