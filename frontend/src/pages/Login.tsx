/**
 * Login Page
 */

import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { loginUser } from '@/store/slices/authSlice'
import { authService } from '@/services/authService'
import poscoLogo from '../../bak/login_html/img/posco_logo.svg'
import poscoLogoWhite from '../../bak/login_html/img/posco_logo_w.svg'
import type1Background from '../../bak/login_html/img/bg_img01.png'
import type2Visual from '../../bak/login_html/img/bg_img02.png'
import type3Background from '../../bak/login_html/img/bg_img04.png'
import type3CctvIcon from '../../bak/login_html/img/bg_icon01.png'
import loginVideo from '../../bak/login_html/img/login_video.mp4'
import './loginTemplates.css'

type LoginTemplateId = 1 | 2 | 3

export const ACTIVE_LOGIN_TEMPLATE = 2 as LoginTemplateId
const DEMO_USERNAME = 'tester'
const DEMO_PASSWORD = 'tester1@#'

interface LoginFormProps {
  username: string
  password: string
  error: string
  loading: boolean
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
  buttonClassName: string
}

function LoginFields({
  username,
  password,
  error,
  loading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  buttonClassName,
}: LoginFormProps) {
  return (
    <form className="vm-login-form" onSubmit={onSubmit}>
      <div className="vm-login-field">
        <label htmlFor="login-username">USER ID</label>
        <input
          id="login-username"
          type="text"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder="ID"
          autoComplete="username"
          required
        />
      </div>

      <div className="vm-login-field">
        <label htmlFor="login-password">PASSWORD</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
        />
      </div>

      <div className="vm-login-options">
        <label className="vm-login-check">
          <input type="checkbox" defaultChecked />
          <span>아이디 저장</span>
        </label>
        <button type="button" className="vm-login-link">아이디/비밀번호 찾기</button>
      </div>

      {error && <p className="vm-login-error">{error}</p>}

      <button type="submit" className={buttonClassName} disabled={loading}>
        {loading ? 'Signing In...' : 'Login'}
      </button>

      <DemoCredentials />
    </form>
  )
}

function DemoCredentials() {
  return (
    <div className="vm-login-demo" aria-label="Demo Credentials">
      <strong>Demo Credentials</strong>
      <span>Username: <code>{DEMO_USERNAME}</code></span>
      <span>Password: <code>{DEMO_PASSWORD}</code></span>
    </div>
  )
}

function Type1Login(props: LoginFormProps) {
  return (
    <div className="vm-login-root vm-login-type1" style={{ '--type1-bg': `url(${type1Background})` } as React.CSSProperties}>
      <section className="vm-type1-shell">
        <div className="vm-type1-media">
          <video autoPlay muted loop playsInline>
            <source src={loginVideo} type="video/mp4" />
          </video>
        </div>
        <div className="vm-type1-panel">
          <img src={poscoLogo} alt="POSCO" className="vm-login-logo" />
          <h1>포항 4선재 AI 영상통합 플랫폼</h1>
          <LoginFields {...props} buttonClassName="vm-type1-submit" />
          <footer>POSCO Smart Factory / AI Video Platform</footer>
        </div>
      </section>
    </div>
  )
}

function Type2Login(props: LoginFormProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const leftSectionRef = useRef<HTMLDivElement>(null)
  const eyeRefs = useRef<Array<HTMLSpanElement | null>>([])
  const [serverTime, setServerTime] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    const container = leftSectionRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !container || !context) return undefined

    let frameId = 0
    let step = 0

    const resizeCanvas = () => {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
    }

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      step += 0.015

      for (let i = 0; i < 3; i += 1) {
        context.beginPath()
        context.lineWidth = 1.2
        context.strokeStyle = i === 0
          ? 'rgba(56, 189, 248, 0.2)'
          : i === 1
            ? 'rgba(129, 140, 248, 0.15)'
            : 'rgba(52, 211, 153, 0.12)'

        const amplitude = 40 + i * 20
        const frequency = 0.003 + i * 0.001
        const speed = step * (1 + i * 0.3)

        for (let x = 0; x <= canvas.width; x += 10) {
          const y = (canvas.height / 2) + Math.sin(x * frequency + speed) * amplitude * Math.cos(step * 0.5)
          if (x === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.stroke()
      }

      frameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  useEffect(() => {
    const updateServerTime = () => {
      const now = new Date()
      setServerTime(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} KST`)
    }

    updateServerTime()
    const timer = window.setInterval(updateServerTime, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      eyeRefs.current.forEach((eye) => {
        if (!eye) return
        const rect = eye.getBoundingClientRect()
        const eyeX = rect.left + rect.width / 2
        const eyeY = rect.top + rect.height / 2
        const angle = Math.atan2(event.clientY - eyeY, event.clientX - eyeX)
        const distance = Math.min(6, Math.hypot(event.clientX - eyeX, event.clientY - eyeY) / 18)
        eye.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="vm-login-root vm-login-type2">
      <main className="vm-type2-container">
        <section className="vm-type2-left" ref={leftSectionRef} style={{ '--type2-visual': `url(${type2Visual})` } as React.CSSProperties}>
          <canvas ref={canvasRef} className="vm-type2-canvas" />
          <div className="vm-type2-hero">
            <img src={poscoLogoWhite} alt="POSCO" />
            <h1>포항 4선재<br /><span>AI 영상통합 플랫폼</span></h1>
            <p>Real-time CCTV Vision AI & Safety Monitoring Control</p>
          </div>
        </section>

        <section className="vm-type2-right">
          <header className="vm-type2-header">
            <div className="vm-type2-login-word" aria-label="Login">
              <span>L</span>
              <span className="vm-type2-eye-o">
                <span className="vm-type2-o">o</span>
                <span className="vm-type2-eyes">
                  <span ref={(element) => { eyeRefs.current[0] = element }} />
                  <span ref={(element) => { eyeRefs.current[1] = element }} />
                </span>
              </span>
              <span>gin</span>
            </div>
            <p>모니터링 및 AI 관제를 위해 로그인해 주세요.</p>
          </header>

          <LoginFields {...props} buttonClassName="vm-type2-submit" />

          <footer className="vm-type2-status">
            <div><span>AI VISION SERVER</span><strong>ONLINE</strong></div>
            <div><span>CCTV STREAMING HUB</span><strong>4선재 라인 연동중</strong></div>
            <div><span>SERVER TIME</span><strong>{serverTime}</strong></div>
          </footer>
        </section>
      </main>
    </div>
  )
}

function Type3Login(props: LoginFormProps) {
  useEffect(() => {
    const root = document.documentElement
    const handleMouseMove = (event: MouseEvent) => {
      root.style.setProperty('--vm-login-mouse-x', `${event.clientX}px`)
      root.style.setProperty('--vm-login-mouse-y', `${event.clientY}px`)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="vm-login-root vm-login-type3" style={{ '--type3-bg': `url(${type3Background})`, '--type3-cctv': `url(${type3CctvIcon})` } as React.CSSProperties}>
      <div className="vm-type3-spotlight" />
      <section className="vm-type3-shell">
        <header className="vm-type3-logo-row">
          <img src={poscoLogoWhite} alt="POSCO" />
          <span className="vm-type3-cctv" />
        </header>
        <div className="vm-type3-card">
          <h1>포항 4선재<br /><span>AI 영상통합 플랫폼</span></h1>
          <p>시스템을 사용하시려면 로그인해 주세요.</p>
          <LoginFields {...props} buttonClassName="vm-type3-submit" />
        </div>
      </section>
    </div>
  )
}

export const Login: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const loading = useAppSelector((state) => state.auth.loading)
  const [username, setUsername] = useState(DEMO_USERNAME)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState('')
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Username is required')
      return
    }

    try {
      const result = await dispatch(loginUser({ username, password })).unwrap()
      if (result.passwordChangeRequired) {
        setPasswordChangeRequired(true)
      } else {
        navigate('/')
      }
    } catch (loginError) {
      setError(typeof loginError === 'string' ? loginError : 'Invalid username or password')
    }
  }

  const handlePasswordChange = async () => {
    setError('')
    if (newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      await authService.changePassword(newPassword)
      setPasswordChangeRequired(false)
      navigate('/')
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : '비밀번호 변경에 실패했습니다.')
    }
  }

  const templateProps: LoginFormProps = {
    username,
    password,
    error,
    loading,
    onUsernameChange: setUsername,
    onPasswordChange: setPassword,
    onSubmit: handleLogin,
    buttonClassName: '',
  }

  return (
    <>
      {passwordChangeRequired && (
        <div className="vm-password-modal">
          <div className="vm-password-card">
            <h2>비밀번호 변경</h2>
            <p>관리자가 비밀번호를 초기화했습니다. 새 비밀번호를 설정해 주세요.</p>
            <input aria-label="새 비밀번호" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="새 비밀번호" />
            <input aria-label="새 비밀번호 확인" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="새 비밀번호 확인" />
            <button type="button" onClick={() => void handlePasswordChange()}>비밀번호 저장</button>
          </div>
        </div>
      )}

      {ACTIVE_LOGIN_TEMPLATE === 1 && <Type1Login {...templateProps} />}
      {ACTIVE_LOGIN_TEMPLATE === 2 && <Type2Login {...templateProps} />}
      {ACTIVE_LOGIN_TEMPLATE === 3 && <Type3Login {...templateProps} />}
    </>
  )
}

export default Login
