'use strict';
import 'dotenv/config';
import { createServer } from "./createServer.js";


const PORT = process.env.PORT || 3005
async function start() {
  try {
    const  {httpServer}=createServer()
    httpServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`)
    })
  } catch{
console.log('server error start')
  }

}
start()
