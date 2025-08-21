import 'reflect-metadata'; 
import express from 'express'
import cors from 'cors'
import router from './routes/router'
import * as dotenv from 'dotenv';
dotenv.config()
const application = express()
const port = process.env.DATABASE_PORT|| 3000
application.use(cors({
  origin:['*'],
  methods:['POST','GET']
}))
application.use(express.json())
application.use('/api/',router)
application.listen(port,() =>{

  console.log(`Server Connected to http://localhost:${port}`)
})
