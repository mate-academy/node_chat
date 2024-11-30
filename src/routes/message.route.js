import express from 'express'
import { messageController } from '../controllers/message.controller.js'


export const messageRouter = new express.Router()

messageRouter.post('/create', messageController.create)
