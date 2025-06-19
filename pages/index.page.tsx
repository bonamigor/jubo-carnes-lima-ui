import { Loading } from '@nextui-org/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation } from 'react-query'
import { useUser } from '../hooks/useUser'
import { auth } from '../services/index'
import { Box, HomeStyle, LeftContent, LoginForm, RightContent } from './home'

const Home: NextPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { receiveUser } = useUser()
  const router = useRouter()

  const mutation = useMutation(({ email, senha }: { email: string, senha: string }) => auth.login({ email, senha }))

  async function handleLogin(event: FormEvent) {
    event.preventDefault()

    try {
      mutation.mutate({ email: email, senha: password }, {
        onSuccess: async (data) => {
          if (mutation.isLoading) {
            return <h1>Carregando...</h1>
          }
          if (data.user.admin === 1) {
            window.localStorage.setItem('token', data.token)
            window.sessionStorage.setItem('userId', data.user.id)
            window.sessionStorage.setItem('userName', data.user.nome)
            window.sessionStorage.setItem('userEmail', data.user.email)
            window.sessionStorage.setItem('userAdmin', data.user.admin)
            receiveUser({ id: data.user.id, name: data.user.nome, email: data.user.email, admin: data.user.admin })
            toast.success('Logado com sucesso!')
            router.push('/admin/dashboard')
          } else {
            window.localStorage.setItem('token', data.token)
            window.sessionStorage.setItem('userId', data.user.id)
            window.sessionStorage.setItem('userName', data.user.nome)
            window.sessionStorage.setItem('userEmail', data.user.email)
            window.sessionStorage.setItem('userAdmin', data.user.admin)
            window.sessionStorage.setItem('userClientId', data.user.clienteId)
            receiveUser({ id: data.user.id, name: data.user.nome, email: data.user.email, admin: data.user.admin, clienteId: data.user.clienteId })
            toast.success('Logado com sucesso!')
            router.push('/cliente/inicial')
          }
        },
        onError: async (error) => {
          const erro = error as Error
          if (erro.message.includes('404')) {
            toast.error(`Usuário não encontrado.
            Verifique as credenciais.`)
          }
        }
      })
      
    } catch (error) {
      toast.error('Erro ao realizar o login.')
      console.error(error)
    }
  }

  return (
    <>
      <Head>
        <title>Casa de Carnes Lima</title>
        <meta name="description" content="Casa de Carnes Lima p/ Merenda Escolar" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeStyle>
        <Box>
          <LeftContent>
            <div>
              <h1>
                Realize os pedidos<br />
                da sua escola<br />
                com segurança<br />
                e tranquilidade.
              </h1>
              <h2>
                Faça já o login {'>'}
              </h2>
            </div>
            <footer>
              <p>Dúvidas?</p>
              <p>(62) 99166-9903 / (62) 3387-4156</p>
              <p><a href="mailto:casadecarnesribeiro@hotmail.com.br">casadecarnesribeiro@hotmail.com.br</a></p>
            </footer>
          </LeftContent>
          <RightContent>
            <LoginForm onSubmit={handleLogin}>
              <h1>Login</h1>
              <input type="text" placeholder="E-mail" value={email} onChange={event => {setEmail(event.target.value)}} />
              <input type="password" placeholder="Senha" value={password} onChange={event => {setPassword(event.target.value)}} />
              {mutation.isLoading ? (
                <div>
                  <Loading color="success" size="md" type="points">Entrando</Loading>
                </div>
              ) : (
                <button type="submit">Entrar</button>
              )}
            </LoginForm>
          </RightContent>
        </Box>
      </HomeStyle>
    </>
  )
}

export default Home
