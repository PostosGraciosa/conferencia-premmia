```javascript
// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// ==========================================

let dadosPremmia = [];
let dadosInterno = [];

// ==========================================
// ELEMENTOS
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
// ARQUIVO PREMMIA
// ==========================================

if (arquivoPremmia) {

    arquivoPremmia.addEventListener(
        "change",
        function () {

            const file = this.files[0];

            if (!file) {
                return;
            }

            if (nomePremmia) {
                nomePremmia.textContent = file.name;
            }

            lerPremmia(file);

        }
    );

}


// ==========================================
// ARQUIVO INTERNO
// ==========================================

if (arquivoInterno) {

    arquivoInterno.addEventListener(
        "change",
        function () {

            const file = this.files[0];

            if (!file) {
                return;
            }

            if (nomeInterno) {
                nomeInterno.textContent = file.name;
            }

            lerInterno(file);

        }
    );

}


// ==========================================
// ABRIR EXCEL
// ==========================================

function abrirExcel(file, callback) {

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const dados =
                new Uint8Array(
                    e.target.result
                );

            const workbook =
                XLSX.read(
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
                        defval: "",
                        raw: true
                    }
                );

            callback(linhas);

        } catch (erro) {

            console.error(
                "Erro ao abrir planilha:",
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

            console.log(
                "Planilha Premmia carregada:",
                linhas
            );

            dadosPremmia =
                transformarPremmia(linhas);

            window.dadosPremmia =
                dadosPremmia;

            console.log(
                "Premmia:",
                dadosPremmia
            );

            console.log(
                "Quantidade Premmia:",
                dadosPremmia.length
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

            console.log(
                "Quantidade de linhas internas:",
                linhas.length
            );

            console.log(
                "PRIMEIRA LINHA INTERNA:",
                linhas[0]
            );

            console.log(
                "SEGUNDA LINHA INTERNA:",
                linhas[1]
            );

            dadosInterno =
                transformarInterno(linhas);

            window.dadosInterno =
                dadosInterno;

            console.log(
                "Interno:",
                dadosInterno
            );

            console.log(
                "Quantidade Interno:",
                dadosInterno.length
            );

            verificarArquivos();

        }
    );

}


// ==========================================
// TRANSFORMAR PREMMIA
// ==========================================
//
// Portal:
//
// 0 CPF
// 1 Nome
// 2 Produto
// 3 Valor
// 4 Data/Hora da transação
// 5 Código Transação
// 6 Forma de Pagamento
// 7 Status
//
// ==========================================

function transformarPremmia(linhas) {

    const registros = [];

    linhas.forEach(
        function (linha, index) {

            if (!Array.isArray(linha)) {
                return;
            }

            if (index === 0) {
                return;
            }

            if (linha.length < 7) {
                return;
            }

            const registro = {

                origem: "PREMMIA",

                cpf:
                    limparTexto(
                        linha[0]
                    ),

                cliente:
                    limparTexto(
                        linha[1]
                    ),

                operacao:
                    limparTexto(
                        linha[2]
                    ),

                valor:
                    converterValor(
                        linha[3]
                    ),

                dataHora:
                    linha[4],

                data:
                    extrairData(
                        linha[4]
                    ),

                hora:
                    extrairHora(
                        linha[4]
                    ),

                autorizacao:
                    normalizarAutorizacao(
                        linha[5]
                    ),

                pagamento:
                    limparTexto(
                        linha[6]
                    ),

                status:
                    limparTexto(
                        linha[7]
                    )

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
// TRANSFORMAR INTERNO
// ==========================================
//
// Sistema:
//
// Administradora
// Valor
// Horário
// Movimento
// Data Fiscal
// Bom Para
// Valor Líquido
// Cliente
// Filial
// Funcionário
// Tipo Inclusão
// C. de Custo
// Autorização
//
// ==========================================

function transformarInterno(linhas) {

    const registros = [];

    if (!linhas || !linhas.length) {
        return registros;
    }


    // ======================================
    // LOCALIZA O CABEÇALHO
    // ======================================

    let indiceCabecalho = -1;

    for (
        let i = 0;
        i < Math.min(linhas.length, 10);
        i++
    ) {

        const linha =
            Array.isArray(linhas[i])
                ? linhas[i]
                : [];

        const texto =
            linha
                .map(
                    valor =>
                        limparTexto(valor).toUpperCase()
                )
                .join(" | ");

        console.log(
            "Cabeçalho interno linha",
            i,
            ":",
            texto
        );


        if (
            texto.includes("ADMINISTRADORA") &&
            texto.includes("VALOR")
        ) {

            indiceCabecalho = i;

            break;

        }

    }


    // ======================================
    // SE NÃO ENCONTRAR CABEÇALHO,
    // USA PRIMEIRA LINHA
    // ======================================

    if (indiceCabecalho === -1) {

        indiceCabecalho = 0;

    }


    console.log(
        "Cabeçalho interno encontrado na linha:",
        indiceCabecalho
    );


    // ======================================
    // IDENTIFICA AS COLUNAS PELO NOME
    // ======================================

    const cabecalho =
        linhas[indiceCabecalho] || [];


    const mapa =
        {};

    cabecalho.forEach(
        function (valor, index) {

            const nome =
                limparTexto(valor)
                    .toUpperCase();

            if (nome) {

                mapa[nome] = index;

            }

        }
    );


    console.log(
        "Mapa de colunas interno:",
        mapa
    );


    // ======================================
    // FUNÇÃO PARA LOCALIZAR COLUNA
    // ======================================

    function acharColuna(...nomes) {

        for (const nome of nomes) {

            const chave =
                Object.keys(mapa)
                    .find(
                        coluna =>
                            coluna === nome ||
                            coluna.includes(nome)
                    );

            if (
                chave !== undefined
            ) {

                return mapa[chave];

            }

        }

        return -1;

    }


    const colunaAdministradora =
        acharColuna(
            "ADMINISTRADORA"
        );


    const colunaValor =
        acharColuna(
            "VALOR"
        );


    const colunaHorario =
        acharColuna(
            "HORÁRIO",
            "HORARIO"
        );


    const colunaMovimento =
        acharColuna(
            "MOVIMENTO"
        );


    const colunaData =
        acharColuna(
            "DATA FISCAL"
        );


    const colunaBomPara =
        acharColuna(
            "BOM PARA"
        );


    const colunaValorLiquido =
        acharColuna(
            "VALOR LÍQUIDO",
            "VALOR LIQUIDO"
        );


    const colunaCliente =
        acharColuna(
            "CLIENTE"
        );


    const colunaFilial =
        acharColuna(
            "FILIAL"
        );


    const colunaFuncionario =
        acharColuna(
            "FUNCIONÁRIO",
            "FUNCIONARIO"
        );


    const colunaTipo =
        acharColuna(
            "TIPO INCLUSÃO",
            "TIPO INCLUSAO"
        );


    const colunaCentroCusto =
        acharColuna(
            "C. DE CUSTO",
            "C DE CUSTO"
        );


    const colunaAutorizacao =
        acharColuna(
            "AUTORIZAÇÃO",
            "AUTORIZACAO"
        );


    console.log(
        "COLUNAS ENCONTRADAS:",
        {
            colunaAdministradora,
            colunaValor,
            colunaHorario,
            colunaMovimento,
            colunaData,
            colunaBomPara,
            colunaValorLiquido,
            colunaCliente,
            colunaFilial,
            colunaFuncionario,
            colunaTipo,
            colunaCentroCusto,
            colunaAutorizacao
        }
    );


    // ======================================
    // LÊ OS REGISTROS
    // ======================================

    for (
        let i = indiceCabecalho + 1;
        i < linhas.length;
        i++
    ) {

        const linha =
            linhas[i];

        if (!Array.isArray(linha)) {
            continue;
        }


        const vazia =
            linha.every(
                valor =>
                    valor === "" ||
                    valor === null ||
                    valor === undefined
            );


        if (vazia) {
            continue;
        }


        const valorBruto =
            colunaValor >= 0
                ? linha[colunaValor]
                : null;


        const valor =
            converterValor(
                valorBruto
            );


        // ==================================
        // IGNORA LINHAS SEM VALOR
        // ==================================

        if (valor === null) {
            continue;
        }


        const registro = {

            origem:
                "INTERNO",

            administradora:
                limparTexto(
                    colunaAdministradora >= 0
                        ? linha[colunaAdministradora]
                        : ""
                ),

            valor:

                valor,

            hora:
                limparTexto(
                    colunaHorario >= 0
                        ? linha[colunaHorario]
                        : ""
                ),

            movimento:
                limparTexto(
                    colunaMovimento >= 0
                        ? linha[colunaMovimento]
                        : ""
                ),

            data:
                limparTexto(
                    colunaData >= 0
                        ? linha[colunaData]
                        : ""
                ),

            bomPara:
                limparTexto(
                    colunaBomPara >= 0
                        ? linha[colunaBomPara]
                        : ""
                ),

            valorLiquido:
                converterValor(
                    colunaValorLiquido >= 0
                        ? linha[colunaValorLiquido]
                        : null
                ),

            cliente:
                limparTexto(
                    colunaCliente >= 0
                        ? linha[colunaCliente]
                        : ""
                ),

            filial:
                limparTexto(
                    colunaFilial >= 0
                        ? linha[colunaFilial]
                        : ""
                ),

            operador:
                limparTexto(
                    colunaFuncionario >= 0
                        ? linha[colunaFuncionario]
                        : ""
                ),

            tipo:
                limparTexto(
                    colunaTipo >= 0
                        ? linha[colunaTipo]
                        : ""
                ),

            centroCusto:
                limparTexto(
                    colunaCentroCusto >= 0
                        ? linha[colunaCentroCusto]
                        : ""
                ),

            autorizacao:
                normalizarAutorizacao(
                    colunaAutorizacao >= 0
                        ? linha[colunaAutorizacao]
                        : ""
                )

        };


        registros.push(
            registro
        );


        console.log(
            "Linha interna interpretada:",
            registro
        );

    }


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


    // ======================================
    // REMOVE .0 DO EXCEL
    // ======================================

    texto =
        texto.replace(
            /\.0$/,
            ""
        );


    // ======================================
    // REMOVE ESPAÇOS
    // ======================================

    texto =
        texto.replace(
            /\s/g,
            ""
        );


    // ======================================
    // REMOVE CARACTERES ESPECIAIS
    // ======================================

    texto =
        texto.replace(
            /[^\w]/g,
            ""
        );


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


    // ======================================
    // NÚMERO DO EXCEL
    // ======================================

    if (
        typeof valor === "number"
    ) {

        return Number(
            valor.toFixed(2)
        );

    }


    // ======================================
    // DATA NÃO É VALOR
    // ======================================

    if (
        valor instanceof Date
    ) {

        return null;

    }


    let texto =
        String(valor)
            .trim();


    if (!texto) {
        return null;
    }


    // ======================================
    // REMOVE R$
    // ======================================

    texto =
        texto.replace(
            /R\$/gi,
            ""
        )
        .trim();


    // ======================================
    // BRASILEIRO
    //
    // 2,50
    // 1.250,50
    // ======================================

    if (
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

    }

    else {

        texto =
            texto.replace(
                /[^\d.-]/g,
                ""
            );

    }


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


    if (
        valor instanceof Date
    ) {

        return valor.toLocaleString(
            "pt-BR"
        );

    }


    return String(valor)
        .trim();

}


// ==========================================
// DATA
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
// HORA
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
            /\d{1,2}:\d{2}/
        );


    if (resultado) {

        return resultado[0];

    }


    return "";

}


// ==========================================
// VERIFICAR ARQUIVOS
// ==========================================

function verificarArquivos() {

    console.log(
        "=================================="
    );

    console.log(
        "VERIFICANDO PLANILHAS"
    );

    console.log(
        "Premmia:",
        dadosPremmia.length
    );

    console.log(
        "Interno:",
        dadosInterno.length
    );


    if (
        dadosPremmia.length > 0 &&
        dadosInterno.length > 0
    ) {

        if (btnConferir) {

            btnConferir.disabled =
                false;

            btnConferir.removeAttribute(
                "disabled"
            );

        }


        atualizarStatus(
            "Planilhas carregadas. Pronto para conferir."
        );


        console.log(
            "✅ BOTÃO CONFERIR HABILITADO"
        );

    }

    else {

        if (btnConferir) {

            btnConferir.disabled =
                true;

            btnConferir.setAttribute(
                "disabled",
                "disabled"
            );

        }


        atualizarStatus(
            "Aguardando carregamento das planilhas."
        );


        console.log(
            "⏳ Aguardando planilhas"
        );

    }


    atualizarContador();

}


// ==========================================
// CONTADOR
// ==========================================

function atualizarContador() {

    const contador =
        document.getElementById(
            "contadorDados"
        );


    if (!contador) {
        return;
    }


    contador.innerHTML =

        "Premmia: <strong>" +
        dadosPremmia.length +
        "</strong> registros" +

        " &nbsp; | &nbsp; " +

        "Interno: <strong>" +
        dadosInterno.length +
        "</strong> registros";

}


// ==========================================
// STATUS
// ==========================================

function atualizarStatus(texto) {

    const status =
        document.getElementById(
            "statusSistema"
        );


    if (status) {

        status.textContent =
            texto;

    }

}


// ==========================================
// DISPONIBILIZAR GLOBAL
// ==========================================

window.dadosPremmia =
    dadosPremmia;

window.dadosInterno =
    dadosInterno;


console.log(
    "leituraExcel.js completo carregado"
);
```
