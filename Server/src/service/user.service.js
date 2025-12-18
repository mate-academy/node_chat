import { User } from "../models/user.js";

async function register(name) {

 const newUser = await User.create({
    name

 })
  return newUser
}

export const userService = {
  register
}
