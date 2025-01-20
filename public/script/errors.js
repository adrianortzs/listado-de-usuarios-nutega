const loginBtn = document.getElementById('loginBtn')
const errorMsg = document.getElementById('errorMsg')
const recoverBtn = document.getElementById('recoverBtn')
const recoverMsg = document.getElementById('recoverMsg')
const resetBtn = document.getElementById('resetBtn')
const resetMsg = document.getElementById('resetMsg')

if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    errorMsg.textContent = ''
  
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
  
    if (!username || !password) {
      errorMsg.textContent = 'Por favor, complete todos los campos.'
      return
    }
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        errorMsg.textContent = errorData.error || 'Error iniciando sesión'
        return
      }
  
      const data = await response.json()
      
      const token = data.token
  
      localStorage.setItem('token', token)
  
      if (data.redirect) {
        window.location.href = data.redirect
      } else {
        errorMsg.textContent = 'Error: redirección no definida'
      }
    } catch (error) {
      console.error(error)
      errorMsg.textContent = 'El usuario y la contraseña no coinciden'
    }
  })
}

if (recoverBtn) {
  recoverBtn.addEventListener('click', async () => {
      recoverMsg.textContent = ''
      const email = document.getElementById('email').value
  
      if (!email) {
          recoverMsg.textContent = 'Por favor, ingresa tu correo electrónico.'
          return
      }
  
      try {
          const response = await fetch('/recover-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
          })
  
          const data = await response.json()
  
          if (!response.ok) {
              recoverMsg.textContent = data.error || 'Error al enviar el enlace.'
              return
          }
          
          recoverMsg.textContent = 'Correo enviado con éxito. Verifica tu bandeja de entrada.'

      } catch (error) {
          console.error(error)
          recoverMsg.textContent = 'Ocurrió un error inesperado.'
      }
  })
}

if (resetBtn) {
  resetBtn.addEventListener('click', async () => {
      resetMsg.textContent = ''
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
  
      const password = document.getElementById('password').value
      const confirmPassword = document.getElementById('confirmPassword').value
  
      if (!password || !confirmPassword) {
          resetMsg.textContent = 'Por favor, completa todos los campos.'
          return
      }
  
      if (password !== confirmPassword) {
          resetMsg.textContent = 'Las contraseñas no coinciden.'
          return
      }
  
      try {
          const response = await fetch(`/reset-password/${token}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password, confirmPassword }),
          })
  
          const data = await response.json()
  
          if (!response.ok) {
              resetMsg.textContent = data.error || 'Error al restablecer la contraseña.'
              return
          }
  
          resetMsg.textContent = 'Contraseña restablecida con éxito. Redirigiendo...'
          setTimeout(() => (window.location.href = 'index.html'), 2000)
      } catch (error) {
          console.error(error)
          resetMsg.textContent = 'Ocurrió un error inesperado.'
      }
  })
}


