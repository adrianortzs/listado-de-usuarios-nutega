const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const SECRET_KEY = 'MI_CLAVE_SECRETA'


const usersFilePath = path.join(__dirname, 'users.json');
let users = {
  'admin': {
    password: 'adminpass',
    role: 'admin',
    logo: 'https://c0.klipartz.com/pngpicture/668/617/gratis-png-logotipo-de-la-marca-movistar-empresa-bimbo.png',
    iframeURL: '',
    email: 'admin@example.com',
  },
  'usuario1': {
    password: 'pass1',
    role: 'user',
    logo: 'https://th.bing.com/th/id/R.96986afe127df79b24c49332bd3bb6d8?rik=ykA55Vs1Vlj4zw&pid=ImgRaw&r=0',
    iframeURL: 'https://www.example.com/',
  },
  'usuario2': {
    password: 'pass2',
    role: 'user',
    logo: 'https://logosmarcas.net/wp-content/uploads/2020/04/Amazon-Logo.png',
    iframeURL: 'https://app.powerbi.com/view?r=eyJrIjoiNTY5NWEwMzItYmI5ZS00OWYxLTliZGQtMTI3NmM1NzgyNjIyIiwidCI6ImZmMTA1ZDRmLTAzOWYtNDQ0Zi1iZDZmLTBlZDFlMzVkYWVmNCIsImMiOjh9',
    email: 'adrianortizsuarez3@gmail.com',
  },
}

// Leer usuarios al iniciar el servidor

if (fs.existsSync(usersFilePath)) {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  users = JSON.parse(data);
}

// Guardar usuarios en el archivo
function saveUsersToFile() {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

app.get('/userinfo', (req, res) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    return res.status(401).json({ error: 'No se proporcionó el header de autorización' })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Token no presente' })
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' })
    }

    const { username } = decoded
    const userData = {
      username,
      logo: users[username].logo,
      iframeURL: users[username].iframeURL
    }
    
    return res.json(userData)
  })
})

app.get('/admin/users', (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No se proporcionó el header de autorización' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token no presente' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    const { username } = decoded;
    const user = users[username];

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes acceso a este recurso' });
    }

    const userList = Object.entries(users).map(([key, userData]) => ({
      username: key,
      logo: userData.logo,
      iframeURL: userData.iframeURL,
    }));

    return res.json(userList);
  });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!users[username]) {
    return res.status(401).json({ error: 'Usuario no existe' })
  }

  if (users[username].password !== password) {
    return res.status(401).json({ error: 'Contraseña incorrecta' })
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' })

  if (username === 'admin') {
    return res.json({ redirect: '/admin-dashboard.html', token })
  }

  res.json({ redirect: '/dashboard.html', token })
})

app.post('/admin/users', (req, res) => {
  const authHeader = req.headers['authorization'];
  const { username, password, logo, iframeURL } = req.body;

  console.log('Body recibido en el servidor:', req.body);

  if (!username || !password || !logo || !iframeURL) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!authHeader) {
    return res.status(401).json({ error: 'No se proporcionó el header de autorización' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    const { username: adminUsername } = decoded;
    const adminUser = users[adminUsername];

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes acceso a este recurso' });
    }

    if (users[username]) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    users[username] = {
      password,
      role: 'user',
      logo,
      iframeURL,
    };

    saveUsersToFile();
    res.status(201).json({ message: 'Usuario creado con éxito' });
  });
});


app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params
  const { password, confirmPassword } = req.body
  
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' })
    }
  
    const user = users.find(user => user.resetToken === token && user.resetTokenExpiration > Date.now())
  
    if (!user) {
        return res.status(400).json({ error: 'Token inválido o caducado' })
    }
  
    // Actualizar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.resetToken = undefined
    user.resetTokenExpiration = undefined
  
    res.status(200).json({ message: 'Contraseña restablecida con éxito' })
})


app.post('/recover-password', async (req, res) => {
    const { email } = req.body
    const user = Object.values(users).find(user => user.email === email)
  
    if (!user) {
        return res.status(404).json({ error: 'Correo no encontrado' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken = token
    user.resetTokenExpiration = Date.now() + 3600000
  
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'adrianortizsuarezproyectos@gmail.com',
            pass: 'fbel orju roek xrnn'
        }
    })
  
    const mailOptions = {
        from: 'adrianortizsuarezproyectos@gmail.com',
        to: email,
        subject: 'Recuperación de contraseña',
        html:`
    <p>Hola,</p>
    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="http://localhost:3000/reset-password/${token}">Restablecer contraseña</a>
  `
    }
  
    try {
        await transporter.sendMail(mailOptions)
        res.status(200).json({ message: 'Correo enviado con éxito' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al enviar el correo' })
    }
})

app.put('/admin/users/:username', (req, res) => {
  const { username } = req.params;
  const { logo, iframeURL } = req.body;

  if (!users[username]) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  users[username].logo = logo || users[username].logo;
  users[username].iframeURL = iframeURL || users[username].iframeURL;

  saveUsersToFile();
  res.json({ message: 'Usuario actualizado correctamente', user: users[username] });
});

app.delete('/admin/users/:username', (req, res) => {
  const { username } = req.params;

  if (!users[username]) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  delete users[username];
  saveUsersToFile();
  res.json({ message: 'Usuario eliminado correctamente' });
});

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})