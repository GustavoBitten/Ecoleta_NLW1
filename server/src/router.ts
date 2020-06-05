import express from 'express'
import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'

const pointsController = new PointsController
const itemsController = new ItemsController
const routes = express.Router()

routes.get('/items', itemsController.index )

routes.get('/pointss', pointsController.index )
//console.log('nivel 1')
routes.post('/points', pointsController.create )
//console.log('nivel 2')

routes.get('/points/:id', pointsController.show )
//console.log('nivel 3')

export default routes