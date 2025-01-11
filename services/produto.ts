import { AxiosInstance } from 'axios';

const ProdutoService = (httpClient: AxiosInstance) => ({
  listarUmProduto: async (id: number) => {
    const response = await httpClient.get(`/api/produtos/${id}`)

    let errors = null

    if (!response.data) {
      errors = {
        status: response.request.status,
        statusText: response.request.statusText
      }
    }

    return {
      data: response.data,
      errors
    }
  },

  listarTodosOsProdutos: async () => {
    const response = await httpClient.get('/api/produtos')

    return response.data
  },

  listarProdutosParaComprar: async (
    { dataInicial, dataFinal }: 
    { dataInicial: number, dataFinal: number}) => {
      const response = await httpClient.post('/api/produtos/compras', { dataInicial: dataInicial, dataFinal: dataFinal})

      return response.data
  },

  cadastrarProduto: async ({ nome, precoCusto, unidadeMedida }: 
    { nome: string, precoCusto: string, unidadeMedida: string }) => {
    const response = await httpClient.post(
      '/api/produtos',
      { nome, precoCusto, unidadeMedida }
    )

    let errors = null

    if (!response.data) {
      errors = {
        status: response.request.status,
        statusText: response.request.statusText
      }
    }

    return {
      data: response.data,
      errors
    }
  },

  atualizarProduto: async ({ nome, precoCusto, unidadeMedida, id }: 
    { nome: string, precoCusto: string, unidadeMedida: string, id: number }) => {
    const response = await httpClient.put(
      '/api/produtos',
      { nome, precoCusto, unidadeMedida, id }
    )

    let errors = null

    if (!response.data) {
      errors = {
        status: response.request.status,
        statusText: response.request.statusText
      }
    }

    return {
      data: response.data,
      errors
    }
  },

  atualizarStatusDoProduto: async (id: number, ativo: number) => {
    const response = await httpClient.put(
      `/api/produtos/${id}/status`,
      { ativo }
    )

    let errors = null

    if (!response.data) {
      errors = {
        status: response.request.status,
        statusText: response.request.statusText
      }
    }

    return {
      data: response.data,
      errors
    }
  },

  deletarProduto: async (id: number) => {
    const response = await httpClient.delete(
      `/api/produtos/${id}`
    )

    let produtoErrors = null

    if (!response.data) {
      produtoErrors = {
        status: response.request.status,
        statusText: response.request.statusText
      }
    }

    return {
      data: response.data,
      produtoErrors
    }
  }
})

export default ProdutoService
