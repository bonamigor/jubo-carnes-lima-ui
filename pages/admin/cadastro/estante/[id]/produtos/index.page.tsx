import { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { FormEvent, useEffect, useState } from 'react'
import toast from "react-hot-toast"
import { useQuery, useQueryClient } from "react-query"
import ConfirmImg from '../../../../../../assets/confirm.png'
import EditImg from '../../../../../../assets/edit.png'
import UpdateStatus from "../../../../../../components/Modal/UpdateStatus/index.page"
import Pagination from "../../../../../../components/Pagination/index.page"
import { produtoService } from "../../../../../../services"
import { produtoEstanteService } from '../../../../../../services/index'
import { ProdutoProps } from '../../../produto/index.page'
import { Container, Content, FormButton, FormItself, FormSubmitButton, InputFilter, TableContainer } from "./estanteProduto"

export interface EstanteProdutoProps {
  produtoId: number;
  nome: string;
  precoCusto: number;
  unidade: string;
  precoVenda: number;
  quantidade: number;
  ativo: number;
}

const EstanteProduto: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const queryClient = useQueryClient()

  const [isUpdate, setIsUpdate] = useState(false)
  
  const [filter, setFilter] = useState('')
  const [filteredProdutosNaEstante, setFilteredProdutosNaEstante] = useState<EstanteProdutoProps[]>([])
  const [produto, setProduto] = useState<EstanteProdutoProps>()
  const [produtoId, setProdutoId] = useState('')
  const [estanteId, setEstanteId] = useState(id)
  const [precoVenda, setPrecoVenda] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [qtdProdutosEstante, setQtdProdutosEstante] = useState(0)
  const [produtoNaEstanteId, setProdutoNaEstanteId] = useState<number[]>([])
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [postPerPage, setPostsPerPage] = useState(5)
  const lastIndex = currentPage * postPerPage;
  const firstIndex = lastIndex - postPerPage;

  let produtosNaEstante: Array<EstanteProdutoProps> = [];
  let produtosNaEstantePaginados: Array<EstanteProdutoProps> = [];

  const { data: produtosNaEstanteResponse } = useQuery(['getAllProdutosNaEstante', id], () => produtoEstanteService.listarProdutosNaEstanteReactQuery(Number(id)), { staleTime: 1000 * 60 * 60 * 24 } ) 

  if (produtosNaEstanteResponse) {
    produtosNaEstante = produtosNaEstanteResponse.estante.produtos
    produtosNaEstantePaginados = produtosNaEstanteResponse.estante.produtos.slice(firstIndex, lastIndex);
  }

  let produtos: Array<ProdutoProps> = [];
  const produtosQuery = useQuery('produtos', produtoService.listarTodosOsProdutos, { staleTime: 1000 * 60 * 60 * 24 })

  if (produtosQuery.isSuccess) {
    produtos = produtosQuery.data.produtos
  }

  const [isValid, setIsValid] = useState(false)

  const validate = () => {
    return produtoId.length > 0 && quantidade.length > 0 && precoVenda.length > 0
  }

  useEffect(() => {
    const isValid = validate();
    setIsValid(isValid);
  }, [produtoId, quantidade, precoVenda])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    try {
      const { errors } = await produtoEstanteService.cadastrarProdutoNaEstante({
        idEstante: Number(id),
        idProduto: Number(produtoId.split(' ')[0]),
        precoVenda: precoVenda.replace(',','.'),
        quantidade: quantidade
      })

      if (!errors) {
        queryClient.invalidateQueries('getAllProdutosNaEstante')
        toast.success('Produto adicionado com sucesso!')
        setQtdProdutosEstante(qtdProdutosEstante + 1)
        setPrecoVenda('')
        setQuantidade('')
        setProdutoId('')
      }
    } catch (error) {
      toast.error('Erro ao adicionar o produto na estante.')
      console.error(error)
    }
  }

  const prepareUpdate = (produto: EstanteProdutoProps) => {
    const produtoId = `${produto.produtoId} - ${produto.nome} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(produto.precoVenda)}/${produto.unidade}`
    setProdutoId(produtoId)
    setPrecoVenda(String(produto.precoVenda))
    setQuantidade(String(produto.quantidade))
    setIsUpdate(true)
  }

  const handleUpdateProductStatus = (produto: EstanteProdutoProps) => {
    setProduto(produto)
    setIsUpdateStatusModalOpen(true)
  }

  const handleUpdate = async () => {
    try {
      const { errors } = await produtoEstanteService.atualizarProdutoNaEstante({
        idEstante: Number(id),
        idProduto: Number(produtoId.split(' ')[0]),
        precoVenda: precoVenda.replaceAll(',', '.'),
        quantidade: quantidade
      })

      if (!errors) {
        toast.success('Produto atualizado com sucesso!')
        router.reload()
      }
    } catch (error) {
      toast.error('Erro ao atualizar o produto na estante.')
      console.error(error)
    }
  }

  const onRequestClose = () => {
    setIsUpdateStatusModalOpen(false)
  }

  const handleFilterProdutosList = (event: any) => {
    setFilter(event.toUpperCase())
    setFilteredProdutosNaEstante(produtosNaEstante.filter((produto: EstanteProdutoProps) => {
      return produto.nome.toUpperCase().includes(filter)
    }))
  }
  
  return (
    <>
      <Head>
        <title>Produtos na Estante</title>
      </Head>
      <Container>
        <Content>
          <h1>Adicionar produtos na Estante</h1>
          <FormItself onSubmit={handleSubmit}>
            {produtosQuery.isLoading && <input type="text" placeholder="Carregando produtos..." />}
            {produtosQuery.isSuccess && (
              <>
                <input type="text" placeholder="Pesquise o Produto" 
                  list="produtos" id="produto-choice" name="produto-choice" autoComplete="off"
                  value={produtoId} onChange={event => {setProdutoId(event.target.value)}} />
                <datalist id="produtos">
                  {produtos.map(produto => {
                    return (
                    <option key={produto.id} 
                      value={`${produto.id} - ${produto.nome} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(Number(produto.preco))}/${produto.unidade}`}
                    />)
                  })}
                </datalist>
              </>
            )}
            <input type="text" placeholder="Preço" value={precoVenda} onChange={event => {setPrecoVenda(event.target.value)}} />
            <input type="text" placeholder="Quant." value={quantidade} onChange={event => {setQuantidade(event.target.value)}} />
            <FormSubmitButton type="submit" isUpdate={isUpdate} disabled={!isValid}>Adicionar</FormSubmitButton>
            <FormButton type="button" isUpdate={isUpdate} onClick={() => handleUpdate()}>Atualizar</FormButton>
          </FormItself>
        </Content>
        <InputFilter>
          <input type="text" placeholder="Filtre pelo nome do Produto" onChange={event => handleFilterProdutosList(event.target.value)} />
        </InputFilter>
        {produtosNaEstante.length < 1 ? (
          <h2>Não há produtos nessa estante (...ainda!)</h2>
        ) : (
          <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço Custo</th>
                <th>Unidade</th>
                <th>Preço Venda</th>
                <th>Quantidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filter.length > 1 ? (
                filteredProdutosNaEstante.map(produto => {
                  return (
                    <tr key={produto.produtoId}>
                      <td>{produto.nome}</td>
                      <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(produto.precoCusto)}</td>
                      <td>{produto.unidade}</td>
                      <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(produto.precoVenda)}</td>
                      <td>{produto.quantidade}</td>
                      <td>{produto.ativo}</td>
                      <td>
                        <a><Image onClick={() => {handleUpdateProductStatus(produto)}} src={ConfirmImg} alt="Atualizar status do produto" width={30} height={30} /></a>
                        <a><Image onClick={() => {prepareUpdate(produto)}} src={EditImg} alt="Visualizar" width={30} height={30} /></a>
                      </td>
                    </tr>
                  )
                })
              ) : (
                produtosNaEstantePaginados.map(produto => {
                  return (
                    <tr key={produto.produtoId}>
                      <td>{produto.nome}</td>
                      <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(produto.precoCusto)}</td>
                      <td>{produto.unidade}</td>
                      <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(produto.precoVenda)}</td>
                      <td>{produto.quantidade}</td>
                      <td>{produto.ativo === 1 ? 'ATIVO' : 'DESATIVADO'}</td>
                      <td>
                        <a><Image onClick={() => {handleUpdateProductStatus(produto)}} src={ConfirmImg} alt="Atualizar status do produto" width={30} height={30} /></a>
                        <a><Image onClick={() => {prepareUpdate(produto)}} src={EditImg} alt="Visualizar" width={30} height={30} /></a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </TableContainer>
        )}
        {produtosNaEstantePaginados.length > 0 && <Pagination totalPosts={produtosNaEstante.length} postsPerPage={postPerPage} setCurrentPage={setCurrentPage} />}
        <UpdateStatus isOpen={isUpdateStatusModalOpen} onRequestClose={onRequestClose} produto={produto as EstanteProdutoProps} estanteId={Number(id)} />
      </Container>
    </>
  )
}

export default EstanteProduto
