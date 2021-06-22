import express from 'express'
import { createUser, getUsers, getUser, updateUser, delUser } from '../controllers/users.js'

const router = express.Router()

router.post('/', createUser)
// 查多個, 也可以用過濾例如 '/?age=18'
router.get('/', getUsers)
// 查單個
router.get('/:id', getUser)
router.patch('./:id', updateUser)
router.delete('/:id', delUser)

export default router
