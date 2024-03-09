const mysql =require('mysql')

const connection =mysql.createConnection({
    host: process.env.DB_HOST,
    user: 'root',  
    password:process.env.DB_PASSWORD,
    database: 'usuarioslogin'
})

connection.connect((error)=>{ 
    if(error){
        console.log('error en la conexion: ' +error)
         
        return;
    } 
    console.log('')

})

module.exports = connection;

