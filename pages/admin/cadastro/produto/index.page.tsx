import { NextPage } from "next";
import Image from "next/image";
import { Container, Content, FormButton, FormItself, FormSubmitButton, InputFilter, TableContainer } from "./produto";
import EditImg from '../../../../assets/edit.png'
import DeleteImg from '../../../../assets/delete.png'
import ConfirmImg from '../../../../assets/confirm.png'
import { useState, FormEvent, useEffect } from 'react';
import { produtoService } from '../../../../services/index';
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import DeleteModal from "../../../../components/Modal/Delete/index.page";
import { useQuery } from "react-query";
import { Loading } from '@nextui-org/react';
import Head from "next/head";
import Pagination from "../../../../components/Pagination/index.page";
import UpdateProductStatus from "../../../../components/Modal/UpdateProductStatus/index.page"

export interface ProdutoProps {
  id: number;
  nome: string;
  preco: string;
  unidade: string;
  ativo: number; 
}

const CadastroProduto: NextPage = () => {
  const router = useRouter()
  const [isUpdate, setIsUpdate] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [id, setId] = useState(0)
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [unidade, setUnidade] = useState('')
  const [filter, setFilter] = useState('')
  const [filteredprodutos, setFilteredprodutos] = useState<ProdutoProps[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [postPerPage, setPostsPerPage] = useState(5)
  const [isValid, setIsValid] = useState(false)
  const [produto, setProduto] = useState<ProdutoProps>()
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false)

  const lastIndex = currentPage * postPerPage;
  const firstIndex = lastIndex - postPerPage;

  const validate = () => nome.length > 0 && preco.length > 0 && unidade.length > 0

  useEffect(() => {
    const isValid = validate();
    setIsValid(isValid);
  }, [nome, preco, unidade])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const { errors } = await produtoService.cadastrarProduto({
        nome: nome,
        precoCusto: preco.replace(',','.'),
        unidadeMedida: unidade
      })
      if (!errors) {
        toast.success('Produto cadastrado com sucesso!')
        router.reload()
      }
    } catch (error) {
      toast.error('Erro ao cadastra produto.')
      console.error(error)
    }
  }

  const VINTE_E_QUATRO_HORAS = (60 *  1000) * 60 * 24

  const { data, isLoading, isSuccess, isError } = useQuery('produtos', produtoService.listarTodosOsProdutos, { staleTime: VINTE_E_QUATRO_HORAS })

  let produtos: any;
  let produtosPaginados: any;

  if (data) {
    produtos = data.produtos
    produtosPaginados = data.produtos.slice(firstIndex, lastIndex);  
  }

  const handleFilterProdutoList = (event: any) => {
    setFilter(event.toUpperCase())
    setFilteredprodutos(produtos.filter((produto: ProdutoProps) => {
      return produto.nome.toUpperCase().includes(filter)
    }))
  }

  const prepareUpdate = async (produto: ProdutoProps) => {
    setId(produto.id)
    setNome(produto.nome)
    setPreco(String(produto.preco))
    setUnidade(produto.unidade)
    setIsUpdate(true)
  }

  const handleUpdate = async () => {
    try {
      const { errors } = await produtoService.atualizarProduto({
        nome: nome,
        precoCusto: String(preco),
        unidadeMedida: unidade,
        id: id
      })
      if (!errors) {
        toast.success('Produto atualizado com sucesso!')
        router.reload()
      }
    } catch (error) {
      toast.error('Erro ao cadastra produto.')
      console.error(error)
    }
  }

  const handleDeleteProduto = (produto: ProdutoProps) => {
    setId(produto.id)
    setIsDeleteModalOpen(true)
  }

  const onRequestClose = () => {
    setIsDeleteModalOpen(false)
    setIsUpdateStatusModalOpen(false)
  }

  const handleUpdateProductStatus = (produto: ProdutoProps) => {
    setProduto(produto)
    setIsUpdateStatusModalOpen(true)
  }

  return (
    <>
      <Head>
        <title>Cadastro de Produto</title>
      </Head>
      <Container>
        <Content>
          <h1>Cadastro de Produto</h1>
          <FormItself onSubmit={handleSubmit}>
            <div>
              <input type="text" id="name" value={nome} onChange={event => setNome(event.target.value)} placeholder="Nome" />
              <input type="text" id="price" value={preco} onChange={(event: { target: { value: any; }; }) => setPreco(event.target.value)} placeholder="Preço" />
              <select name="unities" id="unity" value={unidade} onChange={event => setUnidade(event.target.value)}>
                <option value="">Und Medida</option>
                <option value="KG">KG</option>
                <option value="PCT">PCT</option>
                <option value="UND">UND</option>
                <option value="LT">LT</option>
                <option value="L">L</option>
                <option value="MÇ">MÇ</option>
                <option value="BDJ">BDJ</option>
                <option value="CX">CX</option>
                <option value="PLT">PLT</option>
                <option value="DZ">DZ</option>
              </select>
            </div>
            <FormSubmitButton type="submit" isUpdate={isUpdate} disabled={!isValid}>Cadastrar</FormSubmitButton>
            <FormButton type="button" isUpdate={isUpdate} onClick={() => handleUpdate()}>Atualizar</FormButton>
          </FormItself>
        </Content>
        <InputFilter>
          <input type="text" placeholder="Filtre pelo nome do produto" onChange={event => handleFilterProdutoList(event.target.value)} />
        </InputFilter>
        <TableContainer>
          {isError && <div><Loading color="success" size="lg">Erro ao carregar os Produtos.</Loading></div>}
          {isLoading && <div><Loading color="success" size="lg">Carregando Produtos</Loading></div>}
          {isSuccess && (
            <table id="products-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Unidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filter.length > 1 ? (
                  filteredprodutos.map(produto => {
                    return (
                      <tr key={produto.id}>
                        <td>{produto.nome}</td>
                        <td>
                        { new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                          }).format(Number(produto.preco))}
                        </td>
                        <td>{produto.unidade}</td>
                        <td>{produto.ativo === 1 ? 'ATIVO' : 'DESATIV.'}</td>
                        <td>
                          <a><Image onClick={() => {handleUpdateProductStatus(produto)}} src={ConfirmImg} alt="Atualizar status do produto" width={30} height={30} /></a>
                          <a><Image onClick={() => prepareUpdate(produto)} src={EditImg} alt="Visualizar" width={30} height={30} /></a>
                          <a><Image onClick={() => handleDeleteProduto(produto)} src={DeleteImg} alt="Confirmar" width={30} height={30} /></a>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  produtosPaginados.map((produto: ProdutoProps) => {
                    return (
                      <tr key={produto.id}>
                        <td>{produto.nome}</td>
                        <td>
                        { new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                          }).format(Number(produto.preco))}
                        </td>
                        <td>{produto.unidade}</td>
                        <td>{produto.ativo === 1 ? 'ATIVO' : 'DESATIV.'}</td>
                        <td>
                          <a><Image onClick={() => prepareUpdate(produto)} src={EditImg} alt="Visualizar" width={30} height={30} /></a>
                          <a><Image onClick={() => handleDeleteProduto(produto)} src={DeleteImg} alt="Confirmar" width={30} height={30} /></a>
                        </td>
                      </tr>
                    )
                  })
                )}
                
              </tbody>
            </table>
          )}
        </TableContainer>
        {produtosPaginados && <Pagination totalPosts={produtos.length} postsPerPage={postPerPage} setCurrentPage={setCurrentPage} />}
        <DeleteModal isOpen={isDeleteModalOpen} onRequestClose={onRequestClose} entity='Produto' id={id} />
        <UpdateProductStatus isOpen={isUpdateStatusModalOpen} onRequestClose={onRequestClose} produto={produto as ProdutoProps} />
      </Container>
    </>
  )
}

export default CadastroProduto
