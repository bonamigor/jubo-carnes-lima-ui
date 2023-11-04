import Image from 'next/image'
import logoImg from '../../assets/logo.png'

import { Dropdown } from '@nextui-org/react'
import { NextPage } from "next"
import Link from 'next/link'
import { useRouter } from 'next/router'
import { usePedido } from '../../hooks/usePedido'
import { useUser } from '../../hooks/useUser'
import LogginButton from '../LoginButton/index.page'
import { Container, Content, DropdownMenuItem, Logo, Menu, MenuItem } from './navbar'

interface NavbarProps {
  isUserLoggedIn: boolean;
}

const Navbar: NextPage<NavbarProps> = ({ isUserLoggedIn }) => {
  const { user, logoutUser } = useUser()
  const { receivePedido } = usePedido()

  const router = useRouter()
  const route = router.pathname
  
  const userName = user.id === 0 ? 'Usuário | Sair' : `${user.name} | Sair`
  const isAdmin = user.admin ? true : false
  
  const isActive = ({route, item}: {route: string, item: string}) => {
    return route.includes(item)
  }

  return isUserLoggedIn ? (
    <>
      <Container>
        <Content>
          <Logo>
            <Image src={logoImg} alt="Paraíso das Carnes" width={50} height={40}/>
            <h1>Paraíso das Carnes</h1>
          </Logo>
          {isAdmin ? (
            <Menu>
              <Link href="/admin/dashboard" passHref>
                <MenuItem isActive={isActive({route, item: 'dashboard'})}>DASHBOARD</MenuItem>
              </Link>
              <Dropdown>
                <Dropdown.Trigger>
                  <MenuItem isActive={isActive({route, item: 'cadastro'})}>CADASTROS</MenuItem>
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Item>
                    <Link href="/admin/cadastro/usuario" passHref>
                      <DropdownMenuItem isActive={isActive({route, item: 'usuario'})}>USUÁRIO</DropdownMenuItem>
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Link href="/admin/cadastro/cliente" passHref>
                      <DropdownMenuItem isActive={isActive({route, item: 'cliente'})}>CLIENTE</DropdownMenuItem>
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Link href="/admin/cadastro/produto" passHref>
                      <DropdownMenuItem isActive={isActive({route, item: 'produto'})}>PRODUTO</DropdownMenuItem>
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Link href="/admin/cadastro/estante" passHref>
                      <DropdownMenuItem isActive={isActive({route, item: 'estante'})}>ESTANTE</DropdownMenuItem>
                    </Link>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Trigger>
                  <MenuItem isActive={isActive({route, item: 'relatorio'})}>RELATÓRIOS</MenuItem>
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Item>
                    <Link href="/admin/relatorios/pedidos" passHref>
                      <DropdownMenuItem isActive={isActive({route, item: 'pedidos'})}>PEDIDOS</DropdownMenuItem>
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Link href="/admin/relatorios/pedido" passHref>
                      <DropdownMenuItem isActive={isActive({route, item: 'pedido'})}>PEDIDO POR ID</DropdownMenuItem>
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Link href="/admin/relatorios/compras" passHref>
                      <DropdownMenuItem isActive={isActive({route, item: 'compras'})}>COMPRAS</DropdownMenuItem>
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Link href="/admin/relatorios/vendas" passHref>
                      <DropdownMenuItem isActive={isActive({route, item: 'vendas'})}>VENDAS</DropdownMenuItem>
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Link href="/admin/relatorios/fornecimento" passHref>
                      <DropdownMenuItem isActive={isActive({route, item: 'fornecimento'})}>FORNECIMENTO</DropdownMenuItem>
                    </Link>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <LogginButton text={userName} />
            </Menu>
          ) : (
            <Menu>
              <Link href="/cliente/inicial" passHref>
                <MenuItem isActive={isActive({route, item: 'cliente/inicial'})}>INÍCIO</MenuItem>
              </Link>
              <Link href="/cliente/estante" passHref>
                <MenuItem isActive={isActive({route, item: 'estante'})}>REALIZAR PEDIDO</MenuItem>
              </Link>
              {/* <MenuItem onClick={() => {criarPedido()}} isActive={isActive({route, item: 'estante'})}>REALIZAR PEDIDO</MenuItem> */}
              <Link href="/cliente/pedidos" passHref>
                <MenuItem isActive={isActive({route, item: 'cliente/pedidos'})}>PEDIDOS</MenuItem>
              </Link>
              <LogginButton text={userName} />
            </Menu>
          )}
        </Content>
      </Container>
    </>
  ) : (
    <>
    </>
  )
}

export default Navbar
