/* eslint-disable react-hooks/exhaustive-deps */
import { Textarea } from '@nextui-org/react'
import { NextPage } from 'next'
import Image from "next/image"
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DeleteImg from '../../assets/delete.png'
import EditImg from '../../assets/edit.png'
import { pedidoService } from '../../services'
import DeleteModal from '../Modal/Delete/index.page'
import { CancelButton, ConfirmButton, DecideButtons, TableContainer, TableFooter, TableTitle } from './productsInDemand'

interface ProductsProps {
  itemPedidoId: string;
  produtoId: string;
  nome: string;
  unidade: string;
  precoVenda: number;
  quantidade: string;
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

interface ProductsInDemandProps {
  prepareUpdate: (product: ProductsProps) => void;
  product: ProdutoNoPedidoProps;
}

const ProductsInDemandTable: NextPage<ProductsInDemandProps> = ({ prepareUpdate, product }: ProductsInDemandProps) => {
  const router = useRouter()
  const { pedidoId, estanteId } = router.query
  const [products, setProducts] = useState<ProductsProps[]>([])
  const [valorTotal, setValorTotal] = useState(0)
  const [isDeletePedidoModalOpen, setIsDeletePedidoModalOpen] = useState(false)
  const [isDeleteItemPedidoModalOpen, setIsDeleteItemPedidoModalOpen] = useState(false)
  const [idItemPedido, setIdItemPedido] = useState('')
  const [idPedido, setIdPedido] = useState('')
  const [observacao, setObservacao] = useState('')

  useEffect(() => {
    const fetchProdutosNoPedido = async () => {
      const { data, errors } = await pedidoService.listarProdutosByPedidoIdOld(Number(pedidoId))

      if (!errors) {
        setProducts(data.produtos)
      }
    }

    fetchProdutosNoPedido()
  }, [product])

  useEffect(() => {
    const fetchValorTotal = async () => {
      const { data, errors } = await pedidoService.valorTotalPedidoByPedidoId(Number(pedidoId))

      if (!errors) {
        setValorTotal(data.totalPedido)
      }
    }
    fetchValorTotal()
  }, [product, valorTotal])

  const handleDeleteItemPedido = (produtoParaDeletar: ProductsProps) => {
    setIdItemPedido(`${produtoParaDeletar.itemPedidoId} ${pedidoId} ${produtoParaDeletar.quantidade} ${estanteId} ${produtoParaDeletar.produtoId}`)
    const index = products.findIndex(product => product.itemPedidoId === produtoParaDeletar.itemPedidoId)
    delete products[index]
    setIsDeleteItemPedidoModalOpen(true)
  }

  const onRequestClosePedidoModal = () => {
    setIsDeletePedidoModalOpen(false)
  }

  const onRequestCloseItemPedidoModal = () => {
    setIsDeleteItemPedidoModalOpen(false)
    setValorTotal(0)
  }

  const handleFecharPedido = async () => {
    try {
      if (observacao != '') {
        await pedidoService.adicionarObservacao({ observacao, pedidoId: Number(pedidoId) })
      }
      const { data: totalData, errors: totalErrors } = await pedidoService.atualizarValorTotal(Number(pedidoId), valorTotal)
      const { data: finalizarData, errors: finalizarErrors } = await pedidoService.finalizarPedido(Number(pedidoId))
  
      if (!totalErrors && !finalizarErrors) {
        toast.success(totalData.message)
        router.push('/cliente/inicial')
      }
    } catch (error) {
      toast.error('Erro ao fechar o pedido.')
    }
    
  }

  const handleDeletePedido = () => {
    setIdPedido(String(pedidoId))
    setIsDeletePedidoModalOpen(true)
  }

  return (
    <>
      {products.length < 1 ? (
        <div>
            <h1>Não há produtos nesse pedido (ainda...!)</h1>
        </div>
      ) : (
        <>
          <TableTitle>
            <h2><b>Produtos adicionados ao pedido:</b></h2>
          </TableTitle>
          <TableContainer>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Preço / Unidade</th>
                  <th>Quantidade</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {
                  products.map(product => {
                    return (
                      <tr key={String(product.itemPedidoId)}>
                        <td>{product.nome}</td>
                        <td>
                          {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                          }).format(product.precoVenda)} / {product.unidade}
                        </td>
                        <td>{product.quantidade.replaceAll('.', ',')}</td>
                        <td>
                          {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                          }).format(product.total)}
                        </td>
                        <td>
                          <a><Image onClick={() => prepareUpdate(product)} src={EditImg} alt="Visualizar" width={30} height={30} /></a>
                          <a><Image onClick={() => handleDeleteItemPedido(product)} src={DeleteImg} alt="Confirmar" width={30} height={30} /></a>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </TableContainer>
          <TableFooter>
            <h4>
              Valor Total: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(valorTotal)}
            </h4>
          </TableFooter>
          <Textarea placeholder="Deixe uma observação para o fornecedor. OBS.: A observação não pode conter mais de 255 caracteres;" size="lg" css={{ mt: "1.5rem", w: "1000px" }} value={observacao} onChange={event => setObservacao(event.target.value)} />
          <DecideButtons>
            <ConfirmButton onClick={handleFecharPedido} disabled={!(products.length > 0)}>Finalizar Pedido</ConfirmButton>
            <CancelButton onClick={handleDeletePedido}>Cancelar Pedido</CancelButton>
          </DecideButtons>
          <DeleteModal isOpen={isDeletePedidoModalOpen} onRequestClose={onRequestClosePedidoModal} entity='Pedido' id={idPedido} />
          <DeleteModal isOpen={isDeleteItemPedidoModalOpen} onRequestClose={onRequestCloseItemPedidoModal} entity='ItemPedido' id={String(idItemPedido)} />
        </>
      )}
    </>
  )
}

export default ProductsInDemandTable
