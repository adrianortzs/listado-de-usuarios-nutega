const userListDiv = document.getElementById('userList')
const token = localStorage.getItem('token')

async function loadUsers() {
  try {
    const response = await fetch('/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert('No tienes permisos para acceder a esta página.');
        window.location.href = '/login.html';
      }
      throw new Error('Error al cargar usuarios');
    }

    const users = await response.json();
    userListDiv.innerHTML = users.map(user => `
      <div class="user-card">
        <img src="${user.logo}" alt="${user.username} Logo" class="user-logo">
        <p><strong>Usuario:</strong> ${user.username}</p>
        <p><strong>Iframe:</strong> ${user.iframeURL}</p>
        <button onclick="editUser('${user.username}')">Editar</button>
        <button onclick="deleteUser('${user.username}')">Eliminar</button>
      </div>
    `).join('');
  } catch (error) {
    console.error(error);
  }
}

async function createUser() {
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;
  const logo = document.getElementById('newLogo').value;
  const iframeURL = document.getElementById('newIframeURL').value;

  const requestBody = { username, password, logo, iframeURL };
  console.log('Datos enviados:', requestBody);

  try {
    const response = await fetch('/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, password, logo, iframeURL }),
    });

    if (!response.ok) throw new Error('Error al crear usuario');

    alert('Usuario creado con éxito');
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('newLogo').value = '';
    document.getElementById('newIframeURL').value = '';

    // Cierra el modal
    document.getElementById('createUserModal').style.display = 'none';
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
    loadUsers();
  } catch (error) {
    console.error(error);
    alert('No se pudo crear el usuario');
  }
}

async function editUser(username) {
  const newLogo = prompt('Introduce la nueva URL del logo:')
  const newIframeURL = prompt('Introduce la nueva URL del iframe:')

  try {
    const response = await fetch(`/admin/users/${username}`, {
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

async function deleteUser(username) {
  if (!confirm(`¿Seguro que deseas eliminar a ${username}?`)) return

  try {
    const response = await fetch(`/admin/users/${username}`, {
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

document.getElementById('createUserBtn').addEventListener('click', () => {
  document.getElementById('createUserModal').style.display = 'block';
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => {
    document.getElementById('createUserModal').style.display = 'none';
    document.body.removeChild(overlay);
  });
});

document.querySelector('#createUserModal button').addEventListener('click', createUser);