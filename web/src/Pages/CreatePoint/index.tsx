import React,{useEffect,useState,ChangeEvent, FormEvent} from 'react'
import {FiArrowLeft} from 'react-icons/fi'
import {Link, useHistory} from 'react-router-dom'
import {Map,TileLayer , Marker} from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import {LeafletMouseEvent} from 'leaflet'
import logo from '../../assets/logo.svg'

import './style.css'

interface Item {
    id: number,
    title: string,
    image_url: string
}
interface IBGEUFRes {
    sigla:string
}

interface IBGECityRes {
    nome:string
}


const CreatePoint = () =>{


    const [items,setItems] = useState<Item[]>([])
    const [ufs,setUfs] = useState<string[]>([])
    const [cities,setCities] = useState<string[]>([])

    const [initialPosition,setInitialPosition] = useState<[ number, number]>([0,0])

    const [formData,setFormData] = useState({
        name: ' ',
        email: ' ',
        whatsapp: ' '
    })
    
    const [selectdUf,setSelectdUf] = useState('0')
    const [selectdCity,setSelectdCity] = useState('0')
    const [selectdItems,setSelectdItems] = useState<number[]>([])
    const [selectdPosition,setSelectdPosition] = useState<[ number, number]>([0,0])

    const history = useHistory()

    useEffect(()=>{
       navigator.geolocation.getCurrentPosition(position =>{
           const {latitude,longitude} =position.coords

           setInitialPosition([latitude,longitude])
       })  
    },[])

    useEffect(()=>{
        api.get('items').then(res =>{
            setItems(res.data)
        })

    },[])

    useEffect(()=>{
        axios.get<IBGEUFRes[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res =>{
            const ufInitials = res.data.map(uf => uf.sigla)

            setUfs(ufInitials)
        })
    },[])

    useEffect(()=>{
        if (selectdUf === '0' ){
            return
        }
        axios.get<IBGECityRes[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectdUf}/municipios`).then(res =>{
            const cityNames = res.data.map(city => city.nome)

        setCities(cityNames)
    })
        
    },[selectdUf])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value

        setSelectdUf(uf)
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value

        setSelectdCity(city)
    }

    function handleMapClick(event:LeafletMouseEvent) {
        setSelectdPosition([
            event.latlng.lat,
            event.latlng.lng
        ])

        
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const {name , value} = event.target

        setFormData({...formData,[name]: value})
    }

    
    function handleSelectItem(id : number) {
        const alreadySelected = selectdItems.findIndex(item => item === id )

        if (alreadySelected >= 0) {
            const filteredItems = selectdItems.filter(item => item !== id)
             setSelectdItems(filteredItems)
        }else{
            setSelectdItems([...selectdItems,id])
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        const {name,email,whatsapp} = formData
        const uf = selectdUf
        const city = selectdCity
        const [latitude,longitude] = selectdPosition
        const items = selectdItems

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }

        await api.post('points',data)

        alert('Criado!')

        history.push('/')

    }

    return (
       <div id="page-create-point">
           <header>
               <img src={logo} alt="Ecoleta" />

               <Link to='/'>
                   <FiArrowLeft />
                   Voltar para Home
               </Link>
            </header>
            <form onSubmit={handleSubmit} >
                <h1>Cadastro do <br/> ponto de coleta </h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange} />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereços</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>


                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectdPosition}/>
                       
                    
                    </Map> 

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                            name="uf"
                             id="uf" 
                            value={selectdUf}
                            onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf =>(
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                        <label htmlFor="city">Cidade</label>
                            <select
                             name="city"
                             id="city"
                             value={selectdCity}
                             onChange={handleSelectCity}
                             >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city =>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>

                    </legend>

                    <ul className="items-grid">
                    { items.map(item =>(
                        <li key={item.id} 
                            onClick={() =>handleSelectItem(item.id) } 
                            className={ selectdItems.includes(item.id) ? 'selected': '' }
                        >
                            <img src={item.image_url} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>
                    ))}
                        
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>


       </div>
    )
}


export default CreatePoint