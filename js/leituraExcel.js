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
                nomePremmia.textContent =
                    file.name;
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
                nomeInterno.textContent =
                    file.name;
            }

            lerInterno(file);

        }
    );

}


// ==========================================
// ABRIR EXCEL
// ==========================================

function abrirExcel(file, callback) {

    const reader =
        new FileReader();


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


            console.log(
                "Planilha aberta:",
                file.name
            );

            console.log(
                "Total de linhas:",
                linhas.length
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
                transformarPremmia(
                    linhas
                );


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


            dadosInterno =
                transformarInterno(
                    linhas
                );


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
// NORMALIZA TEXTO DE CABEÇALHO
// ==========================================

function normalizarCabecalho(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)

        .trim()

        .toUpperCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[^A-Z0-9]/g,
            "");

}


// ==========================================
// ENCONTRA LINHA DO CABEÇALHO
// ==========================================

function encontrarCabecalho(
    linhas,
    camposObrigatorios
) {

    const limite =
        Math.min(
            linhas.length,
            30
        );


    for (
        let i = 0;
        i < limite;
        i++
    ) {

        const linha =
            linhas[i];


        if (
            !Array.isArray(linha)
        ) {

            continue;

        }


        const cabecalhos =
            linha.map(
                normalizarCabecalho
            );


        const encontrouTodos =
            camposObrigatorios.every(
                campo => {

                    const campoNormalizado =
                        normalizarCabecalho(
                            campo
                        );

                    return cabecalhos.includes(
                        campoNormalizado
                    );

                }
            );


        if (encontrouTodos) {

            console.log(
                "Cabeçalho encontrado na linha:",
                i
            );


            console.log(
                "Cabeçalho:",
                linha
            );


            return i;

        }

    }


    return -1;

}


// ==========================================
// CRIA MAPA DAS COLUNAS
// ==========================================

function criarMapaColunas(
    linhaCabecalho
) {

    const mapa = {};


    if (
        !Array.isArray(
            linhaCabecalho
        )
    ) {

        return mapa;

    }


    linhaCabecalho.forEach(
        (
            valor,
            index
        ) => {

            const nome =
                normalizarCabecalho(
                    valor
                );


            if (!nome) {

                return;

            }


            mapa[nome] =
                index;

        }
    );


    return mapa;

}


// ==========================================
// PEGA VALOR DA COLUNA
// ==========================================

function pegarColuna(
    linha,
    mapa,
    nomes
) {

    for (
        const nome of nomes
    ) {

        const chave =
            normalizarCabecalho(
                nome
            );


        if (
            Object.prototype.hasOwnProperty.call(
                mapa,
                chave
            )
        ) {

            return linha[
                mapa[chave]
            ];

        }

    }


    return "";

}


// ==========================================
// TRANSFORMAR PREMMIA
// ==========================================

function transformarPremmia(
    linhas
) {

    const registros = [];


    // ======================================
    // PROCURA CABEÇALHO PREMMIA
    // ======================================

    const indiceCabecalho =
        encontrarCabecalho(
            linhas,
            [
                "CPF",
                "Nome",
                "Produto",
                "Código Transação"
            ]
        );


    if (
        indiceCabecalho === -1
    ) {

        console.error(
            "Cabeçalho do Portal Premmia não encontrado."
        );


        alert(
            "Não foi possível identificar o cabeçalho da planilha Premmia."
        );


        return registros;

    }


    const mapa =
        criarMapaColunas(
            linhas[
                indiceCabecalho
            ]
        );


    console.log(
        "Mapa colunas Premmia:",
        mapa
    );


    // ======================================
    // PROCESSA LINHAS
    // ======================================

    for (
        let index =
            indiceCabecalho + 1;

        index < linhas.length;

        index++
    ) {

        const linha =
            linhas[index];


        if (
            !Array.isArray(linha)
        ) {

            continue;

        }


        // ignora linha totalmente vazia

        if (
            linha.every(
                valor =>
                    valor === "" ||
                    valor === null ||
                    valor === undefined
            )
        ) {

            continue;

        }


        const cpf =
            pegarColuna(
                linha,
                mapa,
                ["CPF"]
            );


        const cliente =
            pegarColuna(
                linha,
                mapa,
                ["Nome"]
            );


        const operacao =
            pegarColuna(
                linha,
                mapa,
                [
                    "Produto",
                    "Operação"
                ]
            );


        const valorBruto =
            pegarColuna(
                linha,
                mapa,
                [
                    "Valor líquido",
                    "Valor",
                    "Valor Líquido"
                ]
            );


        const dataHora =
            pegarColuna(
                linha,
                mapa,
                [
                    "Data/Hora da transação",
                    "Data Hora da transação",
                    "Data/Hora"
                ]
            );


        const autorizacaoBruta =
            pegarColuna(
                linha,
                mapa,
                [
                    "Código Transação",
                    "Codigo Transacao",
                    "Autorização",
                    "Autorizacao"
                ]
            );


        const pagamento =
            pegarColuna(
                linha,
                mapa,
                [
                    "Forma de Pagamento",
                    "Forma Pagamento"
                ]
            );


        const status =
            pegarColuna(
                linha,
                mapa,
                ["Status"]
            );


        const registro = {

            origem:
                "PREMMIA",


            cpf:
                limparTexto(
                    cpf
                ),


            cliente:
                limparTexto(
                    cliente
                ),


            operacao:
                limparTexto(
                    operacao
                ),


            valor:
                converterValor(
                    valorBruto
                ),


            dataHora:
                dataHora,


            data:
                extrairData(
                    dataHora
                ),


            hora:
                extrairHora(
                    dataHora
                ),


            autorizacao:
                normalizarAutorizacao(
                    autorizacaoBruta
                ),


            pagamento:
                limparTexto(
                    pagamento
                ),


            status:
                limparTexto(
                    status
                )

        };


        // ==================================
        // REGISTRO PREMMIA
        // ==================================

        if (
            registro.valor !== null
        ) {

            registros.push(
                registro
            );

        }

    }


    console.log(
        "PREMMIA TRANSFORMADO:",
        registros
    );


    return registros;

}


// ==========================================
// TRANSFORMAR INTERNO
// ==========================================

function transformarInterno(
    linhas
) {

    const registros = [];


    // ======================================
    // PROCURA CABEÇALHO
    // ======================================

    const indiceCabecalho =
        encontrarCabecalho(
            linhas,
            [
                "Administradora",
                "Valor",
                "Horário",
                "Movimento",
                "Autorização"
            ]
        );


    if (
        indiceCabecalho === -1
    ) {

        console.error(
            "Cabeçalho do sistema interno não encontrado."
        );


        console.log(
            "Primeiras linhas:",
            linhas.slice(
                0,
                10
            )
        );


        alert(
            "Não foi possível identificar o cabeçalho da planilha interna."
        );


        return registros;

    }


    const mapa =
        criarMapaColunas(
            linhas[
                indiceCabecalho
            ]
        );


    console.log(
        "Mapa colunas Interno:",
        mapa
    );


    console.log(
        "Cabeçalho interno identificado:",
        linhas[
            indiceCabecalho
        ]
    );


    // ======================================
    // PROCESSA LINHAS
    // ======================================

    for (
        let index =
            indiceCabecalho + 1;

        index < linhas.length;

        index++
    ) {

        const linha =
            linhas[index];


        if (
            !Array.isArray(linha)
        ) {

            continue;

        }


        // ==================================
        // IGNORA LINHA VAZIA
        // ==================================

        if (
            linha.every(
                valor =>
                    valor === "" ||
                    valor === null ||
                    valor === undefined
            )
        ) {

            continue;

        }


        // ==================================
        // PEGA CAMPOS PELO NOME
        // ==================================

        const administradora =
            pegarColuna(
                linha,
                mapa,
                [
                    "Administradora"
                ]
            );


        const valorBruto =
            pegarColuna(
                linha,
                mapa,
                [
                    "Valor"
                ]
            );


        const horaBruta =
            pegarColuna(
                linha,
                mapa,
                [
                    "Horário",
                    "Horario"
                ]
            );


        const movimento =
            pegarColuna(
                linha,
                mapa,
                [
                    "Movimento"
                ]
            );


        const dataFiscal =
            pegarColuna(
                linha,
                mapa,
                [
                    "Data Fiscal",
                    "DataFiscal"
                ]
            );


        const bomPara =
            pegarColuna(
                linha,
                mapa,
                [
                    "Bom Para"
                ]
            );


        const valorLiquidoBruto =
            pegarColuna(
                linha,
                mapa,
                [
                    "Valor Líquido",
                    "Valor Liquido"
                ]
            );


        const cliente =
            pegarColuna(
                linha,
                mapa,
                [
                    "Cliente"
                ]
            );


        const filial =
            pegarColuna(
                linha,
                mapa,
                [
                    "Filial"
                ]
            );


        const operador =
            pegarColuna(
                linha,
                mapa,
                [
                    "Funcionário",
                    "Funcionario",
                    "Operador"
                ]
            );


        const tipo =
            pegarColuna(
                linha,
                mapa,
                [
                    "Tipo Inclusão",
                    "Tipo Inclusao"
                ]
            );


        const centroCusto =
            pegarColuna(
                linha,
                mapa,
                [
                    "C. de Custo",
                    "C de Custo",
                    "Centro de Custo"
                ]
            );


        const autorizacaoBruta =
            pegarColuna(
                linha,
                mapa,
                [
                    "Autorização",
                    "Autorizacao"
                ]
            );


        // ==================================
        // MONTA REGISTRO
        // ==================================

        const registro = {

            origem:
                "INTERNO",


            administradora:
                limparTexto(
                    administradora
                ),


            valor:
                converterValor(
                    valorBruto
                ),


            hora:
                extrairHoraInterno(
                    horaBruta
                ),


            movimento:
                limparTexto(
                    movimento
                ),


            data:
                extrairData(
                    dataFiscal
                ),


            bomPara:
                limparTexto(
                    bomPara
                ),


            valorLiquido:
                converterValor(
                    valorLiquidoBruto
                ),


            cliente:
                limparTexto(
                    cliente
                ),


            filial:
                limparTexto(
                    filial
                ),


            operador:
                limparTexto(
                    operador
                ),


            tipo:
                limparTexto(
                    tipo
                ),


            centroCusto:
                limparTexto(
                    centroCusto
                ),


            autorizacao:
                normalizarAutorizacao(
                    autorizacaoBruta
                )

        };


        console.log(
            "Linha interna interpretada:",
            registro
        );


        // ==================================
        // ACEITA REGISTRO
        // ==================================
        //
        // NÃO exigimos autorização.
        //
        // Isso é importante porque:
        //
        // PREMMIA VALE
        // PREMMIA DESCONTO
        //
        // podem precisar ser conferidos
        // pelo valor.
        // ==================================

        if (
            registro.valor !== null
        ) {

            registros.push(
                registro
            );

        }

    }


    console.log(
        "INTERNO TRANSFORMADO:",
        registros
    );


    return registros;

}


// ==========================================
// NORMALIZAR AUTORIZAÇÃO
// ==========================================

function normalizarAutorizacao(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)

        .trim()

        .toUpperCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        // remove espaços

        .replace(
            /\s/g,
            ""
        )

        // remove .0 somente no final

        .replace(
            /\.0$/,
            ""
        )

        // mantém somente letras e números

        .replace(
            /[^A-Z0-9]/g,
            "");

}


// ==========================================
// CONVERTER VALOR
// ==========================================

function converterValor(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;

    }


    // ======================================
    // NÚMERO EXCEL
    // ======================================

    if (
        typeof valor === "number"
    ) {

        if (
            !Number.isFinite(valor)
        ) {

            return null;

        }


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
        );


    texto =
        texto.trim();


    // ======================================
    // REMOVE ESPAÇOS
    // ======================================

    texto =
        texto.replace(
            /\s/g,
            ""
        );


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
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                );

    }


    // ======================================
    // FORMATO INTERNACIONAL
    //
    // 2.50
    // 1250.50
    // ======================================

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
        !Number.isFinite(numero)
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

function limparTexto(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)
        .trim();

}


// ==========================================
// EXTRAIR DATA
// ==========================================

function extrairData(
    valor
) {

    if (
        !valor
    ) {

        return "";

    }


    if (
        valor instanceof Date
    ) {

        return valor.toLocaleDateString(
            "pt-BR"
        );

    }


    return String(valor)
        .trim();

}


// ==========================================
// EXTRAIR HORA PREMMIA
// ==========================================

function extrairHora(
    valor
) {

    if (
        !valor
    ) {

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
            /\d{1,2}:\d{2}(?::\d{2})?/
        );


    if (
        resultado
    ) {

        return resultado[0];

    }


    return "";

}


// ==========================================
// EXTRAIR HORA INTERNO
// ==========================================

function extrairHoraInterno(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "";

    }


    // Excel pode entregar horário
    // como número decimal.
    //
    // Exemplo:
    // 0.5 = 12:00
    // ======================================

    if (
        typeof valor === "number"
    ) {

        if (
            valor >= 0 &&
            valor < 1
        ) {

            const totalMinutos =
                Math.round(
                    valor * 24 * 60
                );


            const horas =
                Math.floor(
                    totalMinutos / 60
                );


            const minutos =
                totalMinutos % 60;


            return (
                String(horas)
                    .padStart(2, "0")
                +
                ":" +
                String(minutos)
                    .padStart(2, "0")
            );

        }


        return String(valor);

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
        String(valor)
            .trim();


    const resultado =
        texto.match(
            /\d{1,2}:\d{2}(?::\d{2})?/
        );


    if (
        resultado
    ) {

        return resultado[0];

    }


    return texto;

}


// ==========================================
// VERIFICAR ARQUIVOS
// ==========================================

function verificarArquivos() {

    console.log(
        "Verificando:",
        dadosPremmia.length,
        dadosInterno.length
    );


    if (
        dadosPremmia.length > 0 &&
        dadosInterno.length > 0
    ) {

        if (
            btnConferir
        ) {

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
            "BOTÃO CONFERIR HABILITADO"
        );

    }

    else {

        if (
            btnConferir
        ) {

            btnConferir.disabled =
                true;

        }


        atualizarStatus(
            "Aguardando carregamento das planilhas."
        );


        console.log(
            "Aguardando planilhas"
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


    if (
        !contador
    ) {

        return;

    }


    contador.innerHTML = `

        Premmia:
        <strong>
            ${dadosPremmia.length}
        </strong>
        registros

        &nbsp; | &nbsp;

        Interno:
        <strong>
            ${dadosInterno.length}
        </strong>
        registros

    `;

}


// ==========================================
// STATUS
// ==========================================

function atualizarStatus(
    texto
) {

    const status =
        document.getElementById(
            "statusSistema"
        );


    if (
        status
    ) {

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


// ==========================================
// FINAL
// ==========================================

console.log(
    "leituraExcel.js completo carregado"
);
```
