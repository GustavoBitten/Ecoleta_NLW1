
import knex from '../database/connection'
import { Request ,Response, response} from 'express'
import { checkServerIdentity } from 'tls'

class PointsControler {

    async index (req:Request ,res:Response){
        //console.log('index')
        const {city, uf, items} = req.query
        //console.log(req.query)

         const parsedItems = String(items)
             .split(',')
             .map(item => Number(item.trim()))

           //console.log(parsedItems)
        
        const points = await knex('points')
             .join('point_items','points.id','=','point_items.point_id')
             .whereIn('point_items.item_id',parsedItems)
             .where('city',String(city))
             .where('uf',String(uf))
             .distinct()
            .select('points.*')
            
        //console.log(points)

        res.json(points)
    }
    async show (req:Request ,res:Response){
        console.log('show')

        const {id} = req.params

        const point = await knex('points').where('id',id).first()

        if (!point) {
            return res.status(400).json({massage: 'Point not found.'})
        }

        const items = await knex('items')
            .join('point_items','items.id','=','point_items.item_id')
            .where('point_items.point_id',id)
            .select('items.title')
        return res.json({point,items})
    }
    async create (req:Request ,res:Response){
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body
    
        const trx = await knex.transaction();

        const point = {
            image: 'image-fake',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
        const insertedIds = await trx('points').insert(point)
    
        
        const point_id = insertedIds[0]
        
        
        const pointItems = items.map((item_id: number)=>{
            return{
                item_id,
                point_id
            }
    
        })
    
        const many = await trx('point_items').insert(pointItems)
        
         await trx.commit()       
    
        return res.json({
            id: point_id,
            ...point
        })
    }
}


export default PointsControler