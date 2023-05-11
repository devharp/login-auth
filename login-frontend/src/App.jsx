import { useContext, useEffect, useReducer, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { StoreContext, StoreProvider } from './Store'
import { TextField, Button, InputAdornment, IconButton, OutlinedInput, Checkbox, Input } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { PAGES } from './constants'

import * as userAccountService from './services/user-account.service';
function App() {
  // User login page
  // Registration
  // Forget Password
  // JWT
  // SQLite
  // Validation

  return (
    <>
    <StoreProvider>
      <MainComponent/>
    </StoreProvider>
    </>
  )
}

function MainComponent () {
  const { page, setPage } = useContext(StoreContext);

  useEffect(() => {
    verifyToken();
  }, []);

  async function verifyToken () {
    const { status } = await userAccountService.verifyTokenEntity();
    if(status === 200) setPage(PAGES.HOME);
  }

  function logout() {
    userAccountService.setTokenEntity(null);
    setPage(PAGES.LOGIN);
  }

  return (
    <>
      <div className='d-flex justify-content-center py-4'>
        { (page.index === PAGES.LOGIN.index || page.index === PAGES.REGISTER.index) && <LoginRegisterPage page={page} setPage={setPage} /> }  
        { (page.index === PAGES.HOME.index) && <HomePage logout={logout}/> }  
        { (page.index === PAGES.FORGOT_PASSWORD.index) && <ForgotPassword /> }  
      </div>
    </>
  )
}

function ForgotPassword() {
  const { setPage } = useContext(StoreContext);
  const otpRef = useRef();
  const emailRef = useRef();
  
  function verifyEmailOTP() {
    const email = emailRef.current.value;
    const otp = otpRef.current.value;
    userAccountService.verifyEmailOTP({ email, otp });
  }

  function backToLogin() {
    setPage(PAGES.LOGIN);
  }

  return(
  <div className='d-flex align-items-center flex-column'>
    <h1 className='mb-3'>Forgot Password</h1>
    <TextField inputRef={emailRef} className='mb-3' type='email' size='small' label='email' />
    <TextField
      inputRef={otpRef}
      label="OTP"
      variant="outlined"
      InputProps={{
        maxLength: 6,
      }}
      type='number'
      size='small'
      className='mb-3'
    />
    <Button className='mb-3' onClick={verifyEmailOTP} size='small' variant='contained' >Verify</Button>
    <Button className='mb-3' onClick={backToLogin} size='small' variant='outlined' >Back</Button>
  </div>
  )
}

function HomePage({ logout }) {
  return (
    <div className='d-flex flex-column'>
      <h1>Home Page loaded</h1>
      <Button className='m-2' variant='outlined' onClick={logout} >Logout</Button>
    </div>
  )
}

function LoginRegisterPage( { page, setPage } ) {
  const usernameRef = useRef();
  const passwordRef = useRef();
  const conPasswordRef = useRef();
  const [rememberCheck, setRememberCheck] = useState(false);
  const emailRef = useRef();

  useEffect(() => {
    setCredentials();
  }, []);

  function setCredentials() {
    const credentials = userAccountService.getCredentials();
    if (!credentials) return;

    setRememberCheck(credentials.rememberMe);
    usernameRef.current.value = credentials.username;
    passwordRef.current.value = credentials.password;
        
  }

  async function getRequest(event) {
    event.preventDefault();
    if (page.index === PAGES.LOGIN.index) {
      const username = usernameRef.current.value;
      const password = passwordRef.current.value;
      const { data, status } = await userAccountService.login({ username, password });   
      if (status !== 200 || !data.token) return;

      userAccountService.setTokenEntity(data.token);
      if (rememberCheck) {
        userAccountService.rememberCredentials({ username, password });
      } else {
        userAccountService.removeCredentials();
      }
      setHomePage();
    }
    
    if (page.index === PAGES.REGISTER.index) {
      const username = usernameRef.current.value;
      const password = passwordRef.current.value;
      const conPassword = conPasswordRef.current.value;
      const email = emailRef.current.value;

      if (username.length === 0 || password.length === 0 || conPassword.length === 0 || email.length === 0) return;
      if (password !== conPassword) return;
      
      try{
        const { status } = await userAccountService.register({ username, password, email });
        if (status === 200) {
          usernameRef.current.value = ''; passwordRef.current.value = ''; emailRef.current.value = '';
          await usernameRef.current.focus(); passwordRef.current.focus(); emailRef.current.focus();
          setLoginPage();
        }
      } catch (err) {
        console.log(err);
      }
    }

  }

  function setLoginPage() {
    setPage(PAGES.LOGIN);
  }

  function setRegisterPage() {
    setPage(PAGES.REGISTER);
  }

  function setHomePage() {
    setPage(PAGES.HOME);
  }

  function setForgotPassword() {
    setPage(PAGES.FORGOT_PASSWORD);
  }

  return (
  <form onSubmit={getRequest} className='d-flex flex-column' style={{ maxWidth: '20em' }}>
      <h1 className='text-center mb-3'>{ page.title } here</h1>
      <div className='d-flex flex-column'>
        <UsernameField inputRef={ usernameRef } className='mb-3' label='username' />
        <PasswordField inputRef={ passwordRef } className='mb-3' label='password' />
        { page.index === PAGES.REGISTER.index && <PasswordField inputRef={ conPasswordRef } className='mb-3' label='confirm password' /> }
        { page.index === PAGES.REGISTER.index && <EmailField inputRef={ emailRef } className='mb-3' label='email' /> }
      </div>
      { page.index === PAGES.LOGIN.index && <div className='d-flex align-items-center justify-content-center mb-2'>
        <div><Checkbox checked={rememberCheck} onChange={(e) => setRememberCheck(e.target.checked) } /></div>
        <div>Remember Me</div>
      </div> }
      { page.index === PAGES.LOGIN.index && <Button type='submit' className='' variant='contained' >Login</Button> }
      { page.index === PAGES.REGISTER.index && <Button type='submit' className='' variant='contained' >Sign Up</Button> }
      <hr/>
      { page.index === PAGES.LOGIN.index && <Button className='mb-3' type='submit' onClick={setRegisterPage} variant='outlined' >Create an account</Button> }
      { page.index === PAGES.REGISTER.index && <Button className='mb-3' type='submit' onClick={setLoginPage} variant='outlined' >Have an account</Button> }
      
      { page.index === PAGES.LOGIN.index && <Button onClick={setForgotPassword} className='mb-3' size='small' variant='outlined' >Forgot Password?</Button> }

  </form>
  );
}

function UsernameField({ inputRef, className, label }) {
  const [username, setUsername] = useState('');
  const [helpertextusername, setHelperTextUsername] = useState('');
  function handleHelperTextUsername() {
    if (username.length < 8 || username.length > 16) {
      setHelperTextUsername('characters between 8 to 16 are allowed');
    }
    else {
      setHelperTextUsername('');
    }
  }
  function setUsernameValue(val) {
    handleHelperTextUsername();
    if (username.length === 0) {
      const number = /[A-Z0-9]/.exec(val);
      if (number === null) { setUsername(val); }
      return;
    }
    const unwanted = /[A-Z\?\~\`\!\@\#\$\%\^\&\*\(\)\-\_\+\=\{\}\[\]\|\\\/\:\;\"\'\<\>\,\.]/.exec(val);
    if (unwanted === null) {
      setUsername(val);
      return;
    }
  }
  return <TextField required={true} onChange={(e) => { setUsernameValue(e.target.value) }} inputRef={ inputRef } helperText={helpertextusername} onKeyUpCapture={handleHelperTextUsername} error={helpertextusername.length === 0 ? false : true} className={className} size='small' variant='outlined' label={label} type='text' />
}
function PasswordField({ inputRef, className, label }) {
  const [password, setPassword] = useState('');
  const [helpertextpassword, setHelperTextPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  function setPasswordValue(val) {
    setPassword(v => val);
  }

  function handleHelperTextPassword() {
    if (password.length <= 8) {
      setHelperTextPassword('characters should be atleast 8');
      return;
    }
    else if (!/[A-Z]/.test(password)) {
      setHelperTextPassword('atleast one capital letter required')
      return;
    }
    else if (!/[a-z]/.test(password)) {
      setHelperTextPassword('atleast one small letter required')
      return;
    }
    else if (!/[0-9]/.test(password)) {
      setHelperTextPassword('atleast one number required')
      return;
    }
    else if (!/[!@#$%^&*()_\-{}[\]<>,\.?:;'"]/.test(password)) {
      setHelperTextPassword('atleast one special symbol required')
      return;
    }
    else {
      setHelperTextPassword('');
    }

  }
  return(
  <>

    <TextField
      required={true}
      inputRef={ inputRef }
      type={showPassword ? 'text' : 'password'}
      InputProps={{
        endAdornment: 
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      }}
      onChange={(e) => setPasswordValue(e.currentTarget.value)}
      onKeyUpCapture={handleHelperTextPassword}
      error={helpertextpassword.length === 0 ? false : true}
      helperText={helpertextpassword}
      label={label}
      className={className} size='small' variant='outlined'
    />
  </>)
}
function EmailField({ inputRef, className, label }){
  const [email, setEmail] = useState('');
  const [helpertextemail, setHelperTextEmail] = useState('');

  function handleHelperTextEmail() {
    const emailvalid = /^.*?@[a-z0-9]*\..{1,}$/.exec(email);
    if (emailvalid === null) {
      setHelperTextEmail('incorrect email');
    }
    else {
      setHelperTextEmail('');
    }
  }
  return <TextField inputRef={inputRef} onKeyUpCapture={handleHelperTextEmail} error={helpertextemail.length === 0 ? false : true} helperText={helpertextemail} onChange={(e) => { setEmail(e.target.value) }} value={email} className={ className } variant='outlined' label={ label } size='small' type={'email'} />
}

export default App
