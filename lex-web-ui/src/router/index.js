import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import LexWeb from '../components/LexWeb.vue'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LexWeb',
      component: LexWeb
    }
  ]
})

// module.exports = {
//   history: createWebHashHistory(process.env.BASE_URL),
//   routes: [
//     {
//       path: '/',
//       name: 'LexWeb',
//       component: require('../components/LexWeb.vue').default,
//     }
//   ]
// }
export default router
