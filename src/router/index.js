import { createRouter, createWebHistory } from 'vue-router'
import StatsTable from '../components/StatsTable.vue'

const routes = [
    {
        path: '/',
        redirect: '/quarterbacks'
    },
    {
        path: '/wide-receivers',
        name: 'WideReceivers',
        component: StatsTable,
        meta: { position: 'WR' }
    },
    {
        path: '/quarterbacks',
        name: 'Quarterbacks',
        component: StatsTable,
        meta: { position: 'QB' }
    },
    {
        path: '/running-backs',
        name: 'RunningBacks',
        component: StatsTable,
        meta: { position: 'RB' }
    },
    {
        path: '/tight-ends',
        name: 'TightEnds',
        component: StatsTable,
        meta: { position: 'TE' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router 