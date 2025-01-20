document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = 'index.html'
      return
    }
  
    try {
      const response = await fetch('/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (!response.ok) {
        window.location.href = 'index.html'
        return
      }
  
      const userData = await response.json()
    
      const userLogo = document.getElementById('userLogo')
      userLogo.src = userData.logo
  
      const userIframe = document.getElementById('userIframe')
      userIframe.src = userData.iframeURL
    } catch (error) {
      console.error(error)
      window.location.href = 'index.html'
    }
})
  
const logoutBtn = document.getElementById('logoutBtn')
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token')
    window.location.href = 'index.html'
})