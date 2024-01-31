import { NextPage } from 'next';
import { Container, Content, Buttons } from './changeDate';
import Modal from 'react-modal'
import toast from 'react-hot-toast';
import { pedidoService } from '../../../services';
import { useEffect, useState } from 'react';
import InputMask from "react-input-mask";
import { PedidosProps } from '../../../services/pedido';

interface ChangeDateModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  pedido: PedidosProps;
}

const ChangeDate: NextPage<ChangeDateModalProps> = ({ isOpen, onRequestClose, pedido }) => {
  const [dataEntrega, setDataEntrega] = useState('')
  const [isValid, setIsValid] = useState(false)

  const handleChangeOrderDate = async (pedido: PedidosProps) => {
    const dataFormatada = new Date(dataEntrega.split('/').reverse().join('-')).getTime()
    const { data, errors } = await pedidoService.atualizarDataEntregaPedido(pedido.id, dataFormatada)

    if (!errors) {
      onRequestClose()
      toast.success(data.message ?? 'Data de Entrega alterada com sucesso!')
    } else {
      toast.error(errors.statusText ?? 'Erro ao alterar data entrega.')
    }
  }

  const validateAlterar = () => dataEntrega.length >= 10
  
  useEffect(() => {
    const isValid = validateAlterar();
    setIsValid(isValid);
  }, [dataEntrega])

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="react-modal-overlay"
      className="react-modal-content"
    >
      <Container>
          <Content>
            <h2>Alterar data de entrega do Pedido.</h2>
            <div>
              <label>Data Entrega</label>
              <InputMask mask="99/99/9999" onChange={event => setDataEntrega(event.target.value)} value={dataEntrega} />
            </div>
            <Buttons>
              <button type='button' onClick={() => handleChangeOrderDate(pedido)} disabled={!isValid}>Atualizar</button>
              <button type='button' className='no' onClick={onRequestClose}>Fechar</button>
            </Buttons>
          </Content>
        </Container>
    </Modal>

  )
}

export default ChangeDate
