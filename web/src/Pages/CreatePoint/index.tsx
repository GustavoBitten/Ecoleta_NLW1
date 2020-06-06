import React,{useEffect,useState,ChangeEvent} from 'react'
import {FiArrowLeft} from 'react-icons/fi'
import {Link} from 'react-router-dom'
import {Map,TileLayer , Marker} from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'

import logo from '../../assets/logo.svg'

import './style.css'

interface Item {
    id: number,
    title: string,
    image_url: string
}
interface IBGEUFres {
    sigla:string
}


const CreatePoint = () =>{

    const [items,setItems] = useState<Item[]>([])
    const [ufs,setUfs] = useState<string[]>([])
    const [selectdUf,setSelectdUf] = useState('0')

    useEffect(()=>{
        api.get('items').then(res =>{
            setItems(res.data)
        })

    },[])

    useEffect(()=>{
        axios.get<IBGEUFres[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res =>{
            const ufInitials = res.data.map(uf => uf.sigla)

            setUfs(ufInitials)
        })
    },[])

    useEffect(()=>{

    },[])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value

        setSelectdUf(uf)
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
            <form>
                <h1>Cadastro do <br/> ponto de coleta </h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" />
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereços</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>


                    <Map center={[-27.2092052,-49.6401092]} zoom={15}>
                        <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[-27.2092052,-49.6401092]}/>
                       
                    
                    </Map> 

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf">
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf =>(
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                        <label htmlFor="city">Cidade</label>
                            <select name="city" id="city">
                                <option value="0">Selecione uma cidade</option>
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
                        <li key={item.id}>
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