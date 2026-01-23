import { createRouter, createWebHistory } from 'vue-router'

// Importo pagine (lazy loading) in quanto rende piu veloce il caricamento dell'applicazione. Solo su richiesta
const Welcome = () => import('@/pages/Welcome.vue')
const Login = () => import('@/pages/Login.vue')

const routes = [
    //Home, la prima pagina
    {
        path: '/',
        component: Welcome,
        name: 'Home'
    },
    // pagina di login
    {
        path: '/login',
        component: Login,
        meta: { requiresGuest: true }
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})


export default router