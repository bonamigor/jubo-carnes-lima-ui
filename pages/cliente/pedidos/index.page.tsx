import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import BloomImg from '../../../assets/bloom.png';
import DeleteImg from '../../../assets/delete.png';
import CancelOrder from "../../../components/Modal/CancelOrder/index.page";
import OrderInfo from "../../../components/Modal/Cliente/OrderInfo/index.page";
import { pedidoService } from '../../../services/index';
import { PedidosProps } from "../../../services/pedido";
import { Container, Content, InputFilter, TableContainer } from "./pedidos";

const Pedidos: NextPage = () => {
  const [pedidos, setPedidos] = useState<PedidosProps[]>([])
  const [filter, setFilter] = useState('')
  const [filteredPedidos, setFilteredPedidos] = useState<PedidosProps[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pedido, setPedido] = useState<PedidosProps>({ id: 0, dataCriacao: 0, dataEntrega: 0, valorTotal: 0, status: '', observacao: '', obsCancelamento: '', nome: '', endereco: '', cidade: '', estado: '', telefone: '', isFinalizado: 0 })
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false)

  useEffect(() => {
    const fetchPedidos = async () => {
      const clienteId: number = Number(window.sessionStorage.getItem('userClientId'))
      const { data, errors } = await pedidoService.listarPedidosByCliente(clienteId)
      if (!errors) {
        setPedidos(data.pedidos)
      }
    }
    fetchPedidos()
  }, [pedido.id])

  const handleFilterProdutoList = (event: any) => {
    setFilter(event.toUpperCase())
    setFilteredPedidos(pedidos.filter(pedido => {
      return String(pedido.id).includes(filter)
    }))
  }

  const onRequestClose = async () => {
    setIsModalOpen(false)
  }

  const viewOrderInfo = async (pedido: PedidosProps) => {
    setPedido(pedido)
    setIsModalOpen(true)
  }

  const handleCancelOrder = async (pedido: PedidosProps) => {
    setPedido(pedido)
    setIsCancelOrderModalOpen(true)
  }

  const onRequestCloseCancelOrder = async () => {
    setIsCancelOrderModalOpen(false)
  }

  return (
    <>
      <Head>
        <title>Titulo Aqui - Pedidos</title>
      </Head>    
      <Container>
        <Content>
          <h1>Pedidos</h1>
          <p>Aqui estão todos os pedidos feitos por você!</p>
          <p>Para mais detalhes, clique na Lupa!</p>
        </Content>
        <InputFilter>
          <input type="text" placeholder="Filtre pelo ID do Pedido" onChange={event => handleFilterProdutoList(event.target.value)} />
        </InputFilter>
        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Data Criação</th>
                <th>Total</th>
                <th>Status</th>
                <th>Data Entrega</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filter.length > 1 ? (
                filteredPedidos.map(pedido => {
                  return (
                    <tr key={pedido.id}>
                      <td>{pedido.id}</td>
                      <td>{ new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'})
                          .format(new Date(pedido.dataCriacao)) 
                      }</td>
                      <td>{ new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                        }).format(pedido.valorTotal)}</td>
                      <td>{pedido.status} / {pedido.isFinalizado === 1 ? 'FINALIZADO' : 'N. FINALIZ.'}</td>
                      <td>
                        {pedido.dataEntrega ? new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(new Date(pedido.dataEntrega)) : 'Sem Data'}
                      </td>
                      <td>
                        <a><Image onClick={() => {viewOrderInfo(pedido)}} src={BloomImg} alt="Visualizar" width={30} height={30} /></a>
                      </td>
                    </tr>
                  )
                })
              ) : (
                pedidos.map(pedido => {
                  return (
                    <tr key={pedido.id}>
                      <td>{pedido.id}</td>
                      <td>{ new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'})
                          .format(new Date(pedido.dataCriacao)) 
                      }</td>
                      <td>{ new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                        }).format(pedido.valorTotal)}</td>
                      <td>{pedido.status} / {pedido.isFinalizado === 1 ? 'FINALIZADO' : 'N. FINALIZ.'}</td>
                      <td>
                        {pedido.dataEntrega ? new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(new Date(pedido.dataEntrega)) : 'Sem Data'}
                      </td>
                      <td>
                        <a><Image onClick={() => {viewOrderInfo(pedido)}} src={BloomImg} alt="Visualizar" width={30} height={30} /></a>
                        {pedido.status === 'CRIADO' && <a><Image onClick={() => {handleCancelOrder(pedido)}} src={DeleteImg} alt="Excluir" width={30} height={30} /></a>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </TableContainer>
      </Container>
      <OrderInfo isOpen={isModalOpen} onRequestClose={onRequestClose} pedido={pedido}/>
      <CancelOrder isOpen={isCancelOrderModalOpen} onRequestClose={onRequestCloseCancelOrder} pedido={pedido}></CancelOrder>
    </>
  )
}

export default Pedidos
