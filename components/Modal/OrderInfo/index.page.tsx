import { Loading, Textarea } from '@nextui-org/react'
import jsPDF from "jspdf"
import 'jspdf-autotable'
import autoTable from 'jspdf-autotable'
import { NextPage } from 'next'
import Image from "next/image"
import { useRouter } from 'next/router'
import { KeyboardEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import InputMask from "react-input-mask"
import Modal from 'react-modal'
import { useQuery, useQueryClient } from 'react-query'
import DeleteImg from '../../../assets/delete.png'
import EditImg from '../../../assets/edit.png'
import { itemPedidoService, pedidoService } from '../../../services'
import { PedidosProps } from '../../../services/pedido'
import DeleteModal from '../Delete/index.page'
import { CancelSection, ConfirmSection, Container, GeneratePdf, Observacao, OrderFooter, OrderHeader, OrderItems } from './orderInfo'

interface ProductsProps {
  estanteId: string;
  itemPedidoId?: string;
  produtoId?: string;
  nome: string;
  unidade: string;
  quantidade: string;
  precoVenda: string;
  total: string;
}

interface OrderInfoModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  pedido: PedidosProps;
}

interface EmpresaProps {
  attribute: string;
  displayName: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
}

const empresas: Array<EmpresaProps> = [
  {
    attribute: 'kidelicia',
    displayName: 'Kidelicia',
    nome: 'Panificadora e Lanchonete Kidelicia',
    cnpj: '02.895.623/0001-03',
    endereco: 'Rua Pinheiro Chagas, 171, Setor Sudoeste, 74303-035',
    cidade: 'Goiânia',
    estado: 'Goiás'
  },
  {
    attribute: 'coperal',
    displayName: 'COPERAL',
    nome: 'COPERAL',
    cnpj: '46.258.870/0001-66',
    endereco: 'Rua 26 de setembro, nº 21, lt. 23, Setor Estrela Dalva',
    cidade: 'Goiânia',
    estado: 'Goiás'
  },
  {
    attribute: 'coopassen',
    displayName: 'COOPASSEN',
    nome: 'COOPASSEN',
    cnpj: '36.070.538/0001-10',
    endereco: 'R. Padre Alcides Spolidoro, S/N, Q. I4 L. 11/12, Dist Ind Santa Edwiges',
    cidade: 'Senador Canedo',
    estado: 'Goiás'
  },
  {
    attribute: 'coopaco',
    displayName: 'COOPACO',
    nome: 'COOPACO',
    cnpj: '33.507.873/0001-44',
    endereco: 'Rua 03, QD. 07, LT. 13, Sala 03, Recanto das Emboabas',
    cidade: 'Aparecida de Goiânia',
    estado: 'Goiás'
  },
  {
    attribute: 'compaf',
    displayName: 'COMPAF',
    nome: 'COMPAF',
    cnpj: '29.119.413/0001-71',
    endereco: 'ROD GO-320 KM 10.5 n 100, LT. 11 QD. 03, RES BOA ESPERANCA',
    cidade: 'Goiatuba',
    estado: 'Goiás'
  },
  {
    attribute: 'coopanira',
    displayName: 'COOPANIRA',
    nome: 'COOPANIRA',
    cnpj: '50.702.609/0001-80',
    endereco: 'Rua José Caitano Leal, Quadra 17, Lote 33, Setor Sul',
    cidade: 'Goianira',
    estado: 'Goiás'
  }
]

const OrderInfo: NextPage<OrderInfoModalProps> = ({ isOpen, onRequestClose, pedido }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [dataEntrega, setDataEntrega] = useState('')
  const [empresa, setEmpresa] = useState(0)
  const [observacaoPedidoInicial, setObservacaoPedidoInicial] = useState('')
  const [observacaoPedido, setObservacaoPedido] = useState('')
  const [obsCancelamento, setobsCancelamento] = useState('')
  const [isValidConfirmar, setIsValidConfirmar] = useState(false)
  const [idItemPedido, setIdItemPedido] = useState('')
  const [isDeleteItemPedidoModalOpen, setIsDeleteItemPedidoModalOpen] = useState(false)
  const [valorTotal, setValorTotal] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [isUpdateItem, setIsUpdateItem] = useState(false)
  const [previousIndex, setPreviousIndex] = useState(0)

  const { data, error, isLoading, isSuccess, isError } = useQuery(['produtosPedido', pedido.id], () => pedidoService.listarProdutosByPedidoId(pedido.id), { refetchOnWindowFocus: false, enabled: isOpen })

  let products: Array<ProductsProps> = [];
  
  if (isSuccess) {
    products = data.produtos
    const fetchValorTotal = async () => {
      const { data, errors } = await pedidoService.recuperarValorTotal(pedido.id)
  
      if (!errors) {
        setValorTotal(data.valorTotal)
      }
    }

    fetchValorTotal()
  }

  const confirmOrder = async () => {
    const dataFormatada = new Date(dataEntrega.split('/').reverse().join('-')).getTime()
    let observacaoData: any;
    let observacaoErrors: any;

    try {
      const { data: confirmarData, errors: confirmarErrors } = await pedidoService.confirmarPedidoById({ pedidoId: pedido.id, dataEntrega: dataFormatada })
      const { data: empresaData, errors: empresaErrors } = await pedidoService.setarEmpresaAoPedido(pedido.id, empresa)
      if (observacaoPedidoInicial !== observacaoPedido) {
        const result = await pedidoService.adicionarObservacao({ observacao: observacaoPedido, pedidoId: pedido.id })
        observacaoData = result.data
        observacaoErrors = result.errors
      }

      if (!confirmarErrors && !empresaErrors && !observacaoErrors) {
        toast.success(confirmarData.message)
        onRequestClose()
        router.reload()
      } else {
        toast.error('Não foi possível confirmar o pedido, verifique!')
      }
    } catch (error) {
      toast.error('Erro ao confirmar o pedido.')
      console.error(error)
    }
  }

  const cancelOrder = async () => {
    try {
      const { data, errors } = await pedidoService.cancelarPedidoByIdComObservacao({ pedidoId: pedido.id, observacao: obsCancelamento })

      if (!errors) {
        queryClient.setQueryData('getPedidosForDashboard', { pedidos: [] })
        queryClient.invalidateQueries('getPedidosForDashboard')
        toast.success(data.message)
        onRequestClose()
        // router.reload()
      } else {
        toast.error('Não foi possível cancelar o pedido, verifique!')
      }
    } catch (error) {
      toast.error('Erro ao cancelar o pedido.')
      console.error(error)
    }
  }

  const generatePdf = () => {
    const doc = new jsPDF('l')

    products.forEach(product => {
      delete product['produtoId'];
      delete product['itemPedidoId'];
    })

    const formatedPrices = products.map(produto => {
      produto.quantidade = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 4
      }).format(Number(produto.quantidade))
      produto.precoVenda = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(produto.precoVenda))
      produto.total = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(produto.total))
      return { nome: produto.nome, unidade: produto.unidade, quantidade: produto.quantidade, precoVenda: produto.precoVenda, total: produto.total }
    })

    // const teste = formatedPrices.map(produto => {
    //   return { nome: produto.nome, unidade: produto.unidade, quantidade: produto.quantidade, precoVenda: produto.precoVenda, total: produto.total }
    // })

    const newProdutosArray = formatedPrices.map(produto => {
      return Object.values(produto)
    })

    let pageNumber = doc.internal.pages.length - 1
    const idEmpresa = pedido.empresa ?? empresa

    doc.text(`${empresas[idEmpresa].nome}`, 14, 15)
    doc.text(`${empresas[idEmpresa].nome}`, 154, 15)

    doc.setFontSize(10)
    doc.text(`CNPJ: ${empresas[idEmpresa].cnpj}`, 14, 20)
    doc.text(`CNPJ: ${empresas[idEmpresa].cnpj}`, 154, 20)

    doc.text(`Endereço: ${empresas[idEmpresa].endereco}`, 14, 25)
    doc.text(`Endereço: ${empresas[idEmpresa].endereco}`, 154, 25)

    doc.text(`Cidade / Estado: ${empresas[idEmpresa].cidade} / ${empresas[idEmpresa].estado}`, 14, 30)
    doc.text(`Cidade / Estado: ${empresas[idEmpresa].cidade} / ${empresas[idEmpresa].estado}`, 154, 30)

    doc.text('____________________________________________________________________________________________________________________________________________________________________________________________________________________________________________', 0, 32.5)

    doc.text(`Pedido ${pedido.id}`, 14, 40)
    doc.text(`Pedido ${pedido.id}`, 154, 40)

    doc.setFontSize(10)
    doc.text(`Cliente: ${pedido.nome}`, 14, 45)
    doc.text(`Cliente: ${pedido.nome}`, 154, 45)

    doc.text(`Endereço: ${pedido.endereco}`, 14, 50)
    doc.text(`Endereço: ${pedido.endereco}`, 154, 50)

    doc.text(`Cidade/Estado: ${pedido.cidade} / ${pedido.estado}`, 14, 55)
    doc.text(`Cidade/Estado: ${pedido.cidade} / ${pedido.estado}`, 154, 55)

    doc.text(`Telefone: ${pedido.telefone}`, 14, 60)
    doc.text(`Telefone: ${pedido.telefone}`, 154, 60)

    if (!pedido.dataEntrega) {
      doc.text(`Data de Entrega: ${dataEntrega}`, 14, 65)
      doc.text(`Data de Entrega: ${dataEntrega}`, 154, 65)
    } else {
      doc.text(`Data de Entrega: ${new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(pedido.dataEntrega))}`, 14, 65)
      doc.text(`Data de Entrega: ${new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(pedido.dataEntrega))}`, 154, 65)
    }

    let columns = [
      { header: 'Nome', dataKey: 'nome' },
      { header: 'Und', dataKey: 'unidade' },
      { header: 'Qtde', dataKey: 'quantidade' },
      { header: 'Preço', dataKey: 'preco' },
      { header: 'Total', dataKey: 'total' }
    ]

    autoTable(doc, {
      head: [['Nome', 'Und', 'Qtde', 'Preço', 'Total']],
      headStyles: { fillColor: [255, 255, 255], textColor: 'black ' },
      columns: columns,
      body: newProdutosArray,
      theme: 'grid',
      startY: 70,
      tableWidth: 130,
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.5 },
      margin: { right: 125, bottom: 15 },
      showHead: 'firstPage',
      styles: { overflow: 'visible', fontSize: 8 },
      columnStyles: { 'nome': { overflow: 'ellipsize', cellWidth: 'auto' } },
      pageBreak: 'auto'
    })

    doc.setPage(pageNumber)

    autoTable(doc, {
      head: [['Nome', 'Und', 'Qtde', 'Preço', 'Total']],
      headStyles: { fillColor: [255, 255, 255], textColor: 'black ' },
      columns: columns,
      body: newProdutosArray,
      theme: 'grid',
      startY: 70,
      tableWidth: 130,
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.5 },
      margin: { left: 153, bottom: 15 },
      showHead: 'firstPage',
      styles: { overflow: 'visible', fontSize: 8 },
      columnStyles: { 'nome': { overflow: 'ellipsize', cellWidth: 'auto' } },
      pageBreak: 'auto'
    })

    const numberOfPages = (doc as any).internal.getNumberOfPages();
    const pageSize = doc.internal.pageSize
    let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
    let finalY = (doc as any).lastAutoTable.finalY;
    const valorTotal = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(pedido.valorTotal))

    if (finalY <= 180) {
      doc.text(`Valor Total: `, 14, finalY + 5)
      doc.text(`${valorTotal}`, 125, finalY + 5)

      doc.text(`Valor Total: `, 154, finalY + 5)
      doc.text(`${valorTotal}`, 264, finalY + 5)

      doc.text('____________________________________________________________________________________________________________________________________________________________________________________________________________________________________________', 0, finalY + 8)

      const linhas1: Array<string> = [];

      let obs: string;

      if (pedido.status === 'CANCELADO') {
        obs = `MOTIVO CANCELAMENTO: ${pedido.obsCancelamento as string}`
      } else {
        obs = pedido.observacao !== observacaoPedido ? observacaoPedido : pedido.observacao
      }

      if (obs) {
        if (obs.length > 58) {
          let contadorInicial: number = 0;
          let contadorFinal: number = 58;
          const numeroDeLinhas = obs.length / 58;
          for (let i = 0; i <= numeroDeLinhas; i++) {
            linhas1.push(obs.substring(contadorInicial, contadorFinal))
            contadorInicial = contadorInicial + 58
            contadorFinal = contadorFinal + 58
          }
          doc.text('Observação: ', 14, finalY + 15)
          doc.text('Observação: ', 154, finalY + 15)
          doc.text(linhas1, 35, finalY + 15)
          doc.text(linhas1, 175, finalY + 15)
        } else {
          doc.text(`Observação: ${obs ?? '_______________________________________________________'}`, 14, finalY + 20)
          doc.text(`Observação: ${obs ?? '_______________________________________________________'}`, 154, finalY + 20)
        }
      } else {
        doc.text(`Observação: ${obs ?? '_______________________________________________________'}`, 14, finalY + 20)
        doc.text(`Observação: ${obs ?? '_______________________________________________________'}`, 154, finalY + 20)
      }

      doc.text(`Assinatura: ________________________________________________________`, 14, finalY + 30)
      doc.text(`Assinatura: ________________________________________________________`, 154, finalY + 30)

      let pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()
      doc.text(pedido.nome, pageWidth / 4, finalY + 35, { align: 'center' })
      doc.text(pedido.nome, pageWidth - (pageWidth / 4), finalY + 35, { align: 'center' })
    }

    if (finalY >= 180) {
      doc.addPage()

      doc.setPage(numberOfPages + 1)

      doc.text(`Valor Total: `, 14, 20)
      doc.text(`${valorTotal}`, 125, 20)

      doc.text(`Valor Total: `, 154, 20)
      doc.text(`${valorTotal}`, 265, 20)

      doc.text('____________________________________________________________________________________________________________________________________________________________________________________________________________________________________________', 0, 23)

      const linhas1: Array<string> = [];
      const obs: string = pedido.observacao ?? observacaoPedido

      if (obs) {
        if (obs.length > 58) {
          let contadorInicial: number = 0;
          let contadorFinal: number = 58;
          const numeroDeLinhas = obs.length / 58;
          for (let i = 0; i <= numeroDeLinhas; i++) {
            linhas1.push(obs.substring(contadorInicial, contadorFinal))
            contadorInicial = contadorInicial + 58
            contadorFinal = contadorFinal + 58
          }
          doc.text('Observação: ', 14, 30)
          doc.text('Observação: ', 154, 30)
          doc.text(linhas1, 35, 30)
          doc.text(linhas1, 175, 30)
        } else {
          doc.text(`Observação: ${obs ?? '_______________________________________________________'}`, 14, 35)
          doc.text(`Observação: ${obs ?? '_______________________________________________________'}`, 154, 35)
        }
      } else {
        doc.text(`Observação: ${obs ?? '_______________________________________________________'}`, 14, 35)
        doc.text(`Observação: ${obs ?? '_______________________________________________________'}`, 154, 35)
      }

      doc.text(`Assinatura: ________________________________________________________`, 14, 45)
      doc.text(`Assinatura: ________________________________________________________`, 154, 45)

      let pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()
      doc.text(pedido.nome, pageWidth / 4, finalY + 45, { align: 'center' })
      doc.text(pedido.nome, pageWidth - (pageWidth / 4), finalY + 45, { align: 'center' })
    }

    const numberOfPagesAtt = (doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= numberOfPagesAtt; i++) {
      doc.setPage(i);
      if (i > 1) {
        doc.text(`Pedido ${pedido.id}`, 14, 10)
        doc.text(`Pedido ${pedido.id}`, 154, 10)
      }
      doc.text(`Pagina ${i}/${numberOfPagesAtt}`, 127, 10)
      doc.text(`Pagina ${i}/${numberOfPagesAtt}`, 266, 10)
    }

    doc.save(`pedido-${pedido.id}.pdf`)
  }

  const handleOptionEmpresa = (event: any) => {
    setEmpresa(event.target.value)
  }

  const validateConfirmar = () => dataEntrega.length > 0

  useEffect(() => {
    const isValid = validateConfirmar();
    setIsValidConfirmar(isValid);
  }, [dataEntrega])

  useEffect(() => {
    if (pedido.status === 'CANCELADO') {
      setObservacaoPedidoInicial(pedido.obsCancelamento as string)
      setObservacaoPedido(pedido.obsCancelamento as string)
    } else {
      setObservacaoPedidoInicial(pedido.observacao as string)
      setObservacaoPedido(pedido.observacao as string)
    }
  }, [pedido])

  const prepareUpdateItemPedido = (product: ProductsProps) => {
    setIsUpdateItem(!isUpdateItem)
    setPreviousIndex(Number(product.itemPedidoId))
  }

  const handleUpdateItemPedido = async (product: ProductsProps, event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      alert(`Deseja mudar a quantidade de ${product.quantidade} para ${quantidade}???????`)

      try {
        const { data, errors } = await itemPedidoService.atualizarItemDoPedido({
          estanteId: Number(product.estanteId),
          produtoId: Number(product.produtoId),
          pedidoId: Number(pedido.id),
          itemPedidoId: Number(product.itemPedidoId),
          precoVenda: Number(product.precoVenda),
          quantidadeAntiga: Number(product.quantidade.replaceAll('.', '').replaceAll(',', '.')),
          quantidadeNova: Number(quantidade.replaceAll('.', '').replaceAll(',', '.'))
        })

        if (!errors) {
          queryClient.invalidateQueries('produtosPedido')
          toast.success('Produto alterado com sucesso!')
          setIsUpdateItem(false)
        }
      } catch (error) {
        toast.error(String(error))
      }
    }
  }

  const handleDeleteItemPedido = (product: ProductsProps) => {
    setIdItemPedido(`${product.itemPedidoId} ${pedido.id} ${product.quantidade} ${product.estanteId} ${product.produtoId}`)
    const index = products.findIndex(productInArray => productInArray.itemPedidoId === product.itemPedidoId)
    delete products[index]
    setIsDeleteItemPedidoModalOpen(true)
  }

  const onRequestCloseItemPedidoModal = () => {
    setIsDeleteItemPedidoModalOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="react-modal-overlay"
      className="react-modal-content"
    >
      <Container>
        <OrderHeader>
          <h1>Informações do Pedido</h1>
          <div>
            <p>ID: {pedido.id}</p> -
            <p>Colégio: {pedido.nome}</p> -
            <p>Cidade/Estado: {`${pedido.cidade}/${pedido.estado}`}</p>
          </div>
        </OrderHeader>
        <OrderItems showScrollBar={products.length >= 5}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Unidade</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (<div><Loading type='points'>Carregando produtos...</Loading></div>)}
              {isSuccess && (
                products.map(product => {
                  return (
                    <tr key={String(product.itemPedidoId)}>
                      <td>{product.itemPedidoId}</td>
                      <td>{product.nome}</td>
                      <td>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(product.precoVenda))}
                      </td>
                      <td>{product.unidade}</td>
                      <td>{(isUpdateItem && (previousIndex === Number(product.itemPedidoId))) ? 
                        <input 
                        onKeyUp={event => { handleUpdateItemPedido(product, event) }}
                        onChange={event => { setQuantidade(event.target.value) }} /> : 
                        product.quantidade.replaceAll('.', ',')}</td>
                      <td>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(product.total))}
                      </td>
                      <td>
                        <div>
                          <a><Image onClick={() => {prepareUpdateItemPedido(product)}} src={EditImg} alt="Atualizar item do pedido" width={50} height={50} /></a>
                          <a><Image onClick={() => {handleDeleteItemPedido(product)}} src={DeleteImg} alt="Deletar item do pedido" width={50} height={50} /></a>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          <h3>
            Valor Total: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(Number(valorTotal))}
          </h3>
          <Observacao>
            <Textarea initialValue={pedido.status === 'CANCELADO' ? pedido.obsCancelamento : pedido.observacao ?? 'Sem observacao'} onChange={event => { setObservacaoPedido(event.target.value) }} css={{ mt: "1.5rem", w: "900px" }} />
          </Observacao>
        </OrderItems>
        <OrderFooter>
          {pedido.status === 'CRIADO' || pedido.status === 'CONFIRMADO' ? (
            <>
              <ConfirmSection>
                <h2>Deseja {pedido.status === 'CRIADO' ? 'confirmar?' : 'gerar PDF?'}</h2>
                {pedido.status === 'CRIADO' &&
                  <div>
                    <InputMask mask="99/99/9999" placeholder='Data de Entrega' onChange={event => { setDataEntrega(event.target.value) }} />
                    {pedido.status === 'CRIADO' && <button onClick={confirmOrder} disabled={!isValidConfirmar}>Confirmar Pedido</button>}
                  </div>
                }
                <div>
                  <button onClick={generatePdf}>Criar PDF</button>
                </div>
                <div id='empresa'>
                {
                  empresas.map((empresa, index) => {
                    return (
                      <label key={empresa.attribute} htmlFor={empresa.attribute}>
                        <input type="radio" name={empresa.attribute} id={empresa.attribute} value={index} onChange={handleOptionEmpresa} />
                        {empresa.displayName}
                      </label>
                    )
                  })
                }
                </div>
              </ConfirmSection>
              <CancelSection>
                <h2>Ou, deseja cancelar o pedido?</h2>
                <Textarea placeholder='Por quê quer cancelar esse pedido?' onChange={event => setobsCancelamento(event.target.value)} css={{ mt: "1.5rem", w: "400px" }} />
                <button onClick={cancelOrder} disabled={!(pedido.status === 'CRIADO')}>Cancelar Pedido</button>
              </CancelSection>
            </>
          ) : (
            <GeneratePdf>
              <div>
                <button onClick={generatePdf}>Criar PDF</button>
              </div>
            </GeneratePdf>
          )}
        </OrderFooter>
        <DeleteModal isOpen={isDeleteItemPedidoModalOpen} onRequestClose={onRequestCloseItemPedidoModal} entity='ItemPedido' id={String(idItemPedido)} />
      </Container>
    </Modal>

  )
}

export default OrderInfo
