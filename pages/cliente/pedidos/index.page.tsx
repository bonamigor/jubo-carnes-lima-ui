import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Container, Content, InputFilter, TableContainer } from "./pedidos";
import { pedidoService } from '../../../services/index';
import Image from "next/image";
import BloomImg from '../../../assets/bloom.png'
import DeleteImg from '../../../assets/delete.png'
import OrderInfo from "../../../components/Modal/Cliente/OrderInfo/index.page";
import Head from "next/head";
import CancelOrder from "../../../components/Modal/CancelOrder/index.page";

interface PedidosProps {
  id: number;
  dataCriacao: number;
  dataEntrega: number;
  valorTotal: number;
  status: string;
  observacao: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string;
}

const Pedidos: NextPage = () => {
  const [pedidos, setPedidos] = useState<PedidosProps[]>([])
  const [filter, setFilter] = useState('')
  const [filteredPedidos, setFilteredPedidos] = useState<PedidosProps[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pedido, setPedido] = useState<PedidosProps>({ id: 0, dataCriacao: 0, dataEntrega: 0, valorTotal: 0, status: '', observacao: '', nome: '', endereco: '', cidade: '', estado: '', telefone: '' })
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
        <title>Jubo Notas - Pedidos</title>
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
                      <td>{pedido.status}</td>
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
                      <td>{pedido.status}</td>
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
