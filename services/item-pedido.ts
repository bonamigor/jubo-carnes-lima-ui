import { AxiosInstance } from "axios"

const ItemPedidoService = (httpClient: AxiosInstance) => ({
  adicionarProdutoNoPedido: async (
    { estanteId, produtoId, precoVenda, quantidade, pedidoId }: 
    { estanteId: string, produtoId: string, precoVenda: number, quantidade: number, pedidoId: string }) => {
    const response = await httpClient.post(
      `/api/pedido/${pedidoId}/adicionar`, 
      { estanteId, produtoId, precoVenda, quantidade }
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

  atualizarItemDoPedido: async (
    { estanteId, produtoId, pedidoId, itemPedidoId, precoVenda, quantidadeAntiga, quantidadeNova }:
    { estanteId: number, produtoId: number, pedidoId: number, itemPedidoId: number, precoVenda: number, quantidadeAntiga: number, quantidadeNova: number }) => {

    const response = await httpClient.put(
      `/api/pedido/${pedidoId}/atualizar/${itemPedidoId}`,
      { estanteId, produtoId, precoVenda, quantidadeAntiga, quantidadeNova })

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

  deletarProdutoDoPedidoById: async (id: string) => {
    const pedidoId = id.split(' ')[1]
    const itemPedidoId = id.split(' ')[0]
    const quantidade = Number(id.split(' ')[2])
    const estanteId = id.split(' ')[3]
    const produtoId = id.split(' ')[4]

    const response = await httpClient.post(
      `/api/pedido/${pedidoId}/item-pedido/${itemPedidoId}/estante-id/${estanteId}/produto-id/${produtoId}`, {
        quantidade
      })

    let itemPedidoErrors = null

    if (!response.data) {
      itemPedidoErrors = {
        status: response.request.status,
        statusText: response.request.statusText
      }
    }

    return {
      data: response.data,
      itemPedidoErrors
    }
  }
})

export default ItemPedidoService
