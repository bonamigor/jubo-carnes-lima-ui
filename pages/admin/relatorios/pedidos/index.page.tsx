import { NextPage } from 'next';
import { useQuery } from 'react-query';
import { clienteService } from '../../../../services';
import { Container, Content, Orderless, TableContainer, LoadingOrders } from './pedidos';
import { useState } from 'react';
import { pedidoService } from '../../../../services/index';
import toast from 'react-hot-toast';
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
import { PedidosProps } from '../../../../services/pedido';

interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
  endereco: string;
  cep: string;
  email: string;
  cidade: string;
  estado: string;
  telefone: string;
  ativo: boolean;
}

const Pedidos: NextPage = () => {
  const [clienteId, setClienteId] = useState('')
  const [previousClientId, setPreviousClientId] = useState(0)
  const [pedidos, setPedidos] = useState<PedidosProps[]>([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalObsOpen, setIsModalObsOpen] = useState(false)
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false)
  const [isChangeDateModalOpen, setIsChangeDateModalOpen] = useState(false)
  const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false)
  const [pedido, setPedido] = useState<PedidosProps>({ id: 0, dataCriacao: 0, dataEntrega: 0, valorTotal: 0, status: '', observacao: '', obsCancelamento: '', nome: '', endereco: '', cidade: '', estado: '', telefone: '', isFinalizado: 0 })



  let clientes: Array<Cliente> = [];

  const { data, isLoading, isSuccess, isError } = useQuery('clientes', clienteService.listarTodosOsClientesNew, { staleTime: Infinity })

  if (isSuccess) {
    clientes = data.clientes
  }

  const fetchPedidosByClienteOnRequestClose = async () => {
    const { data, errors } = await pedidoService.listarPedidosByCliente(previousClientId)

    if (!errors) {
      setIsOrdersLoading(false)
      setPedidos(data.pedidos)
      setClienteId('')
    } else {
      toast.error('Erro ao listar os pedidos.')
    }
  }

  const handleClientSelection = async () => {
    setIsOrdersLoading(true)

    const idCliente: number = Number(clienteId.split(' ')[0])
    setPreviousClientId(idCliente)
    
    const { data, errors } = await pedidoService.listarPedidosByCliente(idCliente)

    if (!errors) {
      setIsOrdersLoading(false)
      setPedidos(data.pedidos)
      setClienteId('')
    } else {
      toast.error('Erro ao listar os pedidos.')
    }
  }

  const onRequestClose = async () => {
    setIsModalOpen(false)

    await fetchPedidosByClienteOnRequestClose()
  }

  const onRequestCloseCancelOrder = async () => {
    setIsCancelOrderModalOpen(false)

    await fetchPedidosByClienteOnRequestClose()
  }

  const onRequestCloseChangeDate = async () => {
    setIsChangeDateModalOpen(false)

    await fetchPedidosByClienteOnRequestClose()
  } 

  const onRequestCloseConfirmOrder = async () => {
    setIsConfirmOrderModalOpen(false)

    await fetchPedidosByClienteOnRequestClose()
  } 

  const onRequestCloseObs = async () => {
    setIsModalObsOpen(false)

    await fetchPedidosByClienteOnRequestClose()
  } 

  const handleChangeObs = async (pedido: PedidosProps) => {
    setPedido(pedido)
    setIsModalObsOpen(true)
  }

  const handleViewOrderInfo = async (pedido: PedidosProps) => {
    setPedido(pedido)
    setIsModalOpen(true)
  }

  const handleCancelOrder = async (pedido: PedidosProps) => {
    setPedido(pedido)
    setIsCancelOrderModalOpen(true)
  }

  const handleChangeDate = async (pedido: PedidosProps) => {
    setPedido(pedido)
    setIsChangeDateModalOpen(true)
  }

  const handleConfirmOrder = async (pedido: PedidosProps) => {
    setPedido(pedido)
    setIsConfirmOrderModalOpen(true)
  }

  return (
    <>
      <Head>
        <title>Pedidos por Cliente</title>
      </Head>
      <Container>
        <Content>
          <header>
            <h1>Pedidos por Cliente</h1>
            <p>Selecione o Cliente para ver os seus pedidos.</p>
          </header>
          <section>
            {isLoading && <input disabled placeholder='Carregando os clientes'></input>}
            {isError && <h1>Erro ao carregar os Clientes</h1>}
            {isSuccess && 
              <>
                <input type="text" placeholder="Pesquise o Cliente" 
                  list="clientes" id="cliente-choice" name="cliente-choice" autoComplete="off"
                  value={clienteId} onChange={event => {setClienteId(event.target.value)}} 
                />
                <datalist id="clientes">
                  {clientes.map(cliente => {
                    return (<option key={cliente.id} value={`${cliente.id} - ${cliente.nome}`} />)
                  })}
                </datalist>
                <button onClick={handleClientSelection}>
                  Selecionar
                </button>
              </>
            }
          </section>
        </Content>
        {isOrdersLoading && (
          <>
            <LoadingOrders>
              <Loading type='points'>Carregando produtos</Loading> 
            </LoadingOrders>          
          </>
        )}
        {!isOrdersLoading && pedidos.length === 0 ? (
          <>
            <Orderless>
              <h1>Não há pedidos para exibir aqui.</h1>  
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
                  {pedidos.map(pedido => {
                    return (
                      <tr key={pedido.id}>
                        <td>{pedido.id}</td>
                        <td>{pedido.nome}</td>
                        <td>{new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(pedido.dataCriacao)}</td>
                        <td>{pedido.status} / {pedido.isFinalizado === 1 ? 'FINALIZADO' : 'N. FINALIZ.'}</td>
                        <td>{pedido.dataEntrega ? new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(pedido.dataEntrega) : 'Sem Data'}</td>
                        <td>{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(pedido.valorTotal)}</td>
                        <td>
                          <a><Image onClick={() => {handleViewOrderInfo(pedido)}} src={BloomImg} alt="Visualizar" width={30} height={30} /></a>
                          {pedido.status !== 'CANCELADO' && <a><Image onClick={() => {handleCancelOrder(pedido)}} src={DeleteImg} alt="Excluir" width={30} height={30} /></a>}
                          {pedido.status !== 'CANCELADO' && <a><Image onClick={() => {handleChangeDate(pedido)}} src={EditImg} alt="Editar" width={30} height={30} /></a>}
                          {pedido.status === 'CONFIRMADO' && <a><Image onClick={() => {handleConfirmOrder(pedido)}} src={ConfirmImg} alt="Confirmar" width={30} height={30} /></a>}
                          {pedido.status !== 'CANCELADO' && <a><Image onClick={() => {handleChangeObs(pedido)}} src={EditObsImg} alt="Confirmar" width={30} height={30} /></a>}
                        </td>
                      </tr>
                    )
                  })}
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

export default Pedidos