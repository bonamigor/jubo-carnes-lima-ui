import axios from "axios"

import AuthService from './auth'
import ClienteService from "./cliente"
import EstanteService from "./estante"
import ItemPedidoService from './item-pedido'
import PedidoService from './pedido'
import ProdutoService from "./produto"
import ProdutoEstanteService from "./produtoEstante"
import UsuarioService from './usuario'

const API_ENVS = {
  local: 'http://localhost:3001',
  production: 'https://jubo-paraiso-ribeiro-api-production.up.railway.app'
}

const httpClient = axios.create({
  baseURL: API_ENVS.production
})

httpClient.interceptors.request.use(config => {
  const token = window.localStorage.getItem('token')

  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`
    }
  }

  return config;
})

export const auth = AuthService(httpClient)
export const clienteService = ClienteService(httpClient)
export const usuarioService = UsuarioService(httpClient)
export const produtoService = ProdutoService(httpClient)
export const estanteService = EstanteService(httpClient)
export const produtoEstanteService = ProdutoEstanteService(httpClient)
export const pedidoService = PedidoService(httpClient)
export const itemPedidoService = ItemPedidoService(httpClient)
