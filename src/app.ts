import express from 'express'
import { router } from './routes/index.routes.js'
import { errorHandler } from './middlewares/errorHandler.js'
import cookieParser from 'cookie-parser'
import nodemailer from 'nodemailer'
const app = express()

app.use(cookieParser())
app.use(express.json())
app.use('/api', router)
app.use(errorHandler)


export {app}
