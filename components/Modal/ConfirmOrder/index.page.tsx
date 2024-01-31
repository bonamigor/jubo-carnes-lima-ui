import { NextPage } from 'next';
import { Container, Content, Buttons } from './confirmOrder';
import Modal from 'react-modal'
import toast from 'react-hot-toast';
import { pedidoService } from '../../../services';
import { PedidosProps } from '../../../services/pedido';

interface ConfirmOrderModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  pedido: PedidosProps;
}

const ConfirmOrder: NextPage<ConfirmOrderModalProps> = ({ isOpen, onRequestClose, pedido }) => {
  const handleConfirmOrder = async (pedido: PedidosProps) => {
    const { data, errors } = await pedidoService.setarPedidoComoEntregue(pedido.id)

    if (!errors) {
      onRequestClose()
      toast.success(data.message ?? 'Pedido entregue com sucesso!')
    } else {
      toast.error(errors.statusText ?? 'Erro ao alterar status do pedido.')
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
            <h2>Alterar STATUS do pedido.</h2>
            <div>
              <label>Deseja atualizar o status deste pedido para &apos;ENTREGUE&apos;?</label>
            </div>
            <Buttons>
              <button type='button' onClick={() => handleConfirmOrder(pedido)}>Sim</button>
              <button type='button' onClick={() => onRequestClose()}>Não</button>
            </Buttons>
          </Content>
        </Container>
    </Modal>

  )
}

export default ConfirmOrder
