import { NextPage } from "next";
import { Container, Content, InputFilter, TableContainer } from "./estante";
import { useState, useEffect, FormEvent } from 'react';
import { estanteService } from "../../../../../services";
import Image from "next/image";
import AddImg from '../../../../../assets/add.png'
import { useRouter } from 'next/router';
import Head from "next/head";

interface EstanteClienteProps {
  id: number;
  periodo: string;
  clienteId: number;
  cliente: string;
  observacao: string;
  ativa: number;
}

const EstanteCliente: NextPage = () => {
  const router = useRouter()
  const [estantes, setEstantes] = useState<EstanteClienteProps[]>([])
  const [filter, setFilter] = useState('')
  const [filteredEstantes, setFilteredEstantes] = useState<EstanteClienteProps[]>([])
  const { pedidoId, estanteId } = router.query 

  const handleFilterEstanteList = (event: any) => {
    setFilter(event)
    setFilteredEstantes(estantes.filter(estante => {
      return estante.periodo.includes(filter)
    }))
  }

  useEffect(() => {
    const clienteId = window.sessionStorage.getItem('userClientId')
    const fetchEstantes = async () => {
      const { data, errors } = await estanteService.listarEstantesDoCliente(Number(clienteId))
      if (!errors) {
        setEstantes(data.estantes)
      }
    }
    fetchEstantes()
  }, [])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    console.log(estanteId)
  }

  return (
    <>
      <Head>
        <title>Realizar Pedido</title>
      </Head>    
      <Container>
        <Content>
          <h1>Estantes (ativas) cadastradas para você!</h1>
          <h2>Selecione a estante para realizar o pedido</h2>
        </Content>
        <InputFilter>
          <input type="text" placeholder="Filtre pelo período" onChange={event => handleFilterEstanteList(event.target.value)} />
        </InputFilter>
        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Período</th>
                <th>Observação</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filter.length > 1 ? (
                filteredEstantes.map(estante => {
                  return (
                    <tr key={estante.id}>
                      <td>{estante.id}</td>
                      <td>{estante.cliente}</td>
                      <td>{estante.periodo}</td>
                      <td>{estante.observacao}</td>
                      <td>
                        <a><Image onClick={() => router.push(`/cliente/pedido/${pedidoId}/estante/${estante.id}/produtos`)} src={AddImg} alt="Adicionar" width={30} height={30} /></a>
                      </td>
                    </tr>
                  )
                })
              ) : (
                estantes.map(estante => {
                  return (
                    <tr key={estante.id}>
                      <td>{estante.id}</td>
                      <td>{estante.cliente}</td>
                      <td>{estante.periodo}</td>
                      <td>{estante.observacao}</td>
                      <td>
                        <a><Image onClick={() => router.push(`/cliente/pedido/${pedidoId}/estante/${estante.id}/produtos`)} src={AddImg} alt="Adicionar" width={30} height={30} /></a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  )
}

export default EstanteCliente
