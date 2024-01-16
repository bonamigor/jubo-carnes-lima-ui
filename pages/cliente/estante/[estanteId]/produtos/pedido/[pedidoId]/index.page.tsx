import { NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { FormEvent, useEffect, useState } from 'react'
import toast from "react-hot-toast"
import ProductsInDemandTable from "../../../../../../../components/ProducstInDemandTable/index.page"
import { clienteService, itemPedidoService, pedidoService, produtoEstanteService } from '../../../../../../../services/index'
import { Container, Content, FormButton, FormContent, FormHeader, FormSubmitButton, PedidoData, PedidoForm } from "./produtos"

interface ProdutoNaEstanteProps {
  produtoId: number;
  nome: string;
  precoCusto?: number;
  unidade: string;
  precoVenda: number;
  quantidade: number;
  total: number;
}

interface ProdutoNoPedidoProps {
  itemPedidoId?: string;
  produtoId: string;
  nome: string;
  unidade: string;
  precoVenda: number;
  quantidade: string;
  total: number;
}

const PedidoProdutos: NextPage = () => {
  const router = useRouter()
  const { pedidoId, estanteId } = router.query
  const [produtoNaEstante, setProdutosNaEstante] = useState<ProdutoNaEstanteProps[]>([])
  const [product, setProduct] = useState<ProdutoNoPedidoProps>({ itemPedidoId: '', produtoId: '', nome: '', unidade: '', precoVenda: 0, quantidade: '', total: 0 })
  const [produtos, setProdutos] = useState<ProdutoNoPedidoProps[]>([])
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [quantidadeAntiga, setQuantidadeAntiga] = useState('')
  const [cliente, setCliente] = useState({ 
    id: 0,
    nome: '',
    cnpj: '',
    endereco: '',
    cep: '',
    email: '',
    cidade: '',
    estado: '',
    telefone: '',
    ativo: ''}
  )
  const [pedido, setPedido] = useState({ id: 0, status: '', dataCriacao: '', dataConfirmacao: '', dataCancelamento: '', dataEntrega: '', valorTotal: 0, clienteId: 0});
  const [isUpdate, setIsUpdate] = useState(false)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const fetchProdutos = async () => {
      const { data, errors } = await produtoEstanteService.listarProdutosNaEstantePedido(Number(estanteId))

      if (!errors) {
        setProdutosNaEstante(data.estante.produtos)
      }
    }

    const fetchCliente = async () => {
      const { data, errors } = await clienteService.listarUmCliente(Number(window.sessionStorage.getItem('userClientId')))

      if (!errors) {
        setCliente(data.cliente)
      }
    }

    const fetchPedido = async () => {
      const { data, errors } = await pedidoService.listarPedidoById(Number(pedidoId))

      if (!errors) {
        setPedido(data.pedido[0])
      }
    }

    fetchProdutos()
    fetchCliente()
    fetchPedido()
  }, [estanteId, pedidoId, produtos])

  const validate = () => produtoId.length > 0 && quantidade.length > 0

  useEffect(() => {
    const isValid = validate();
    setIsValid(isValid);
  }, [produtoId, quantidade])
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const { errors } = await itemPedidoService.adicionarProdutoNoPedido({
        estanteId: String(estanteId),
        produtoId: produtoId.split(' ')[0],
        precoVenda: Number(produtoId.split('R$')[1].split('/')[0].trim().replaceAll('.', '').replaceAll(',', '.')),
        quantidade: Number(quantidade.replace(',','.')),
        pedidoId: String(pedidoId)
      })

      if (!errors) {
        setProdutoId('')
        setQuantidade('')

        const newProduto: ProdutoNoPedidoProps = {
          produtoId: produtoId.split(' ')[0],
          nome: produtoId.split(' ')[1],
          unidade: produtoId.split('/')[1].trim(),
          precoVenda: Number(produtoId.split('R$')[1].split('/')[0].trim().replaceAll('.', '').replaceAll(',', '.')),
          quantidade: quantidade.replaceAll('.', ','),
          total: (Number(produtoId.split('R$')[1].split('/')[0].trim().replaceAll('.', '').replaceAll(',', '.')) * Number(quantidade))
        }
        setProduct(newProduto)

        toast.success('Produto adicionado no pedido!')
      }
    } catch (error) {
      toast.error('Erro ao adicionar o produto no pedido.')
      console.error(error)
    }
  }

  const prepareUpdate = async (produto: ProdutoNoPedidoProps) => {
    setProdutoId(`${produto.itemPedidoId} - ${produto.produtoId} . ${produto.nome} - R$ ${produto.precoVenda}/${produto.unidade}`)
    setQuantidade(String(produto.quantidade))
    setQuantidadeAntiga(produto.quantidade.split('.')[0])
    setIsUpdate(true)
  }

  const handleUpdate = async () => {
    try {
      const itemPedidoId = produtoId.split(' ')[0]
      const idProduto = produtoId.split(' ')[2]

      const { data, errors } = await itemPedidoService.atualizarItemDoPedido({
        estanteId: Number(estanteId),
        produtoId: Number(idProduto),
        pedidoId: Number(pedidoId),
        itemPedidoId: Number(itemPedidoId),
        precoVenda: Number(produtoId.split('R$')[1].split('/')[0].trim().replaceAll(',', '.')),
        quantidadeNova: Number(quantidade.replaceAll('.', '').replaceAll(',', '.')),
        quantidadeAntiga: Number(quantidadeAntiga.replaceAll('.', '').replaceAll(',', '.'))
      })

      if (!errors) {
        toast.success(data.message)
        setProdutoId('')
        setQuantidade('')
        setIsUpdate(false)

        const newProduto: ProdutoNoPedidoProps = {
          produtoId: produtoId.split(' ')[0],
          nome: produtoId.split(' ')[1],
          unidade: produtoId.split(' ')[5],
          precoVenda: Number(produtoId.split('-')[1].split('/')[0].trim().substring(3).replaceAll(',','.')),
          quantidade: quantidade.replaceAll('.', ','),
          total: (Number(produtoId.split(' ')[3].substring(3).replaceAll('.', '').replaceAll(',', '.')) * Number(quantidade))
        }
        setProduct(newProduto)
      }
    } catch (error) {
      toast.error('Erro ao atualizar Item do Pedido.')
      console.error(error)
    }
  }

  return (
    <>
      <Head>
        <title>Adicionar produtos</title>
      </Head>    
      <Container>
        <Content>
          <FormHeader>
            <h1>Adicione Produtos ao Pedido!</h1>
            <PedidoData>
              <h2>Dados Pedido N° {pedidoId}</h2>
              <div>
                <p><span>Colégio:</span> {cliente.nome}</p>
                <p><span>Data Criação:</span> {new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(new Date())}</p>
                <p><span>Status:</span> {pedido.status}</p>
              </div>
            </PedidoData>
          </FormHeader>
          <h2>Selecione os produtos, digite a quantidade desejada e clique em Adicionar!</h2>
            <PedidoForm onSubmit={handleSubmit}> 
              <FormContent>
                <div>
                  <input type="text" placeholder="Pesquise o Produto" 
                      list="produtos" id="produto-choice" name="produto-choice" autoComplete="off"
                      value={produtoId} onChange={event => {setProdutoId(event.target.value)}} />
                  <datalist id="produtos">
                    {produtoNaEstante.map(produto => {
                      return (
                      <option key={produto.produtoId} 
                        value={`${produto.produtoId} ${produto.nome} - ${new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                      }).format(produto.precoVenda)} / ${produto.unidade}`}
                      />)
                    })}
                  </datalist>
                </div>
                <input type="text" placeholder="Quantidade" value={quantidade} onChange={event => {setQuantidade(event.target.value)}} />
                <FormSubmitButton type="submit" isUpdate={isUpdate} disabled={!isValid}>Adicionar</FormSubmitButton>
                <FormButton type="button" isUpdate={isUpdate} onClick={() => handleUpdate()}>Atualizar</FormButton>
              </FormContent>
            </PedidoForm>
            <ProductsInDemandTable prepareUpdate={prepareUpdate} product={product} />
        </Content>
      </Container>
    </>
  )
}

export default PedidoProdutos
