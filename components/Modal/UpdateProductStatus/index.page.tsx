import { NextPage } from 'next'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Modal from 'react-modal'
import { produtoService } from '../../../services'
import { Buttons, Container, Content } from './updateStatus'
import { ProdutoProps } from '../../../pages/admin/cadastro/produto/index.page'

interface UpdateStatusModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  produto: ProdutoProps;
}

const UpdateStatus: NextPage<UpdateStatusModalProps> = ({ isOpen, onRequestClose, produto }) => {
  const router = useRouter()
   

  console.log(produto)

  const handleUpdateStatus = async (produto: ProdutoProps) => {
    if (produto) {
      const ativo = produto.ativo === 1 ? 0 : 1;
      const { data, errors } = await produtoService.atualizarStatusDoProduto(produto.id, produto.ativo)

      if (!errors) {
        onRequestClose()
        toast.success(data.message ?? 'Status do produto atualizado com sucesso!')
        router.reload()
      } else {
        toast.error(errors.statusText ?? 'Erro ao alterar status do produto.')
      }
    } 
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="react-modal-overlay"
      className="react-modal-content"
    >
      <Container>
          <Content>
            <h2>Alterar STATUS do Produto.</h2>
            <div>
              {produto && <label>Deseja atualizar o status deste produto para &apos;{produto.ativo === 1 ? 'DESATIVADO' : 'ATIVADO'}&apos;?</label>}
            </div>
            <Buttons>
              <button type='button' onClick={() => handleUpdateStatus(produto)}>Sim</button>
              <button type='button' onClick={() => onRequestClose()}>Não</button>
            </Buttons>
          </Content>
        </Container>
    </Modal>

  )
}

export default UpdateStatus
