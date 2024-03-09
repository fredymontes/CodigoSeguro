const express = require('express');
const app = express();

// usar url encode para la captura de los datos 
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// invocar a dtoenv
const dotenv = require('dotenv');
dotenv.config ({path:'./env/env'});

// seteo de directorio publico
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

// moto de plantillas
app.set('view engine', 'ejs');

// invocar a bcryptjs
const bcryptjs = require('bcryptjs');
const session = require('express-session');

// variables de sesion
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized:true,
}))

// conexion a base de datos
const connection = require('./database/db')

// establecer las rutas

app.get('/login', (req,res)=>{
    res.render('login');
})
app.get('/register', (req,res)=>{
    res.render('register');
})

// registro
app.post('/register', async (req,res)=>{
    const user = req.body.user;
    const email = req.body.email;
    const pass = req.body.pass;
    const rol = req.body.rol;
      // Validación de longitud de la contraseña
  if (pass.length < 8) {
    // Mostrar mensaje de error: La contraseña debe tener al menos 8 caracteres.
    return res.render('register', {
      alert: true,
      alertTitle: "ADVERTENCIA",
      alertMessage: "¡Error! La contraseña debe tener al menos 8 caracteres.",
      alertIcon: 'error',
      showConfirmButton: true,
      timer: 2500,
      ruta: 'register'
    });
  }

  // Validación de caracteres de la contraseña
  const regex = /^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-záéíóúüñ0-9@$!%*#?&]{8,}$/;

  if (!regex.test(pass)) {
    // Mostrar mensaje de error: La contraseña debe contener letras mayúsculas, minúsculas, números y al menos un caracter especial.
    return res.render('register', {
      alert: true,
      alertTitle: "ADVERTENCIA",
      alertMessage: "¡Error! La contraseña debe contener letras mayúsculas, minúsculas, números y al menos un caracter especial.",
      alertIcon: 'error',
      showConfirmButton: true,
      timer: 6000,
      ruta: 'register'
    });
  }
  const nameRegex = /^[a-zA-Záéíóúüñ\s]+$/;

  if (!nameRegex.test(user)) {
    // Mostrar mensaje de error: El nombre solo puede contener letras minúsculas, mayúsculas y espacios.
    return res.render('register', {
      alert: true,
      alertTitle: "ADVERTENCIA",
      alertMessage: "¡Error! El nombre solo puede contener letras minúsculas, mayúsculas y espacios.",
      alertIcon: 'error',
      showConfirmButton: true,
      timer: 6000,
      ruta: 'register'
    });
  }
    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (error, results) => {
        if (error) {
            
            res.send('Error en la consulta de correo');
        } else {
            if (results.length > 0) {
                // El correo ya existe, mostrar mensaje de error
                res.render('register', {
                    alert: true,
                    alertTitle: "ADVERTENCIA",
                    alertMessage: "¡Error! El correo ya está registrado.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: 6000,
                    ruta: 'register'
                });
            } else {
                // El correo no existe, proceder con la inserción
                let passwordHash = await bcryptjs.hash(pass, 8);
                connection.query('INSERT INTO usuarios SET ?', { nombre: user, email: email, password: passwordHash, rol: rol }, async (error, results) => {
                    if (error) {
                        
                        res.send('Error en el registro');
                    } else {
                        res.render('register', {
                            alert: true,
                            alertTitle: "Registrar",
                            alertMessage: "¡Registro exitoso!",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: ''
                        });
                    }
                });
            }
        }
    });
});
// autenticacion 

app.post('/auth', async (req,res)=>{
    const email =req.body.email;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass,8);
    if(email && pass){
        connection.query('SELECT * FROM usuarios WHERE email = ?',[email], async(error,results)=>{
            if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].password))){
                res.render('login',{
                    alert: true,
                    alertTitle: "ERROR",
                    alertMessage: "CORREO Y/O CONTRASEÑA INCORRECTA",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer:6000,
                     ruta:'login'
                })
            } else{
                req.session.loggedin=true
                req.session.name = results[0].nombre
                res.render('login',{
                    alert: true,
                    alertTitle: "CONEXIÓN EXITOSA",
                    alertMessage: "¡ACCESO CORRECTO!",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer:1500,
                     ruta:''
                })
            }
        })
    } else{
        res.render('login',{
            alert: true,
            alertTitle: "ADVERTENCIA",
            alertMessage: "FAVOR INGRESAR CORREO Y CONTRASEÑA",
            alertIcon: 'warning',
            showConfirmButton: true,
            timer:6000,
             ruta:'login'
        })
    }
})

//metodo de autenticacion de las otras paginas

app.get('/', (req,res)=> {
    if(req.session.loggedin){
        res.render('index',{
            login: true,
            name : req.session.name
            
        })
    }else{
        res.render('index',{
            login:false,
            name: 'Debe iniciar Sesión'
        })
    }
    
})

app.get('/logout', (req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3500, (req, res)=>{
    console.log('');
})

