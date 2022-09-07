process.on('message', (cantidad) => {
    let resultado = {};
    for (let i = 0; i < cantidad; i++) {
        const randomNumber = Math.floor(Math.random() * (1001 - 1) + 1);
        if (!resultado[randomNumber]) {
            resultado[randomNumber] = 1;
        } else {
            resultado[randomNumber] = resultado[randomNumber] + 1;
        }
    }

    process.send(resultado);
    process.exit();
});

process.send('listo');