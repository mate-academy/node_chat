import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';

const route = Router();

route.get('/', userController.getAllUsers);
route.post('/', userController.createUser);
route.delete('/:userId', userController.deleteUser);
route.put('/:userId', userController.updateUser);

export default route;
