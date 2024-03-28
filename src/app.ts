import 'reflect-metadata'
import 'express-async-errors'
import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { pedidoRouter } from './routes/ordersRouter';
import { handleApplicationErrors } from './middleware/error.handling-middleware';



const app: Express = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => res.send('OK!'))

app.use('/', pedidoRouter)
app.use(handleApplicationErrors)


export function init(): Promise<Express> {
  return Promise.resolve(app)
}
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});



export default app