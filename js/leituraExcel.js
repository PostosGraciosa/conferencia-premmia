// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// ==========================================

let dadosPremmia = [];
let dadosInterno = [];


// ==========================================
// ELEMENTOS
// ==========================================

function getElemento(id) {
    return document.getElementById(id);
}


// ==========================================
// CARREGAMENTO DOS ARQUIVOS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const arquivoPremmia = getElemento("arquivoPremmia");
    const arquivoInterno = getElemento("arquivoInterno");

    if (arquivoPremmia) {

        arquivoPremmia.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            const nome = getElemento("nomePremmia");

            if (nome) {
                nome.textContent = file.name;
            }

            lerPremmia(file);

        });

    }


    if (arquivoInterno) {

        arquivoInterno.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            const nome = getElemento("nomeInterno");

            if (nome) {
                nome.textContent = file.name;
            }

            lerInterno(file);

        });

    }

});


// ==========================================
// ABRIR EXCEL
// ==========================================

function abrirExcel(file, callback) {

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const dados =
                new Uint8Array(e.target.result);

            const workbook =
                XLSX.read(
                    dados,
                    {
                        type: "array",
                        cellDates: true
                    }
                );

            const primeira =
                workbook.SheetNames[0];

            const planilha =
                workbook.Sheets[primeira];

            const linhas =
                XLSX.utils.sheet_to_json(
                    planilha,
                    {
                        header: 1,
                        defval: "",
                        raw: true
                    }
                );

            callback(linhas);

        } catch (erro) {

            console.error(
                "Erro ao abrir Excel:",
                erro
            );

            alert(
                "Não foi possível ler a planilha."
            );

        }

    };

    reader.readAsArrayBuffer(file);

}


// ==========================================
// LER PREMMIA
// ==========================================

function lerPremmia(file) {

    abrirExcel(
        file,
        function (linhas) {

            dadosPremmia =
                transformarPremmia(linhas);

            window.dadosPremmia =
                dadosPremmia;

            console.log(
                "Premmia:",
                dadosPremmia
            );

            verificarArquivos();

        }
    );

}


// ==========================================
// LER INTERNO
// ==========================================

function lerInterno(file) {

    abrirExcel(
        file,
        function (linhas) {

            console.log(
                "Planilha interna carregada:",
                linhas
            );

            dadosInterno =
                transformarInterno(linhas);

            window.dadosInterno =
                dadosInterno;

            console.log(
                "Interno:",
                dadosInterno
            );

            verificarArquivos();

        }
    );

}


// ==========================================
// VERIFICAR ARQUIVOS
// ==========================================

function verificarArquivos() {

    const btn =
        getElemento("btnConferir");

    console.log(
        "Verificando:",
        dadosPremmia.length,
        dadosInterno.length
    );


    if (
        btn &&
        dadosPremmia.length > 0 &&
        dadosInterno.length > 0
    ) {

        btn.disabled = false;

        console.log(
            "Botão Conferir liberado"
        );

    } else {

        console.log(
            "Aguardando planilhas"
        );

    }

}


// ==========================================
// TRANSFORMAR PORTAL PREMMIA
// ==========================================

function transformarPremmia(linhas) {

    const registros = [];

    linhas.forEach(
        (linha, index) => {

            // cabeçalho
            if (index === 0) {
                return;
            }

            if (!Array.isArray(linha)) {
                return;
            }

            /*
                Portal Premmia:

                0 CPF
                1 Nome
                2 Produto
                3 Valor líquido
                4 Data/Hora da transação
                5 Código Transação
                6 Forma de Pagamento
                7 Status
            */

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
                    linha[4],

                data:
                    extrairData(linha[4]),

                hora:
                    extrairHora(linha[4]),

                autorizacao:
                    normalizarAutorizacao(linha[5]),

                pagamento:
                    limparTexto(linha[6]),

                status:
                    limparTexto(linha[7])

            };


            if (
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
// TRANSFORMAR SISTEMA INTERNO
// ==========================================

function transformarInterno(linhas) {

    const registros = [];


    /*
        Sistema Interno:

        0  Administradora
        1  Valor
        2  Horário
        3  Movimento
        4  Data Fiscal
        5  Bom Para
        6  Valor Líquido
        7  Cliente
        8  Filial
        9  Funcionário
        10 Tipo Inclusão
        11 C. de Custo
        12 Autorização
    */


    linhas.forEach(
        (linha, index) => {

            // pula cabeçalho
            if (index === 0) {
                return;
            }


            if (!Array.isArray(linha)) {
                return;
            }


            const registro = {

                origem:
                    "INTERNO",


                administradora:
                    limparTexto(linha[0]),


                valor:
                    converterValor(linha[1]),


                hora:
                    extrairHoraInterno(linha[2]),


                movimento:
                    limparTexto(linha[3]),


                data:
                    extrairDataInterno(linha[4]),


                bomPara:
                    limparTexto(linha[5]),


                valorLiquido:
                    converterValor(linha[6]),


                cliente:
                    limparTexto(linha[7]),


                filial:
                    limparTexto(linha[8]),


                operador:
                    limparTexto(linha[9]),


                tipo:
                    limparTexto(linha[10]),


                centroCusto:
                    limparTexto(linha[11]),


                autorizacao:
                    normalizarAutorizacao(linha[12])

            };


            console.log(
                "Linha interna:",
                registro
            );


            /*
                IMPORTANTE:

                Não exigimos autorização.

                Vale e Desconto podem precisar
                ser conferidos pelo valor.
            */

            if (
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
// NORMALIZAR AUTORIZAÇÃO
// ==========================================

function normalizarAutorizacao(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    let texto =
        String(valor)
        .trim()
        .toUpperCase();


    /*
        Remove espaços
    */

    texto =
        texto.replace(/\s/g, "");


    /*
        Remove .0 do Excel

        Exemplo:

        123456.0
        ↓
        123456
    */

    texto =
        texto.replace(/\.0$/, "");


    /*
        Remove caracteres especiais
    */

    texto =
        texto.replace(/[^\w]/g, "");


    return texto;

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


    // Excel já entregou número
    if (
        typeof valor === "number"
    ) {

        return Number(
            valor.toFixed(2)
        );

    }


    let texto =
        String(valor)
        .trim();


    if (!texto) {
        return null;
    }


    /*
        Remove R$
    */

    texto =
        texto.replace(
            /R\$/gi,
            ""
        );


    texto =
        texto.trim();


    /*
        Se estiver no padrão brasileiro:

        1.234,56
        ↓
        1234.56
    */

    if (
        texto.includes(",")
    ) {

        texto =
            texto
            .replace(/\./g, "")
            .replace(",", ".");

    }


    /*
        Se não tem vírgula,
        mantém ponto decimal.

        Exemplo:

        123.45
    */


    const numero =
        Number(texto);


    if (
        isNaN(numero)
    ) {

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


    return String(valor).trim();

}


// ==========================================
// DATA PREMMIA
// ==========================================

function extrairData(valor) {

    if (!valor) {
        return "";
    }


    if (
        valor instanceof Date
    ) {

        return valor.toLocaleDateString(
            "pt-BR"
        );

    }


    return String(valor);

}


// ==========================================
// HORA PREMMIA
// ==========================================

function extrairHora(valor) {

    if (!valor) {
        return "";
    }


    if (
        valor instanceof Date
    ) {

        return valor.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    const texto =
        String(valor);


    const resultado =
        texto.match(
            /\d{2}:\d{2}/
        );


    return resultado
        ? resultado[0]
        : "";

}


// ==========================================
// DATA SISTEMA INTERNO
// ==========================================

function extrairDataInterno(valor) {

    if (!valor) {
        return "";
    }


    if (
        valor instanceof Date
    ) {

        return valor.toLocaleDateString(
            "pt-BR"
        );

    }


    return String(valor).trim();

}


// ==========================================
// HORA SISTEMA INTERNO
// ==========================================

function extrairHoraInterno(valor) {

    if (!valor) {
        return "";
    }


    if (
        valor instanceof Date
    ) {

        return valor.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    const texto =
        String(valor).trim();


    const resultado =
        texto.match(
            /\d{1,2}:\d{2}/
        );


    return resultado
        ? resultado[0]
        : texto;

}


// ==========================================
// DISPONIBILIZA PARA O SISTEMA
// ==========================================

window.dadosPremmia =
    dadosPremmia;

window.dadosInterno =
    dadosInterno;


// ==========================================
// FINAL
// ==========================================

console.log(
    "leituraExcel.js completo carregado"
);
