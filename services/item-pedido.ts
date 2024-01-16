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
    const response = await httpClient.delete(
      `/api/pedido/${id.split(' ')[1]}/item-pedido/${id.split(' ')[0]}/${id.split(' ')[2].split('.')[0]}/estante-id/${id.split(' ')[3]}/produto-id/${id.split(' ')[4]}`)

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
