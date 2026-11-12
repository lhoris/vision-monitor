/**
 * Login Page
 */

import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/store'
import { loginUser } from '@/store/slices/authSlice'
import { authService, type SignupInput } from '@/services/authService'
import poscoLogo from '../../bak/login_html/img/posco_logo.svg'
import poscoLogoWhite from '../../bak/login_html/img/posco_logo_w.svg'
import type1Background from '../../bak/login_html/img/bg_img01.png'
import type2Visual from '../../bak/login_html/img/bg_img02.png'
import type3Background from '../../bak/login_html/img/bg_img04.png'
import type3CctvIcon from '../../bak/login_html/img/bg_icon01.png'
import loginVideo from '../../bak/login_html/img/login_video.mp4'
import './loginTemplates.css'
import { HelpButton, startGuidedOnboarding, stopGuidedOnboarding } from '@/components/Onboarding'
import { useCommonCode } from '@/hooks/useCommonCode'

type LoginTemplateId = 1 | 2 | 3

export const ACTIVE_LOGIN_TEMPLATE = 2 as LoginTemplateId
const DEMO_USERNAME = 'tester'
const DEMO_PASSWORD = 'tester1@#'

function getLoginErrorMessage(error: unknown): string {
  const message = typeof error === 'string' ? error : error instanceof Error ? error.message : ''
  if (message === 'Invalid username or password') return '사용자 ID 또는 비밀번호가 올바르지 않습니다.'
  return message || '로그인에 실패했습니다.'
}

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

interface LoginFormProps {
  username: string
  password: string
  error: string
  success: boolean
  loading: boolean
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
  onSignup: () => void
  onHelp: () => void
  buttonClassName: string
}

function LoginFields({
  username,
  password,
  error,
  success,
  loading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onSignup,
  onHelp,
  buttonClassName,
}: LoginFormProps) {
  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false)

  return (
    <form className="vm-login-form" onSubmit={onSubmit}>
      <HelpButton className="vm-login-help" onClick={onHelp} />
      <div className="vm-login-field" data-onboarding="login-username">
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

      <div className="vm-login-field" data-onboarding="login-password">
        <label htmlFor="login-password">PASSWORD</label>
        <div className="vm-password-input-wrap">
          <input
            id="login-password"
            type={isPasswordRevealed ? 'text' : 'password'}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="vm-password-toggle"
            aria-label="Show password while pressed"
            data-revealed={isPasswordRevealed}
            onPointerDown={(event) => {
              event.preventDefault()
              setIsPasswordRevealed(true)
            }}
            onPointerUp={() => setIsPasswordRevealed(false)}
            onPointerLeave={() => setIsPasswordRevealed(false)}
            onPointerCancel={() => setIsPasswordRevealed(false)}
            onKeyDown={(event) => {
              if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault()
                setIsPasswordRevealed(true)
              }
            }}
            onKeyUp={() => setIsPasswordRevealed(false)}
            onBlur={() => setIsPasswordRevealed(false)}
          >
            <svg className="vm-password-eye" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
              <circle cx="12" cy="12" r="2.5" />
              {!isPasswordRevealed ? <path d="m3 3 18 18" /> : null}
            </svg>
          </button>
        </div>
      </div>

      <div className="vm-login-options">
        <label className="vm-login-check">
          <input type="checkbox" defaultChecked />
          <span>아이디 저장</span>
        </label>
        <button type="button" className="vm-login-link">아이디/비밀번호 찾기</button>
      </div>

      {error && <p className={success ? 'vm-login-success' : 'vm-login-error'} role={success ? 'status' : 'alert'}>{error}</p>}

      <button type="submit" className={buttonClassName} disabled={loading} data-onboarding="login-submit">
        {loading ? 'Signing In...' : 'Login'}
      </button>

      <div className="vm-signup-prompt">
        <span>계정이 없으신가요?</span>
        <button type="button" className="vm-login-link vm-signup-link" onClick={onSignup} data-onboarding="login-signup">회원가입</button>
      </div>

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

function SignupDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: (message: string) => void }) {
  const classCode = useCommonCode('USER_CLASS')
  const [input, setInput] = useState<SignupInput>({ username: '', password: '', passwordConfirm: '', name: '', email: '', phone: '', department: '', position: '', classCode: 'COMMON' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [usernameCheck, setUsernameCheck] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [emailCheck, setEmailCheck] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const update = (field: keyof SignupInput, value: string) => {
    setInput((current) => ({ ...current, [field]: value }))
    if (field === 'username') setUsernameCheck('idle')
    if (field === 'email') setEmailCheck('idle')
  }

  const checkAvailability = async (field: 'username' | 'email') => {
    const value = input[field]?.trim() ?? ''
    if (!value) {
      setError(field === 'username' ? '사용자 ID를 입력하세요.' : '이메일을 입력하세요.')
      return
    }
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('올바른 이메일 주소를 입력하세요.')
      return
    }
    setError('')
    if (field === 'username') setUsernameCheck('checking')
    else setEmailCheck('checking')
    try {
      const result = await authService.checkSignupAvailability(field === 'username' ? value : undefined, field === 'email' ? value : undefined)
      const available = field === 'username' ? result.usernameAvailable : result.emailAvailable
      if (field === 'username') setUsernameCheck(available ? 'available' : 'unavailable')
      else setEmailCheck(available ? 'available' : 'unavailable')
    } catch (reason) {
      if (field === 'username') setUsernameCheck('idle')
      else setEmailCheck('idle')
      setError(reason instanceof Error ? reason.message : '중복 확인에 실패했습니다.')
    }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (usernameCheck !== 'available') {
      setError('사용자 ID 중복 확인을 완료하세요.')
      return
    }
    if (emailCheck !== 'available') {
      setError('이메일 중복 확인을 완료하세요.')
      return
    }
    setSaving(true)
    if (input.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      setSaving(false)
      return
    }
    if (input.password !== input.passwordConfirm) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      setSaving(false)
      return
    }
    try {
      await authService.signup(input)
      const admin = await authService.getSignupAdminContact(input.department).catch(() => null)
      const adminContact = admin
        ? `\n승인 담당자: ${admin.name}${admin.email ? ` / ${admin.email}` : ''}${admin.phone ? ` / ${admin.phone}` : ''}`
        : ''
      onSuccess(`가입 신청이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.${adminContact}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '회원가입 신청에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const fields: Array<[keyof SignupInput, string, boolean]> = [
    ['username', '사용자 ID', true], ['name', '이름', true], ['email', '이메일', true],
    ['phone', '연락처', false], ['department', '부서', false], ['position', '직책', false],
  ]

  fields.push(['classCode', '반', true])

  const renderField = ([field, label, required]: [keyof SignupInput, string, boolean]) => {
    const checkable = field === 'username' || field === 'email'
    const checkState = field === 'username' ? usernameCheck : field === 'email' ? emailCheck : 'idle'
    if (field === 'classCode') {
      return <label key={field} className="vm-signup-field" htmlFor="signup-class-code">{label}<span className="vm-signup-required"> *</span><select id="signup-class-code" value={input.classCode ?? 'COMMON'} required onChange={(event) => update('classCode', event.target.value)}>{(classCode?.items ?? []).map((item) => <option key={item.value} value={item.value}>{item.nameKo || item.name}</option>)}</select></label>
    }
    return <div key={field} className="vm-signup-field"><label htmlFor={`signup-${field}`}>{label}{required ? <span className="vm-signup-required"> *</span> : null}</label><div className={checkable ? 'vm-signup-field-control' : undefined}><input id={`signup-${field}`} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} inputMode={field === 'phone' ? 'numeric' : undefined} placeholder={field === 'phone' ? '010-1234-5678' : undefined} maxLength={field === 'phone' ? 13 : undefined} value={input[field] ?? ''} required={required} onChange={(event) => update(field, field === 'phone' ? formatPhoneNumber(event.target.value) : event.target.value)} />{checkable ? <button type="button" onClick={() => void checkAvailability(field)} disabled={checkState === 'checking'}>{checkState === 'checking' ? '확인 중...' : '중복 확인'}</button> : null}</div>{checkState === 'available' ? <small className="vm-signup-check-success">사용할 수 있습니다.</small> : null}{checkState === 'unavailable' ? <small className="vm-signup-check-error">이미 사용 중입니다.</small> : null}</div>
  }

  return <div className="vm-signup-modal" role="presentation"><form className="vm-signup-card" onSubmit={submit}><div className="vm-signup-header"><h2>회원가입</h2><button type="button" onClick={onClose} aria-label="닫기">×</button></div><p className="vm-signup-description">가입 신청 후 관리자 승인 절차가 진행됩니다.</p><div className="vm-signup-grid">{fields.map(renderField)}<label className="vm-signup-field" htmlFor="signup-password">비밀번호<span className="vm-signup-required"> *</span><input id="signup-password" type="password" value={input.password} required onChange={(event) => update('password', event.target.value)} /></label><label className="vm-signup-field" htmlFor="signup-password-confirm">비밀번호 확인<span className="vm-signup-required"> *</span><input id="signup-password-confirm" type="password" value={input.passwordConfirm} required onChange={(event) => update('passwordConfirm', event.target.value)} /></label></div>{error ? <p className="vm-login-error" role="alert">{error}</p> : null}<div className="vm-signup-actions"><button type="button" onClick={onClose}>취소</button><button type="submit" disabled={saving}>{saving ? '신청 중...' : '가입 신청'}</button></div></form></div>
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
  const { t } = useTranslation()
  const loading = useAppSelector((state) => state.auth.loading)
  const [username, setUsername] = useState(DEMO_USERNAME)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignupOpen, setIsSignupOpen] = useState(false)

  useEffect(() => () => stopGuidedOnboarding(), [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

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
      setError(getLoginErrorMessage(loginError))
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
    success,
    loading,
    onUsernameChange: setUsername,
    onPasswordChange: setPassword,
    onSubmit: handleLogin,
    onSignup: () => setIsSignupOpen(true),
    onHelp: () => { startGuidedOnboarding('login', t) },
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

      {isSignupOpen ? <SignupDialog onClose={() => setIsSignupOpen(false)} onSuccess={(message) => { setIsSignupOpen(false); setSuccess(true); setError(message) }} /> : null}

      {ACTIVE_LOGIN_TEMPLATE === 1 && <Type1Login {...templateProps} />}
      {ACTIVE_LOGIN_TEMPLATE === 2 && <Type2Login {...templateProps} />}
      {ACTIVE_LOGIN_TEMPLATE === 3 && <Type3Login {...templateProps} />}
    </>
  )
}

export default Login
