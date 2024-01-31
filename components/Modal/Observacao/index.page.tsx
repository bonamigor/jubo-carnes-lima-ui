import { NextPage } from 'next';
import { Container, Content, Buttons, ObservacaoDiv } from './observacao';
import Modal from 'react-modal'
import toast from 'react-hot-toast';
import { pedidoService } from '../../../services';
import { useState } from 'react';
import { Textarea } from '@nextui-org/react';
import { PedidosProps } from '../../../services/pedido';


interface ObservacaoModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  pedido: PedidosProps;
}

const Observacao: NextPage<ObservacaoModalProps> = ({ isOpen, onRequestClose, pedido }) => {
  const [observacao, setObservacao] = useState('')

  const handleChangeObsPedido = async (pedido: PedidosProps) => {
    const { data: observacaoData, errors: observacaoErrors } = await pedidoService.adicionarObservacao({ observacao, pedidoId: Number(pedido.id) })

    if (!observacaoErrors) {
      onRequestClose()
      toast.success(observacaoData.message ?? 'Observação alterada com sucesso!')
    } else {
      toast.error(observacaoErrors.statusText ?? 'Erro ao alterar a observação do pedido.')
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
            <h2>Alterar a observação do pedido.</h2>
            <ObservacaoDiv>
              <Textarea initialValue={pedido.observacao ?? 'Sem observação'} onChange={event => setObservacao(event.target.value)} css={{ mt: "1.5rem", w: "900px" }} />
            </ObservacaoDiv>
            <Buttons>
              <button type='button' onClick={() => handleChangeObsPedido(pedido)}>Atualizar</button>
              <button type='button' className='no' onClick={onRequestClose}>Fechar</button>
            </Buttons>
          </Content>
        </Container>
    </Modal>

  )
}

export default Observacao
