const socket = io()
function writeDespedida(data) {
    document.querySelector('#despedida').innerHTML = `Hasta luego ${data}!`
}
socket.on('server:bienvenida', nombre => {
    writeDespedida(nombre)
})

// fetch('http://localhost:8080/user')
//     .then(response => response.json())
//     .then(data => writeDespedida(data));

function redireccionar(pagina) {
    location.href = pagina;
}

function volver() {
    console.log('volver');
    redireccionar('/')
}