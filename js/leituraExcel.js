```javascript
// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// Leitura das planilhas Excel / CSV
// ==========================================


// ==========================================
// ELEMENTOS DA TELA
// ==========================================

const arquivoPremmia = document.getElementById("arquivoPremmia");
const arquivoInterno = document.getElementById("arquivoInterno");

const nomePremmia = document.getElementById("nomePremmia");
const nomeInterno = document.getElementById("nomeInterno");

const btnConferir = document.getElementById("btnConferir");


// ==========================================
// ARQUIVOS SELECIONADOS
// ==========================================

let dadosPremmia = [];
let dadosInterno = [];


// ==========================================
// MOSTRA NOME DO ARQUIVO
// ==========================================

arquivoPremmia.addEventListener("change", function () {

    if (this.files.length > 0) {

        nomePremmia.textContent =
            "Arquivo selecionado: " + this.files[0].name;

        nomePremmia.style.color = "#006b3c";

        lerArquivoPremmia(this.files[0]);

    } else {

        nomePremmia.textContent =
            "Nenhum arquivo selecionado";

        dadosPremmia = [];

    }

    verificarArquivos();

});


arquivoInterno.addEventListener("change", function () {

    if (this.files.length > 0) {

        nomeInterno.textContent =
            "Arquivo selecionado: " + this.files[0].name;

        nomeInterno.style.color = "#006b3c";

        lerArquivoInterno(this.files[0]);

    } else {

        nomeInterno.textContent =
            "Nenhum arquivo selecionado";

        dadosInterno = [];

    }

    verificarArquivos();

});


// ==========================================
// VERIFICA SE OS DOIS ARQUIVOS FORAM
// SELECIONADOS
// ==========================================

function verificarArquivos() {

    if (
        arquivoPremmia.files.length > 0 &&
        arquivoInterno.files.length > 0
    ) {

        btnConferir.disabled = false;

    } else {

        btnConferir.disabled = true;

    }

}


// ==========================================
// LER ARQUIVO PREMMIA
// ==========================================

function lerArquivoPremmia(file) {

    const reader = new FileReader();


    reader.onload = function (evento) {

        try {

            const dados = new Uint8Array(
                evento.target.result
            );

            const workbook = XLSX.read(
                dados,
                {
                    type: "array",
                    cellDates: true
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
                        header: 1,
                        defval: ""
                    }
                );


            dadosPremmia =
                transformarPremmia(linhas);


            console.log(
                "Premmia carregado:",
                dadosPremmia
            );


            if (dadosPremmia.length === 0) {

                alert(
                    "Não foi possível encontrar registros na planilha do Portal Premmia."
                );

                return;

            }


        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao ler a planilha do Portal Premmia."
            );

        }

    };


    reader.onerror = function () {

        alert(
            "Não foi possível abrir a planilha do Portal Premmia."
        );

    };


    reader.readAsArrayBuffer(file);

}


// ==========================================
// LER ARQUIVO SISTEMA INTERNO
// ==========================================

function lerArquivoInterno(file) {

    const reader = new FileReader();


    reader.onload = function (evento) {

        try {

            const dados = new Uint8Array(
                evento.target.result
            );

            const workbook = XLSX.read(
                dados,
                {
                    type: "array",
                    cellDates: true
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
                        header: 1,
                        defval: ""
                    }
                );


            dadosInterno =
                transformarInterno(linhas);


            console.log(
                "Sistema interno carregado:",
                dadosInterno
            );


            if (dadosInterno.length === 0) {

                alert(
                    "Não foi possível encontrar registros na planilha do sistema interno."
                );

                return;

            }


        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao ler a planilha do sistema interno."
            );

        }

    };


    reader.onerror = function () {

        alert(
            "Não foi possível abrir a planilha do sistema interno."
        );

    };


    reader.readAsArrayBuffer(file);

}


// ==========================================
// TRANSFORMAR DADOS DO PREMMIA
// ==========================================
//
// O Portal apresentado possui aproximadamente:
//
// CPF
// CLIENTE
// OPERAÇÃO
// VALOR
// DATA/HORA
// AUTORIZAÇÃO
// FORMA DE PAGAMENTO
// STATUS
//
// A posição das colunas será identificada
// pelo cabeçalho quando disponível.
// ==========================================

function transformarPremmia(linhas) {

    if (!linhas || linhas.length === 0) {
        return [];
    }


    const registros = [];


    for (let i = 0; i < linhas.length; i++) {

        const linha = linhas[i];


        if (!Array.isArray(linha)) {
            continue;
        }


        // Ignora linhas completamente vazias

        const possuiDados =
            linha.some(
                valor =>
                    String(valor).trim() !== ""
            );


        if (!possuiDados) {
            continue;
        }


        // ----------------------------------
        // Tenta identificar se é cabeçalho
        // ----------------------------------

        const textoLinha =
            linha
                .map(v =>
                    normalizarTexto(v)
                )
                .join(" ");


        if (
            textoLinha.includes("cpf") ||
            textoLinha.includes("cliente") ||
            textoLinha.includes("autorizacao") ||
            textoLinha.includes("autorização")
        ) {

            continue;

        }


        // ----------------------------------
        // FORMATO DO EXEMPLO ENVIADO
        // ----------------------------------

        // 0 = CPF
        // 1 = Cliente
        // 2 = Operação
        // 3 = Valor
        // 4 = Data/Hora
        // 5 = Autorização
        // 6 = Forma de pagamento
        // 7 = Status


        const registro = {

            origem: "PREMMIA",

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


        // Não adiciona linha sem autorização
        // ou sem valor válido

        if (
            registro.autorizacao !== "" &&
            registro.valor !== null
        ) {

            registros.push(registro);

        }

    }


    return registros;

}


// ==========================================
// TRANSFORMAR DADOS DO SISTEMA INTERNO
// ==========================================
//
// O exemplo enviado possui:
//
// Tipo
// Valor
// Hora
// Data
// Data de validade
// Valor líquido
// Cliente
// Empresa
// Operador
// Origem
// Setor
// Identificador
// Autorização
//
// Como a exportação pode mudar, esta função
// procura os campos pelo conteúdo.
// ==========================================

function transformarInterno(linhas) {

    if (!linhas || linhas.length === 0) {
        return [];
    }


    const registros = [];


    for (let i = 0; i < linhas.length; i++) {

        const linha = linhas[i];


        if (!Array.isArray(linha)) {
            continue;
        }


        const possuiDados =
            linha.some(
                valor =>
                    String(valor).trim() !== ""
            );


        if (!possuiDados) {
            continue;
        }


        // ----------------------------------
        // Ignora separadores
        // ----------------------------------

        const textoLinha =
            linha
                .map(v =>
                    normalizarTexto(v)
                )
                .join(" ");


        if (
            textoLinha.includes("descricao") &&
            textoLinha.includes("valor")
        ) {

            continue;

        }


        // ----------------------------------
        // FORMATO DO EXEMPLO
        // ----------------------------------

        // 0 = Tipo
        // 1 = Valor
        // 2 = Hora
        // 3 = Data
        // 4 = Data inicial
        // 5 = Data final
        // 6 = Valor líquido
        // 7 = Cliente
        // 8 = Empresa
        // 9 = Operador
        // 10 = Origem
        // 11 = Setor
        // 12 = Identificador
        // 13 = Autorização


        const tipo =
            limparTexto(linha[0]);


        const valor =
            converterValor(linha[1]);


        const hora =
            limparTexto(linha[2]);


        const data =
            limparTexto(linha[3]);


        const operador =
            limparTexto(linha[9]);


        const identificador =
            limparTexto(linha[12]);


        const autorizacaoOriginal =
            limparTexto(linha[13]);


        // ----------------------------------
        // AUTORIZAÇÃO
        // ----------------------------------
        //
        // Normalmente a coluna 13 contém
        // a mesma identificação da coluna 12.
        //
        // Se a coluna 13 estiver vazia,
        // usamos a coluna 12.
        // ----------------------------------

        const autorizacao =
            autorizacaoOriginal !== ""
                ? autorizacaoOriginal
                : identificador;


        const registro = {

            origem: "INTERNO",

            tipo:
                tipo,

            valor:
                valor,

            hora:
                hora,

            data:
                data,

            operador:
                operador,

            identificador:
                identificador,

            autorizacao:
                autorizacao

        };


        if (
            registro.autorizacao !== "" &&
            registro.valor !== null
        ) {

            registros.push(registro);

        }

    }


    return registros;

}


// ==========================================
// CONVERTER VALOR
// ==========================================

function converterValor(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;

    }


    if (typeof valor === "number") {

        return Number(
            valor.toFixed(2)
        );

    }


    let texto =
        String(valor)
            .trim()
            .replace(/\s/g, "");


    if (texto === "") {
        return null;
    }


    // Brasil:
    // 1.234,56
    // 50,04
    //
    // Também aceita:
    // 1234.56


    if (
        texto.includes(",") &&
        texto.includes(".")
    ) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

    } else if (
        texto.includes(",")
    ) {

        texto =
            texto.replace(",", ".");

    }


    const numero =
        Number(texto);


    if (isNaN(numero)) {
        return null;
    }


    return Number(
        numero.toFixed(2)
    );

}


// ==========================================
// LIMPAR TEXTO
// ==========================================

function limparTexto(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)
        .trim()
        .replace(/\s+/g, " ");

}


// ==========================================
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(valor) {

    return limparTexto(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


// ==========================================
// EXTRAIR DATA
// ==========================================

function extrairData(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    const texto =
        String(valor).trim();


    // Exemplo:
    // 06/08/2026 21:57:23

    const resultado =
        texto.match(
            /(\d{2}\/\d{2}\/\d{4})/
        );


    if (resultado) {

        return resultado[1];

    }


    return texto;

}


// ==========================================
// EXTRAIR HORA
// ==========================================

function extrairHora(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    const texto =
        String(valor).trim();


    const resultado =
        texto.match(
            /(\d{2}:\d{2}:\d{2})/
        );


    if (resultado) {

        return resultado[1];

    }


    return "";

}


// ==========================================
// DISPONIBILIZAR OS DADOS PARA OS OUTROS
// ARQUIVOS
// ==========================================

window.dadosPremmia = dadosPremmia;
window.dadosInterno = dadosInterno;
```
