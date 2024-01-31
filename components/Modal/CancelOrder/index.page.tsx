import { NextPage } from 'next';
import { Container, Content, Buttons } from './cancelOrder';
import Modal from 'react-modal'
import toast from 'react-hot-toast';
import { pedidoService } from '../../../services';
import { Textarea } from '@nextui-org/react';
import { useState } from 'react';
import { PedidosProps } from '../../../services/pedido';

interface CancelOrderModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  pedido: PedidosProps;
}

const CancelOrder: NextPage<CancelOrderModalProps> = ({ isOpen, onRequestClose, pedido }) => {
  const [observacao, setObservacao] = useState('')

  const handleCancelOrder = async (pedido: PedidosProps) => {
    const { data, errors } = await pedidoService.cancelarPedidoByIdComObservacao({ pedidoId: pedido.id, observacao })

    if (!errors) {
      onRequestClose()
      toast.success(data.message ?? 'Pedido cancelado com sucesso!')
    } else {
      toast.error(errors.statusText ?? 'Erro ao cancelar pedido.')
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
            <h2>Deseja mesmo cancelar esse Pedido?</h2>
            <Textarea placeholder='Por quê quer cancelar esse pedido?' css={{ mb: "1.5rem", w: "900px" }} onChange={event => setObservacao(event.target.value)} />
            <Buttons>
              <button type='button' onClick={() => handleCancelOrder(pedido)}>Cancelar</button>
              <button type='button' className='no' onClick={onRequestClose}>Não</button>
            </Buttons>
          </Content>
        </Container>
    </Modal>

  )
}

export default CancelOrder
