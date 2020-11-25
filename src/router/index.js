import { createRouter, createWebHashHistory } from 'vue-router'
import Puzzle from '../views/Puzzle.vue'
import PuzzleReplay from '../views/PuzzleReplayer.vue'

const routes = [
  {
    path: '/',
    redirect: '/puzzle'
  },
  {
    path: '/puzzle',
    name: 'Puzzle',
    component: Puzzle
  },
  {
    path: '/puzzle-replay',
    name: 'PuzzleReplay',
    component: PuzzleReplay
  },
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router
