import { NextPage } from 'next';
import { useMutation, useQuery } from 'react-query';
import { Container, Content, Orderless, TableContainer, LoadingOrders } from './pedido';
import { useEffect, useState } from 'react';
import { pedidoService } from '../../../../services/index';
import { Loading } from '@nextui-org/react';
import Image from "next/image";
import BloomImg from '../../../../assets/bloom.png'
import DeleteImg from '../../../../assets/delete.png'
import EditImg from '../../../../assets/edit.png'
import EditObsImg from '../../../../assets/confirm.png'
import ConfirmImg from '../../../../assets/select.png'
import OrderInfo from '../../../../components/Modal/OrderInfo/index.page';
import Head from 'next/head';
import CancelOrder from '../../../../components/Modal/CancelOrder/index.page';
import ChangeDate from '../../../../components/Modal/ChangeDate/index.page';
import ConfirmOrder from '../../../../components/Modal/ConfirmOrder/index.page';
import Observacao from '../../../../components/Modal/Observacao/index.page';

interface Pedido {
  id: number;
  dataCriacao: number;
  dataEntrega: number;
  valorTotal: number;
  status: string;
  observacao: string;
  obsCancelamento: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string;
  isFinalizado: number;
}

const Pedido: NextPage = () => {
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalObsOpen, setIsModalObsOpen] = useState(false)
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false)
  const [isChangeDateModalOpen, setIsChangeDateModalOpen] = useState(false)
  const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false)
  const [pedido, setPedido] = useState<Pedido>({ id: 0, dataCriacao: 0, dataEntrega: 0, valorTotal: 0, status: '', observacao: '', obsCancelamento: '', nome: '', endereco: '', cidade: '', estado: '', telefone: '', isFinalizado: 0 })
  const [pedidoId, setPedidoId] = useState(0)

  const fetchPedidoById = async () => {
    const { data, errors } = await pedidoService.listarPedidoById(pedidoId)
    if (!errors) {
      setPedido(data.pedido[0])
      setIsOrdersLoading(false)
    }
  }
  
  const handlePedidoByIdSearch = async () => {
    setIsOrdersLoading(true)
    const { data, errors } = await pedidoService.listarPedidoById(pedidoId)
    if (!errors) {
      setPedido(data.pedido[0])
      setIsOrdersLoading(false)
    }
  }

  const onRequestClose = async () => {
    setIsModalOpen(false)

    await fetchPedidoById()
  }

  const onRequestCloseCancelOrder = async () => {
    setIsCancelOrderModalOpen(false)

    await fetchPedidoById()
  }

  const onRequestCloseConfirmOrder = async () => {
    setIsConfirmOrderModalOpen(false)

    await fetchPedidoById()
  } 

  const handleConfirmOrder = async (pedido: Pedido) => {
    setPedido(pedido)
    setIsConfirmOrderModalOpen(true)
  }

  const viewOrderInfo = async (pedido: Pedido) => {
    setPedido(pedido)
    setIsModalOpen(true)
  }

  const handleCancelOrder = async (pedido: Pedido) => {
    setPedido(pedido)
    setIsCancelOrderModalOpen(true)
  }

  const onRequestCloseChangeDate = async () => {
    setIsChangeDateModalOpen(false)

    await fetchPedidoById()
  } 

  const handleChangeDate = async (pedido: Pedido) => {
    setPedido(pedido)
    setIsChangeDateModalOpen(true)
  }

  const handleChangeObs = async (pedido: Pedido) => {
    setPedido(pedido)
    setIsModalObsOpen(true)
  }

  const onRequestCloseObs = async () => {
    setIsModalObsOpen(false)

    await fetchPedidoById()
  } 

  return (
    <>
      <Head>
        <title>Pedidos por ID</title>
      </Head>
      <Container>
        <Content>
          <header>
            <h1>Pedido por ID</h1>
            <p>Digite o ID para recuperar um pedido específico e ver as informações deste.</p>
          </header>
          <section>
            <input type="text" placeholder="Pesquise por ID" 
                onChange={event => {setPedidoId(Number(event.target.value))}} 
            />
            <button onClick={handlePedidoByIdSearch}>
              Selecionar
            </button>
          </section>
        </Content>
        {isOrdersLoading && (
          <>
            <LoadingOrders>
              <Loading type='points'>Carregando pedido</Loading> 
            </LoadingOrders>          
          </>
        )}
        {pedido.id === 0 ? (
          <>
            <Orderless>
              <h1>Procura um pedido pelo seu ID!</h1>  
            </Orderless>          
          </>
        ) : (
          <>
            <TableContainer>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Data Criação</th>
                    <th>Status</th>
                    <th>Data Entrega</th>
                    <th>Valor Total</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>        
                  <tr key={pedido.id}>
                    <td>{pedido.id}</td>
                    <td>{pedido.nome}</td>
                    <td>{new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(pedido.dataCriacao)}</td>
                    <td>{pedido.status} / {pedido.isFinalizado === 1 ? 'FINALIZADO' : 'N. FINALIZ.'}</td>
                    <td>{pedido.dataEntrega ? new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(pedido.dataEntrega) : 'Sem Data'}</td>
                    <td>{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(pedido.valorTotal)}</td>
                    <td>
                      <a><Image onClick={() => {viewOrderInfo(pedido)}} src={BloomImg} alt="Visualizar" width={30} height={30} /></a>
                      {pedido.status !== 'CANCELADO' && <a><Image onClick={() => {handleCancelOrder(pedido)}} src={DeleteImg} alt="Visualizar" width={30} height={30} /></a>}
                      {pedido.status !== 'CANCELADO' && <a><Image onClick={() => {handleChangeDate(pedido)}} src={EditImg} alt="Visualizar" width={30} height={30} /></a>}
                      {pedido.status === 'CONFIRMADO' && <a><Image onClick={() => {handleConfirmOrder(pedido)}} src={ConfirmImg} alt="Confirmar" width={30} height={30} /></a>}
                      {pedido.status !== 'CANCELADO' && <a><Image onClick={() => {handleChangeObs(pedido)}} src={EditObsImg} alt="Confirmar" width={30} height={30} /></a>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </TableContainer>
          </>
        )}
      </Container>
      <ChangeDate isOpen={isChangeDateModalOpen} onRequestClose={onRequestCloseChangeDate} pedido={pedido}></ChangeDate>
      <CancelOrder isOpen={isCancelOrderModalOpen} onRequestClose={onRequestCloseCancelOrder} pedido={pedido}></CancelOrder>
      <ConfirmOrder isOpen={isConfirmOrderModalOpen} onRequestClose={onRequestCloseConfirmOrder} pedido={pedido}></ConfirmOrder>
      <OrderInfo isOpen={isModalOpen} onRequestClose={onRequestClose} pedido={pedido}/>
      <Observacao isOpen={isModalObsOpen} onRequestClose={onRequestCloseObs} pedido={pedido}></Observacao>
    </>
  )
}

export default Pedido