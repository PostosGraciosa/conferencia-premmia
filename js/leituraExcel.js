```javascript
// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// Leitura das planilhas Excel / CSV
// ==========================================


// ==========================================
// ELEMENTOS DA TELA
// ==========================================

const arquivoPremmia =
    document.getElementById("arquivoPremmia");

const arquivoInterno =
    document.getElementById("arquivoInterno");

const nomePremmia =
    document.getElementById("nomePremmia");

const nomeInterno =
    document.getElementById("nomeInterno");

const btnConferir =
    document.getElementById("btnConferir");


// ==========================================
// DADOS GLOBAIS
// ==========================================

let dadosPremmia = [];

let dadosInterno = [];



// ==========================================
// EVENTO PREMMIA
// ==========================================

if (arquivoPremmia) {

    arquivoPremmia.addEventListener(
        "change",
        function () {


            if (this.files.length > 0) {


                if (nomePremmia) {

                    nomePremmia.textContent =
                        "Arquivo selecionado: " +
                        this.files[0].name;

                    nomePremmia.style.color =
                        "#006b3c";

                }


                lerArquivoPremmia(
                    this.files[0]
                );


            } else {


                dadosPremmia = [];


                if (nomePremmia) {

                    nomePremmia.textContent =
                        "Nenhum arquivo selecionado";

                }

            }


            verificarArquivos();


        }
    );

}



// ==========================================
// EVENTO INTERNO
// ==========================================

if (arquivoInterno) {


    arquivoInterno.addEventListener(
        "change",
        function () {


            if (this.files.length > 0) {


                if (nomeInterno) {

                    nomeInterno.textContent =
                        "Arquivo selecionado: " +
                        this.files[0].name;


                    nomeInterno.style.color =
                        "#006b3c";

                }



                lerArquivoInterno(
                    this.files[0]
                );



            } else {


                dadosInterno = [];


                if (nomeInterno) {

                    nomeInterno.textContent =
                        "Nenhum arquivo selecionado";

                }


            }



            verificarArquivos();


        }
    );

}



// ==========================================
// LIBERAR BOTÃO CONFERIR
// ==========================================

function verificarArquivos() {


    if (!btnConferir) {

        return;

    }


    if (

        arquivoPremmia &&
        arquivoInterno &&
        arquivoPremmia.files.length > 0 &&
        arquivoInterno.files.length > 0

    ) {


        btnConferir.disabled = false;


    } else {


        btnConferir.disabled = true;


    }


}



// ==========================================
// LER PREMMIA
// ==========================================

function lerArquivoPremmia(file) {


    const reader =
        new FileReader();



    reader.onload =
        function(evento) {


            try {


                const dados =
                    new Uint8Array(
                        evento.target.result
                    );



                const workbook =
                    XLSX.read(
                        dados,
                        {
                            type:"array",
                            cellDates:true
                        }
                    );



                const primeiraAba =
                    workbook.SheetNames[0];



                const planilha =
                    workbook.Sheets[primeiraAba];



                const linhas =
                    XLSX.utils.sheet_to_json(
                        planilha,
                        {
                            header:1,
                            defval:""
                        }
                    );



                dadosPremmia =
                    transformarPremmia(
                        linhas
                    );



                window.dadosPremmia =
                    dadosPremmia;



                console.log(
                    "Premmia carregado:",
                    dadosPremmia
                );



                if (
                    dadosPremmia.length === 0
                ) {


                    alert(
                        "Nenhum registro encontrado no Portal Premmia."
                    );


                }



            }
            catch(erro){


                console.error(
                    erro
                );


                alert(
                    "Erro ao ler planilha Premmia."
                );


            }


        };



    reader.readAsArrayBuffer(file);


}




// ==========================================
// LER INTERNO
// ==========================================

function lerArquivoInterno(file) {


    const reader =
        new FileReader();



    reader.onload =
        function(evento) {


            try {



                const dados =
                    new Uint8Array(
                        evento.target.result
                    );



                const workbook =
                    XLSX.read(
                        dados,
                        {
                            type:"array",
                            cellDates:true
                        }
                    );



                const primeiraAba =
                    workbook.SheetNames[0];



                const planilha =
                    workbook.Sheets[primeiraAba];



                const linhas =
                    XLSX.utils.sheet_to_json(
                        planilha,
                        {
                            header:1,
                            defval:""
                        }
                    );



                dadosInterno =
                    transformarInterno(
                        linhas
                    );



                window.dadosInterno =
                    dadosInterno;



                console.log(
                    "Interno carregado:",
                    dadosInterno
                );



                if (
                    dadosInterno.length === 0
                ) {


                    alert(
                        "Nenhum registro encontrado no sistema interno."
                    );


                }



            }
            catch(erro){


                console.error(
                    erro
                );


                alert(
                    "Erro ao ler planilha interna."
                );


            }


        };



    reader.readAsArrayBuffer(file);


}





// ==========================================
// TRANSFORMAR PREMMIA
// ==========================================

function transformarPremmia(linhas) {


    const registros = [];



    linhas.forEach(
        linha => {


            if (
                !Array.isArray(linha)
            ) {

                return;

            }



            const texto =
                linha
                    .map(normalizarTexto)
                    .join(" ");



            if (

                texto.includes("cpf") ||
                texto.includes("cliente") ||
                texto.includes("autorizacao")

            ) {

                return;

            }



            const registro = {


                origem:"PREMMIA",


                cpf:
                    limparTexto(linha[0]),


                cliente:
                    limparTexto(linha[1]),


                operacao:
                    limparTexto(linha[2]),


                valor:
                    converterValor(linha[3]),


                dataHora:
                    limparTexto(linha[4]),


                data:
                    extrairData(linha[4]),


                hora:
                    extrairHora(linha[4]),


                autorizacao:
                    limparTexto(linha[5]),


                pagamento:
                    limparTexto(linha[6]),


                status:
                    limparTexto(linha[7])


            };



            if (

                registro.autorizacao !== "" &&
                registro.valor !== null

            ) {


                registros.push(
                    registro
                );


            }



        }
    );



    return registros;


}





// ==========================================
// TRANSFORMAR INTERNO
// ==========================================

function transformarInterno(linhas) {


    const registros = [];



    linhas.forEach(
        linha => {


            if (
                !Array.isArray(linha)
            ) {

                return;

            }



            const registro = {


                origem:"INTERNO",


                tipo:
                    limparTexto(linha[0]),


                valor:
                    converterValor(linha[1]),


                hora:
                    limparTexto(linha[2]),


                data:
                    limparTexto(linha[3]),


                operador:
                    limparTexto(linha[9]),


                identificador:
                    limparTexto(linha[12]),


                autorizacao:
                    limparTexto(linha[13]) ||
                    limparTexto(linha[12])


            };



            if (

                registro.autorizacao !== "" &&
                registro.valor !== null

            ) {


                registros.push(
                    registro
                );


            }


        }
    );



    return registros;


}





// ==========================================
// UTILIDADES
// ==========================================

function converterValor(valor){


    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ){

        return null;

    }



    if(
        typeof valor === "number"
    ){

        return Number(
            valor.toFixed(2)
        );

    }



    let texto =
        String(valor)
        .trim()
        .replace(/\./g,"")
        .replace(",", ".");



    const numero =
        Number(texto);



    return isNaN(numero)
        ? null
        : Number(numero.toFixed(2));


}





function limparTexto(valor){


    if(
        valor === null ||
        valor === undefined
    ){

        return "";

    }


    return String(valor)
        .trim()
        .replace(/\s+/g," ");


}





function normalizarTexto(valor){


    return limparTexto(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"");


}





function extrairData(valor){


    const texto =
        limparTexto(valor);


    const resultado =
        texto.match(
            /\d{2}\/\d{2}\/\d{4}/
        );


    return resultado
        ? resultado[0]
        : texto;


}





function extrairHora(valor){


    const texto =
        limparTexto(valor);


    const resultado =
        texto.match(
            /\d{2}:\d{2}:\d{2}/
        );


    return resultado
        ? resultado[0]
        : "";


}





// ==========================================
// DISPONIBILIZAR
// ==========================================

window.dadosPremmia =
    dadosPremmia;


window.dadosInterno =
    dadosInterno;



console.log(
    "leituraExcel.js carregado com sucesso"
);
```
