const usersList = document.getElementById('usersList')
const token = localStorage.getItem('token')
  
document.getElementById('confirmCreateUserBtn').addEventListener('click', createUser)

document.getElementById("createUserBtn").addEventListener("click", function() {
  document.getElementById("popup").classList.add("active")
})

document.querySelector(".close-btn").addEventListener("click", function() {
  document.getElementById("popup").classList.remove("active")
})

const logoutBtn = document.getElementById('logoutBtn')
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token')
    window.location.href = 'index.html'
})

async function loadUsers() {
  try {
    const response = await fetch('/usuarios', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 403) {
        alert('No tienes permisos para acceder a esta página.')
        window.location.href = '/login.html'
      }
      throw new Error('Error al cargar los usuarios')
    }

    const users = await response.json()
    usersList.innerHTML = users.map(user => `
      <div class="user-card">
        <img src="${user.url_logo}" alt="${user.email}" class="user-logo">
        <p><strong>Usuario:</strong> ${user.email}</p>
        <button onclick="editUser('${user.email}')">Editar</button>
        <button onclick="deleteUser('${user.email}')">Eliminar</button>
      </div>
    `).join('')
  } catch (error) {
    console.error(error)
  }
}

async function createUser() {
  const username = document.getElementById('newUsername').value
  const password = document.getElementById('newPassword').value
  const logo = document.getElementById('newLogo').value
  const iframeURL = document.getElementById('newIframeURL').value

  try {
    const response = await fetch('/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, password, logo, iframeURL }),
    })

    if (!response.ok) throw new Error('Error al crear usuario')

    alert('Usuario creado con éxito')
    document.getElementById('newUsername').value = ''
    document.getElementById('newPassword').value = ''
    document.getElementById('newLogo').value = ''
    document.getElementById('newIframeURL').value = ''
    document.getElementById("popup").classList.remove("active")
    loadUsers()
  } catch (error) {
    console.error(error)
    alert('No se pudo crear el usuario')
  }
}

async function editUser(user) {
  const newLogo = prompt('Introduce la nueva URL del logo:')
  const newIframeURL = prompt('Introduce la nueva URL del iframe:')

  try {
    const response = await fetch(`/usuarios/${user}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        logo: newLogo,
        iframeURL: newIframeURL,
      }),
    })

    if (!response.ok) throw new Error('Error al editar usuario')

    alert('Usuario actualizado')
    loadUsers()
  } catch (error) {
    console.error(error)
    alert('No se pudo editar el usuario')
  }
}

async function deleteUser(user) {
  if (!confirm(`¿Seguro que deseas eliminar a ${user}?`)) return

  try {
    const response = await fetch(`/usuarios/${user}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) throw new Error('Error al eliminar usuario')

    alert('Usuario eliminado')
    loadUsers()
  } catch (error) {
    console.error(error)
    alert('No se pudo eliminar el usuario')
  }
}

loadUsers()
