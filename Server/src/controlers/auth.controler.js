import { Rooms } from "../models/rooms.js"
import { User } from "../models/user.js"
import { mesageService } from "../service/mesage.service.js"

import { userService } from "../service/user.service.js"
const getMessages = async (req, res) => {
  const { roomId } = req.params
  console.log(roomId)

  const allMasseges = await mesageService.getAllMessage(roomId)
  res.send(allMasseges)
}
const sendMessage = async (req, res) => {
  const { text, roomId, userId } = req.body
   console.log(text,roomId,userId)
  if (!text || !roomId || !userId) {
    res.send({message:'bad request text room'})
    return
  }
  const findRoom = await Rooms.findOne({ where: { id:Number(roomId) } })
const findUser = await User.findOne({where:{id:Number(userId)}})

  if (!findRoom || !findUser) {
res.send({message:'retsese'})
    return
  }
  const newMessage = await mesageService.createMesage(text, findUser.name,findUser.id,findRoom.id)
  const io = req.app.get('io');
io.to(String(roomId)).emit('message:sent', newMessage);
res.send({ ok: true });
}

const register = async (req, res) => {
  const { name } = req.body;
  if (!name ) {
    res.json({ message: 'bad request' })
    return
  }
const newUser = await userService.register(name)


 res.send(newUser)
}
const logout = async (req, res) => {




};

export const authController = {
  register,sendMessage,getMessages,logout
}
