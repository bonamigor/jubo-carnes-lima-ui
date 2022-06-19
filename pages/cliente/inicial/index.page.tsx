import { NextPage } from "next";
import { Container, Content, TableContainer } from "./inicial";
import { useState, useEffect } from 'react';
import { pedidoService } from '../../../services/index';
import Image from "next/image";
import BloomImg from '../../../assets/bloom.png'
import OrderInfo from "../../../components/Modal/Cliente/OrderInfo/index.page";
import Head from "next/head";

interface PedidosProps {
  id: number;
  dataCriacao: string;
  dataEntrega: string;
  valorTotal: number;
  status: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string;
}

const Inicial: NextPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pedido, setPedido] = useState<PedidosProps>({ id: 0, dataCriacao: '', dataEntrega: '', valorTotal: 0, status: '', nome: '', endereco: '', cidade: '', estado: '', telefone: '' })

  useEffect(() => {
    const fetchLastOrder = async () => {
      try {
        const clienteId = window.sessionStorage.getItem('userClientId')
        const { data, errors } = await pedidoService.listarUltimoPedidoByCliente(Number(clienteId))

        if (!errors) {
          setPedido(data.pedido)
        }
      } catch (error) {
        
      }
    }

    fetchLastOrder()
  }, [])

  const onRequestClose = async () => {
    setIsModalOpen(false)
  }

  const viewOrderInfo = async (pedido: PedidosProps) => {
    setPedido(pedido)
    setIsModalOpen(true)
  }

  return (
    <>
      <Head>
        <title>Jubo Notas - Início</title>
      </Head>
      <Container>
        <Content>
          <h1>Último pedido feito!</h1>
          <p>Caso exista, aqui apareceram os dados do seu último pedido, clique na Lupa para mais detalhes!</p>

          <TableContainer>
            {pedido ? (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Nº</th>
                      <th>Data Criação</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>{pedido.id}</td>
                      <td>
                        {pedido.dataCriacao === '' ? '' : new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'})
                              .format(new Date(pedido.dataCriacao))}
                      </td>
                      <td>
                        { new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(pedido.valorTotal)}
                      </td>
                      <td>{pedido.status}</td>
                      <td>
                        <a><Image onClick={() => {viewOrderInfo(pedido)}} src={BloomImg} alt="Visualizar" width={30} height={30} /></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <h2>Não existem pedidos feitos por você. <br />Clique em Realizar Pedido!</h2>
              </>
            )}
          </TableContainer>
        </Content>
      </Container>
      <>
      {pedido ? (
        <OrderInfo isOpen={isModalOpen} onRequestClose={onRequestClose} pedido={pedido}/>
      ) : (
        <></>
      )}
      </>
      
    </>
  )
}

export default Inicial
