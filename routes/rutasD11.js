import { fork } from 'child_process';
import os from "os"

function info(req, res) {
    const result = {
        argumentos: `${process.argv.slice(2)}`,
        plataforma: process.platform,
        versionNode: process.version,
        usoMemoria: process.memoryUsage().rss,
        cantCpus: os.cpus().length,
        path: process.execPath,
        processId: process.pid,
        carpetaProyecto: process.cwd(),
    };
    //console.log(result)
    res.status(200).render('info', result);
}

function randoms(req, res) {
    let cantidad = req.query.cant;

    if (!cantidad) {
        cantidad = 1e8;
    }
    // const forked = fork('controllers/generarNumerosRandom.js'); DESACTIVO EL CHILD-PROCESS

    // forked.on('message', (resultado) => {
    //     if (resultado === 'listo') {
    //         forked.send(cantidad);
    //     } else {
    //         res.status(200).json({ resultado: resultado });
    //     }
    // });

    let resultado = {};
    for (let i = 0; i < cantidad; i++) {
        const randomNumber = Math.floor(Math.random() * (1001 - 1) + 1);
        if (!resultado[randomNumber]) {
            resultado[randomNumber] = 1;
        } else {
            resultado[randomNumber] = resultado[randomNumber] + 1;
        }
    }

    res.status(200).json({ resultado: resultado });
}

export default {
    info,
    randoms
};
