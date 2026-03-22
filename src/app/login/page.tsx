// 'use client'

// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import { useRouter } from 'next/navigation'

// // ── Validation helpers ────────────────────────────────
// const validators = {
//   email: (v: string) => {
//     if (!v) return 'Email is required'
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address'
//     return ''
//   },
//   password: (v: string) => {
//     if (!v) return 'Password is required'
//     if (v.length < 6) return 'Password must be at least 6 characters'
//     return ''
//   },
//   confirmPassword: (v: string, password: string) => {
//     if (!v) return 'Please confirm your password'
//     if (v !== password) return 'Passwords do not match'
//     return ''
//   },
// }

// interface FieldState {
//   value: string
//   error: string
//   touched: boolean
// }

// const initField = (): FieldState => ({ value: '', error: '', touched: false })

// export default function LoginPage() {
//   const router = useRouter()
//   const [isSignup, setIsSignup] = useState(false)
//   const [loading, setLoading]   = useState(false)
//   const [serverError, setServerError]   = useState('')
//   const [serverSuccess, setServerSuccess] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirm,  setShowConfirm]  = useState(false)
//   const [mounted, setMounted] = useState(false)

//   const [email,    setEmail]    = useState<FieldState>(initField())
//   const [password, setPassword] = useState<FieldState>(initField())
//   const [confirm,  setConfirm]  = useState<FieldState>(initField())

//   useEffect(() => { setMounted(true) }, [])

//   // ── Field updaters ──────────────────────────────────
//   const touchEmail = (v: string) => {
//     const error = email.touched ? validators.email(v) : ''
//     setEmail({ value: v, error, touched: email.touched })
//   }
//   const blurEmail = () => {
//     const error = validators.email(email.value)
//     setEmail(p => ({ ...p, error, touched: true }))
//   }

//   const touchPassword = (v: string) => {
//     const error = password.touched ? validators.password(v) : ''
//     // Also re-validate confirm if touched
//     if (confirm.touched) {
//       setConfirm(p => ({ ...p, error: validators.confirmPassword(p.value, v) }))
//     }
//     setPassword({ value: v, error, touched: password.touched })
//   }
//   const blurPassword = () => {
//     setPassword(p => ({ ...p, error: validators.password(p.value), touched: true }))
//   }

//   const touchConfirm = (v: string) => {
//     const error = confirm.touched ? validators.confirmPassword(v, password.value) : ''
//     setConfirm({ value: v, error, touched: confirm.touched })
//   }
//   const blurConfirm = () => {
//     setConfirm(p => ({ ...p, error: validators.confirmPassword(p.value, password.value), touched: true }))
//   }

//   // ── Password strength ───────────────────────────────
//   const getStrength = (v: string) => {
//     if (!v) return { score: 0, label: '', color: '' }
//     let score = 0
//     if (v.length >= 6)  score++
//     if (v.length >= 10) score++
//     if (/[A-Z]/.test(v)) score++
//     if (/[0-9]/.test(v)) score++
//     if (/[^A-Za-z0-9]/.test(v)) score++
//     if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' }
//     if (score <= 3) return { score, label: 'Medium', color: '#f59e0b' }
//     return             { score, label: 'Strong', color: '#22c55e' }
//   }
//   const strength = getStrength(password.value)

//   // ── Submit ──────────────────────────────────────────
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setServerError('')
//     setServerSuccess('')

//     // Touch all fields
//     const emailErr    = validators.email(email.value)
//     const passwordErr = validators.password(password.value)
//     const confirmErr  = isSignup ? validators.confirmPassword(confirm.value, password.value) : ''

//     setEmail(p    => ({ ...p, error: emailErr,    touched: true }))
//     setPassword(p => ({ ...p, error: passwordErr, touched: true }))
//     if (isSignup) setConfirm(p => ({ ...p, error: confirmErr, touched: true }))

//     if (emailErr || passwordErr || (isSignup && confirmErr)) return

//     setLoading(true)
//     if (isSignup) {
//       const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
//       if (error) setServerError(error.message)
//       else setServerSuccess('Account created! Check your email to confirm.')
//     } else {
//       const { error } = await supabase.auth.signInWithPassword({
//         email: email.value, password: password.value,
//       })
//       if (error) {
//         if (error.message.includes('Invalid login')) setServerError('Incorrect email or password.')
//         else setServerError(error.message)
//       } else {
//         router.push('/dashboard')
//       }
//     }
//     setLoading(false)
//   }

//   const handleGoogle = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: { redirectTo: `${window.location.origin}/dashboard` },
//     })
//   }

//   const switchMode = () => {
//     setIsSignup(p => !p)
//     setEmail(initField())
//     setPassword(initField())
//     setConfirm(initField())
//     setServerError('')
//     setServerSuccess('')
//   }

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '1rem',
//       fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
//     }}>

//       {/* Ambient orbs */}
//       <div style={{
//         position: 'fixed', top: '15%', left: '10%',
//         width: 320, height: 320, borderRadius: '50%',
//         background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
//         pointerEvents: 'none',
//       }} />
//       <div style={{
//         position: 'fixed', bottom: '15%', right: '10%',
//         width: 280, height: 280, borderRadius: '50%',
//         background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
//         pointerEvents: 'none',
//       }} />

//       <div style={{
//         width: '100%', maxWidth: 420,
//         opacity: mounted ? 1 : 0,
//         transform: mounted ? 'translateY(0)' : 'translateY(16px)',
//         transition: 'opacity 0.5s ease, transform 0.5s ease',
//       }}>

//         {/* Header */}
//         <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
//           <div style={{
//             display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
//             width: 56, height: 56, borderRadius: 16,
//             background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
//             marginBottom: '0.875rem',
//             boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
//           }}>
//             <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>L</span>
//           </div>
//           <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>LearnTrack</h1>
//           <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 }}>
//             {isSignup ? 'Start your learning journey' : 'Welcome back, keep learning'}
//           </p>
//         </div>

//         {/* Card */}
//         <div style={{
//           background: 'rgba(255,255,255,0.05)',
//           backdropFilter: 'blur(20px)',
//           WebkitBackdropFilter: 'blur(20px)',
//           border: '1px solid rgba(255,255,255,0.1)',
//           borderRadius: 20,
//           padding: '2rem',
//           boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
//         }}>

//           {/* Tab switcher */}
//           <div style={{
//             display: 'flex', background: 'rgba(0,0,0,0.25)',
//             borderRadius: 12, padding: 4, marginBottom: '1.5rem',
//           }}>
//             {['Sign In', 'Sign Up'].map((label, i) => (
//               <button
//                 key={label}
//                 onClick={() => i === 0 ? (!isSignup ? null : switchMode()) : (isSignup ? null : switchMode())}
//                 style={{
//                   flex: 1, padding: '8px 0', borderRadius: 9, border: 'none',
//                   fontSize: 13, fontWeight: 600, cursor: 'pointer',
//                   transition: 'all 0.2s ease',
//                   background: (i === 0 ? !isSignup : isSignup)
//                     ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
//                     : 'transparent',
//                   color: (i === 0 ? !isSignup : isSignup) ? '#fff' : 'rgba(255,255,255,0.4)',
//                   boxShadow: (i === 0 ? !isSignup : isSignup) ? '0 2px 8px rgba(124,58,237,0.4)' : 'none',
//                 }}
//               >
//                 {label}
//               </button>
//             ))}
//           </div>

//           {/* Server messages */}
//           {serverError && (
//             <div style={{
//               background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
//               color: '#fca5a5', fontSize: 13, padding: '10px 14px',
//               borderRadius: 10, marginBottom: '1rem',
//               display: 'flex', alignItems: 'center', gap: 8,
//             }}>
//               <span style={{ fontSize: 16 }}>⚠</span> {serverError}
//             </div>
//           )}
//           {serverSuccess && (
//             <div style={{
//               background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
//               color: '#86efac', fontSize: 13, padding: '10px 14px',
//               borderRadius: 10, marginBottom: '1rem',
//               display: 'flex', alignItems: 'center', gap: 8,
//             }}>
//               <span style={{ fontSize: 16 }}>✓</span> {serverSuccess}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} noValidate>

//             {/* Email */}
//             <Field label="Email address">
//               <input
//                 type="email"
//                 value={email.value}
//                 onChange={e => touchEmail(e.target.value)}
//                 onBlur={blurEmail}
//                 placeholder="you@example.com"
//                 autoComplete="email"
//                 style={inputStyle(!!email.error && email.touched)}
//               />
//               <ErrorMsg msg={email.error} touched={email.touched} />
//             </Field>

//             {/* Password */}
//             <Field label="Password" style={{ marginTop: '1rem' }}>
//               <div style={{ position: 'relative' }}>
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={password.value}
//                   onChange={e => touchPassword(e.target.value)}
//                   onBlur={blurPassword}
//                   placeholder="Min. 6 characters"
//                   autoComplete={isSignup ? 'new-password' : 'current-password'}
//                   style={{ ...inputStyle(!!password.error && password.touched), paddingRight: 44 }}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(p => !p)}
//                   style={eyeBtn}
//                   tabIndex={-1}
//                 >
//                   {showPassword ? '🙈' : '👁️'}
//                 </button>
//               </div>
//               <ErrorMsg msg={password.error} touched={password.touched} />

//               {/* Strength bar — signup only */}
//               {isSignup && password.value && (
//                 <div style={{ marginTop: 8 }}>
//                   <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
//                     {[1,2,3,4,5].map(i => (
//                       <div key={i} style={{
//                         flex: 1, height: 3, borderRadius: 2,
//                         background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
//                         transition: 'background 0.3s',
//                       }} />
//                     ))}
//                   </div>
//                   {strength.label && (
//                     <span style={{ fontSize: 11, color: strength.color, fontWeight: 500 }}>
//                       {strength.label} password
//                     </span>
//                   )}
//                 </div>
//               )}
//             </Field>

//             {/* Confirm password — signup only */}
//             {isSignup && (
//               <Field label="Confirm password" style={{ marginTop: '1rem' }}>
//                 <div style={{ position: 'relative' }}>
//                   <input
//                     type={showConfirm ? 'text' : 'password'}
//                     value={confirm.value}
//                     onChange={e => touchConfirm(e.target.value)}
//                     onBlur={blurConfirm}
//                     placeholder="Re-enter password"
//                     autoComplete="new-password"
//                     style={{ ...inputStyle(!!confirm.error && confirm.touched), paddingRight: 44 }}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirm(p => !p)}
//                     style={eyeBtn}
//                     tabIndex={-1}
//                   >
//                     {showConfirm ? '🙈' : '👁️'}
//                   </button>
//                   {/* Match indicator */}
//                   {confirm.value && !confirm.error && (
//                     <span style={{
//                       position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)',
//                       color: '#22c55e', fontSize: 14,
//                     }}>✓</span>
//                   )}
//                 </div>
//                 <ErrorMsg msg={confirm.error} touched={confirm.touched} />
//               </Field>
//             )}

//             {/* Forgot password */}
//             {!isSignup && (
//               <div style={{ textAlign: 'right', marginTop: 6, marginBottom: 4 }}>
//                 <button
//                   type="button"
//                   style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.8)', fontSize: 12, cursor: 'pointer', padding: 0 }}
//                   onClick={async () => {
//                     if (!email.value) { setEmail(p => ({ ...p, error: 'Enter your email first', touched: true })); return }
//                     const { error } = await supabase.auth.resetPasswordForEmail(email.value)
//                     if (!error) setServerSuccess('Password reset email sent!')
//                     else setServerError(error.message)
//                   }}
//                 >
//                   Forgot password?
//                 </button>
//               </div>
//             )}

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               style={{
//                 width: '100%', marginTop: '1.25rem',
//                 padding: '13px 0', borderRadius: 12, border: 'none',
//                 background: loading
//                   ? 'rgba(124,58,237,0.4)'
//                   : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
//                 color: '#fff', fontSize: 15, fontWeight: 600,
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.45)',
//                 transition: 'all 0.2s ease',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
//               }}
//             >
//               {loading ? (
//                 <>
//                   <span style={{
//                     width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
//                     borderTopColor: '#fff', borderRadius: '50%',
//                     display: 'inline-block',
//                     animation: 'spin 0.7s linear infinite',
//                   }} />
//                   Please wait...
//                 </>
//               ) : (
//                 isSignup ? 'Create Account' : 'Sign In'
//               )}
//             </button>
//           </form>

//           {/* Divider */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.25rem 0' }}>
//             <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
//             <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>or continue with</span>
//             <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
//           </div>

//           {/* Google */}
//       {/* <button
//             onClick={handleGoogle}
//             style={{
//               width: '100%', padding: '12px 0', borderRadius: 12,
//               background: 'rgba(255,255,255,0.07)',
//               border: '1px solid rgba(255,255,255,0.12)',
//               color: '#fff', fontSize: 14, fontWeight: 500,
//               cursor: 'pointer', transition: 'all 0.2s ease',
//               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
//             }}
//             onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
//             onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
//           >
//             <svg width="18" height="18" viewBox="0 0 18 18">
//               <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
//               <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
//               <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
//               <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
//             </svg>
//             Continue with Google
//           </button> */}

//           {/* Switch mode */}
//           <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: '1.25rem' }}>
//             {isSignup ? 'Already have an account? ' : "Don't have an account? "}
//             <button
//               onClick={switchMode}
//               style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
//             >
//               {isSignup ? 'Sign in' : 'Sign up free'}
//             </button>
//           </p>
//         </div>

//         <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: '1.25rem' }}>
//           By continuing you agree to our Terms & Privacy Policy
//         </p>
//       </div>

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//         input::placeholder { color: rgba(255,255,255,0.25); }
//         input:-webkit-autofill {
//           -webkit-box-shadow: 0 0 0 100px rgba(255,255,255,0.05) inset !important;
//           -webkit-text-fill-color: #fff !important;
//         }
//       `}</style>
//     </div>
//   )
// }

// // ── Sub-components ────────────────────────────────────
// function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
//   return (
//     <div style={style}>
//       <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
//         {label}
//       </label>
//       {children}
//     </div>
//   )
// }

// function ErrorMsg({ msg, touched }: { msg: string; touched: boolean }) {
//   if (!msg || !touched) return null
//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center', gap: 5,
//       color: '#fca5a5', fontSize: 12, marginTop: 5,
//     }}>
//       <span style={{ fontSize: 13 }}>⚠</span> {msg}
//     </div>
//   )
// }

// // ── Styles ────────────────────────────────────────────
// const inputStyle = (hasError: boolean): React.CSSProperties => ({
//   width: '100%',
//   background: 'rgba(255,255,255,0.07)',
//   border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
//   borderRadius: 10,
//   padding: '11px 14px',
//   color: '#fff',
//   fontSize: 14,
//   outline: 'none',
//   transition: 'border-color 0.2s, box-shadow 0.2s',
//   boxSizing: 'border-box',
//   boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
// })

// const eyeBtn: React.CSSProperties = {
//   position: 'absolute', right: 12, top: '50%',
//   transform: 'translateY(-50%)',
//   background: 'none', border: 'none',
//   cursor: 'pointer', fontSize: 16,
//   lineHeight: 1, padding: 0,
//   color: 'rgba(255,255,255,0.4)',
// }


'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const validators = {
  email: (v: string) => {
    if (!v) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address'
    return ''
  },
  password: (v: string) => {
    if (!v) return 'Password is required'
    if (v.length < 6) return 'Password must be at least 6 characters'
    return ''
  },
  confirmPassword: (v: string, password: string) => {
    if (!v) return 'Please confirm your password'
    if (v !== password) return 'Passwords do not match'
    return ''
  },
}

interface FieldState { value: string; error: string; touched: boolean }
const initField = (): FieldState => ({ value: '', error: '', touched: false })

export default function LoginPage() {
  const router = useRouter()
  const [isSignup,       setIsSignup]       = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [serverError,    setServerError]    = useState('')
  const [serverSuccess,  setServerSuccess]  = useState('')
  const [showPassword,   setShowPassword]   = useState(false)
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [mounted,        setMounted]        = useState(false)
  const [email,          setEmail]          = useState<FieldState>(initField())
  const [password,       setPassword]       = useState<FieldState>(initField())
  const [confirm,        setConfirm]        = useState<FieldState>(initField())

  useEffect(() => { setMounted(true) }, [])

  const touchEmail = (v: string) => {
    setEmail({ value: v, error: email.touched ? validators.email(v) : '', touched: email.touched })
  }
  const blurEmail = () => setEmail(p => ({ ...p, error: validators.email(p.value), touched: true }))

  const touchPassword = (v: string) => {
    if (confirm.touched) setConfirm(p => ({ ...p, error: validators.confirmPassword(p.value, v) }))
    setPassword({ value: v, error: password.touched ? validators.password(v) : '', touched: password.touched })
  }
  const blurPassword = () => setPassword(p => ({ ...p, error: validators.password(p.value), touched: true }))

  const touchConfirm = (v: string) => setConfirm({ value: v, error: confirm.touched ? validators.confirmPassword(v, password.value) : '', touched: confirm.touched })
  const blurConfirm  = () => setConfirm(p => ({ ...p, error: validators.confirmPassword(p.value, password.value), touched: true }))

  const getStrength = (v: string) => {
    if (!v) return { score: 0, label: '', color: '' }
    let score = 0
    if (v.length >= 6)  score++
    if (v.length >= 10) score++
    if (/[A-Z]/.test(v)) score++
    if (/[0-9]/.test(v)) score++
    if (/[^A-Za-z0-9]/.test(v)) score++
    if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' }
    if (score <= 3) return { score, label: 'Medium', color: '#f59e0b' }
    return             { score, label: 'Strong', color: '#22c55e' }
  }
  const strength = getStrength(password.value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    setServerSuccess('')

    const emailErr    = validators.email(email.value)
    const passwordErr = validators.password(password.value)
    const confirmErr  = isSignup ? validators.confirmPassword(confirm.value, password.value) : ''

    setEmail(p    => ({ ...p, error: emailErr,    touched: true }))
    setPassword(p => ({ ...p, error: passwordErr, touched: true }))
    if (isSignup) setConfirm(p => ({ ...p, error: confirmErr, touched: true }))
    if (emailErr || passwordErr || (isSignup && confirmErr)) return

    setLoading(true)

    if (isSignup) {
      // ── Signup fix: signUp + manual profile insert ──
      const { data, error } = await supabase.auth.signUp({
        email:    email.value,
        password: password.value,
        options: {
          data: { full_name: email.value.split('@')[0] }
        }
      })

      if (error) {
        // Handle common signup errors
        if (error.message.includes('already registered')) {
          setServerError('This email is already registered. Please sign in.')
        } else if (error.status === 500) {
          setServerError('Server error — please try again in a moment.')
        } else {
          setServerError(error.message)
        }
      } else if (data.user) {
        // Manually create profile (fallback if trigger fails)
        await supabase.from('profiles').upsert({
          id:         data.user.id,
          email:      data.user.email,
          full_name:  data.user.email?.split('@')[0],
          avatar_url: null,
        }, { onConflict: 'id' })

        setServerSuccess('Account created! Check your email to confirm, then sign in.')
        setIsSignup(false)
        setEmail(initField())
        setPassword(initField())
        setConfirm(initField())
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email:    email.value,
        password: password.value,
      })
      if (error) {
        if (error.message.includes('Invalid login') || error.message.includes('invalid_credentials')) {
          setServerError('Incorrect email or password.')
        } else if (error.message.includes('Email not confirmed')) {
          setServerError('Please confirm your email first. Check your inbox.')
        } else {
          setServerError(error.message)
        }
      } else {
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  const switchMode = () => {
    setIsSignup(p => !p)
    setEmail(initField())
    setPassword(initField())
    setConfirm(initField())
    setServerError('')
    setServerSuccess('')
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: linear-gradient(135deg,#0f0c29,#302b63,#24243e); min-height: 100vh; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(255,255,255,0.05) inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        .login-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          font-family: 'DM Sans','Segoe UI',sans-serif;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }
        .inp {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 11px 14px;
          color: #fff;
          font-size: 14px;
          outline: none;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          transition: border-color 0.2s;
        }
        .inp:focus { border-color: rgba(124,58,237,0.6); }
        .inp-err { border-color: rgba(239,68,68,0.5) !important; }
        .tab-btn {
          flex: 1;
          padding: 8px 0;
          border-radius: 9px;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          transition: all 0.2s ease;
        }
        .tab-active {
          background: linear-gradient(135deg,#7c3aed,#4f46e5);
          color: #fff;
          box-shadow: 0 2px 8px rgba(124,58,237,0.4);
        }
        .tab-inactive { background: transparent; color: rgba(255,255,255,0.4); }
        .submit-btn {
          width: 100%;
          padding: 13px 0;
          border-radius: 12px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .google-btn {
          width: 100%;
          padding: 12px 0;
          border-radius: 12px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
        }
        .google-btn:hover { background: rgba(255,255,255,0.12); }
        .eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          padding: 0;
          color: rgba(255,255,255,0.4);
        }
        /* Mobile responsive */
        @media (max-width: 480px) {
          .login-card { max-width: 100%; }
          .login-inner { padding: 20px 16px !important; }
          .login-title { font-size: 22px !important; }
        }
      `}</style>

      <div className="login-wrap">
        {/* Ambient orbs — hidden on mobile for performance */}
        <div style={{ position:'fixed', top:'15%', left:'10%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', pointerEvents:'none', display:'var(--orb-display,block)' }} />
        <div style={{ position:'fixed', bottom:'15%', right:'10%', width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%)', pointerEvents:'none' }} />

        <div className="login-card">
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', marginBottom:'0.75rem', boxShadow:'0 8px 24px rgba(124,58,237,0.4)' }}>
              <span style={{ color:'#fff', fontSize:20, fontWeight:700 }}>L</span>
            </div>
            <h1 className="login-title" style={{ color:'#fff', fontSize:24, fontWeight:700, margin:0 }}>LearnTrack</h1>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:4 }}>
              {isSignup ? 'Start your learning journey' : 'Welcome back, keep learning'}
            </p>
          </div>

          {/* Card */}
          <div className="login-inner" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'1.5rem', boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>

            {/* Tab switcher */}
            <div style={{ display:'flex', background:'rgba(0,0,0,0.25)', borderRadius:12, padding:4, marginBottom:'1.25rem', gap:4 }}>
              <button className={`tab-btn ${!isSignup ? 'tab-active' : 'tab-inactive'}`} onClick={() => !isSignup ? null : switchMode()}>Sign In</button>
              <button className={`tab-btn ${isSignup ? 'tab-active' : 'tab-inactive'}`}  onClick={() => isSignup  ? null : switchMode()}>Sign Up</button>
            </div>

            {/* Server messages */}
            {serverError && (
              <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5', fontSize:13, padding:'10px 14px', borderRadius:10, marginBottom:'1rem', display:'flex', alignItems:'flex-start', gap:8 }}>
                <span style={{ fontSize:15, flexShrink:0 }}>⚠</span> {serverError}
              </div>
            )}
            {serverSuccess && (
              <div style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)', color:'#86efac', fontSize:13, padding:'10px 14px', borderRadius:10, marginBottom:'1rem', display:'flex', alignItems:'flex-start', gap:8 }}>
                <span style={{ fontSize:15, flexShrink:0 }}>✓</span> {serverSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:500, marginBottom:6 }}>Email address</label>
                <input
                  className={`inp ${email.error && email.touched ? 'inp-err' : ''}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email.value}
                  onChange={e => touchEmail(e.target.value)}
                  onBlur={blurEmail}
                  autoComplete="email"
                />
                {email.error && email.touched && <p style={{ color:'#fca5a5', fontSize:12, marginTop:4 }}>⚠ {email.error}</p>}
              </div>

              {/* Password */}
              <div style={{ marginBottom: isSignup ? '0.75rem' : '0.5rem' }}>
                <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:500, marginBottom:6 }}>Password</label>
                <div style={{ position:'relative' }}>
                  <input
                    className={`inp ${password.error && password.touched ? 'inp-err' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password.value}
                    onChange={e => touchPassword(e.target.value)}
                    onBlur={blurPassword}
                    style={{ paddingRight:44 }}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {password.error && password.touched && <p style={{ color:'#fca5a5', fontSize:12, marginTop:4 }}>⚠ {password.error}</p>}

                {/* Strength bar */}
                {isSignup && password.value && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)', transition:'background 0.3s' }} />
                      ))}
                    </div>
                    {strength.label && <span style={{ fontSize:11, color:strength.color, fontWeight:500 }}>{strength.label} password</span>}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              {isSignup && (
                <div style={{ marginBottom:'0.75rem' }}>
                  <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:500, marginBottom:6 }}>Confirm password</label>
                  <div style={{ position:'relative' }}>
                    <input
                      className={`inp ${confirm.error && confirm.touched ? 'inp-err' : ''}`}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirm.value}
                      onChange={e => touchConfirm(e.target.value)}
                      onBlur={blurConfirm}
                      style={{ paddingRight:44 }}
                      autoComplete="new-password"
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                    {confirm.value && !confirm.error && (
                      <span style={{ position:'absolute', right:40, top:'50%', transform:'translateY(-50%)', color:'#22c55e', fontSize:14 }}>✓</span>
                    )}
                  </div>
                  {confirm.error && confirm.touched && <p style={{ color:'#fca5a5', fontSize:12, marginTop:4 }}>⚠ {confirm.error}</p>}
                </div>
              )}

              {/* Forgot password */}
              {!isSignup && (
                <div style={{ textAlign:'right', marginBottom:'0.75rem' }}>
                  <button type="button"
                    style={{ background:'none', border:'none', color:'rgba(167,139,250,0.8)', fontSize:12, cursor:'pointer', padding:0 }}
                    onClick={async () => {
                      if (!email.value) { setEmail(p => ({ ...p, error:'Enter your email first', touched:true })); return }
                      const { error } = await supabase.auth.resetPasswordForEmail(email.value)
                      if (!error) setServerSuccess('Password reset email sent!')
                      else setServerError(error.message)
                    }}
                  >Forgot password?</button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
                style={{ background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.45)', cursor: loading ? 'not-allowed' : 'pointer', marginTop:'0.5rem' }}
              >
                {loading ? (
                  <>
                    <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                    Please wait...
                  </>
                ) : (
                  isSignup ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'1rem 0' }}>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }} />
              <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>or</span>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Google */}
            <button className="google-btn" onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            {/* Switch */}
            <p style={{ textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:13, marginTop:'1rem' }}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={switchMode} style={{ background:'none', border:'none', color:'#a78bfa', fontSize:13, fontWeight:600, cursor:'pointer', padding:0 }}>
                {isSignup ? 'Sign in' : 'Sign up free'}
              </button>
            </p>
          </div>

          <p style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:11, marginTop:'1rem' }}>
            By continuing you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </>
  )
}
