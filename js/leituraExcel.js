// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
//
// RESPONSABILIDADE:
//
// 1. Ler Premmia
// 2. Ler Sistema Interno
// 3. Normalizar valores
// 4. Normalizar data
// 5. Normalizar hora
// 6. Preparar os registros para o
//    conferencia.js
//
// A CONFERÊNCIA É FEITA PELO
// conferencia.js:
//
// VALOR
// +
// MESMA DATA
// +
// HORÁRIO APROXIMADO
// ==========================================


let dadosPremmia = [];
let dadosInterno = [];


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
// ARQUIVO PREMMIA
// ==========================================

if (arquivoPremmia) {

    arquivoPremmia.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

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

            const file =
                this.files[0];

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
// ABRIR EXCEL / CSV
// ==========================================

function abrirExcel(
    file,
    callback
) {

    const reader =
        new FileReader();


    reader.onload =
        function (e) {

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

                            // IMPORTANTE
                            // Faz o XLSX tentar
                            // converter datas para Date.
                            cellDates: true,

                            // Mantém fórmulas como valores
                            cellFormula: false,

                            // Trata células vazias
                            cellNF: false,

                            cellText: true
                        }
                    );


                if (
                    !workbook.SheetNames ||
                    workbook.SheetNames.length === 0
                ) {

                    console.error(
                        "Nenhuma planilha encontrada."
                    );

                    callback([]);

                    return;

                }


                const primeira =
                    workbook.SheetNames[0];


                const planilha =
                    workbook.Sheets[
                        primeira
                    ];


                if (!planilha) {

                    console.error(
                        "Planilha não encontrada."
                    );

                    callback([]);

                    return;

                }


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
                    "Planilha carregada:",
                    primeira
                );


                console.log(
                    "Total de linhas:",
                    linhas.length
                );


                callback(linhas);

            }
            catch (erro) {

                console.error(
                    "Erro ao ler planilha:",
                    erro
                );


                alert(
                    "Não foi possível ler a planilha.\n\n" +
                    erro.message
                );


                callback([]);

            }

        };


    reader.onerror =
        function () {

            console.error(
                "Erro ao abrir arquivo."
            );


            alert(
                "Erro ao abrir o arquivo."
            );


            callback([]);

        };


    reader.readAsArrayBuffer(file);

}


// ==========================================
// LER PREMMIA
// ==========================================

function lerPremmia(file) {

    atualizarStatus(
        "Lendo planilha do Premmia..."
    );


    abrirExcel(
        file,
        function (linhas) {

            dadosPremmia =
                transformarPremmia(
                    linhas
                );


            window.dadosPremmia =
                dadosPremmia;


            console.log(
                "================================="
            );


            console.log(
                "PREMMIA CARREGADO"
            );


            console.log(
                "Registros:",
                dadosPremmia.length
            );


            console.log(
                "Primeiros registros:",
                dadosPremmia.slice(
                    0,
                    5
                )
            );


            console.log(
                "================================="
            );


            verificarArquivos();

        }
    );

}


// ==========================================
// LER INTERNO
// ==========================================

function lerInterno(file) {

    atualizarStatus(
        "Lendo planilha do sistema interno..."
    );


    abrirExcel(
        file,
        function (linhas) {

            dadosInterno =
                transformarInterno(
                    linhas
                );


            window.dadosInterno =
                dadosInterno;


            console.log(
                "================================="
            );


            console.log(
                "INTERNO CARREGADO"
            );


            console.log(
                "Registros:",
                dadosInterno.length
            );


            console.log(
                "Primeiros registros:",
                dadosInterno.slice(
                    0,
                    5
                )
            );


            console.log(
                "================================="
            );


            verificarArquivos();

        }
    );

}


// ==========================================
// VERIFICAR ARQUIVOS
// ==========================================

function verificarArquivos() {

    atualizarTela();

}


// ==========================================
// TRANSFORMAR PREMMIA
// ==========================================

function transformarPremmia(
    linhas
) {

    const registros = [];


    if (
        !Array.isArray(linhas)
    ) {

        return registros;

    }


    linhas.forEach(
        (linha, index) => {

            // --------------------------------
            // PULAR CABEÇALHO
            // --------------------------------

            if (
                index === 0
            ) {

                return;

            }


            if (
                !Array.isArray(linha)
            ) {

                return;

            }


            if (
                linha.length < 8
            ) {

                return;

            }


            // --------------------------------
            // CAMPOS ORIGINAIS
            // --------------------------------

            const valorBruto =
                linha[3];


            const dataHoraBruta =
                linha[4];


            const autorizacaoBruta =
                linha[5];


            // --------------------------------
            // CONVERTER DATA/HORA
            // --------------------------------

            const dataHora =
                normalizarDataHoraPremmia(
                    dataHoraBruta
                );


            // --------------------------------
            // REGISTRO
            // --------------------------------

            const registro = {

                origem:
                    "PREMMIA",


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
                        valorBruto
                    ),


                // --------------------------------
                // DATA/HORA ORIGINAL
                // --------------------------------

                dataHora:
                    dataHora.dataHoraTexto,


                // --------------------------------
                // DATA NORMALIZADA
                // --------------------------------

                data:
                    dataHora.data,


                // --------------------------------
                // HORA NORMALIZADA
                // --------------------------------

                hora:
                    dataHora.hora,


                // --------------------------------
                // AUTORIZAÇÃO
                // --------------------------------

                autorizacao:
                    normalizarAutorizacao(
                        autorizacaoBruta
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


            // --------------------------------
            // VALIDAR
            // --------------------------------

            if (
                registro.autorizacao &&
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

function transformarInterno(
    linhas
) {

    const registros = [];


    if (
        !Array.isArray(linhas)
    ) {

        return registros;

    }


    let indiceCabecalho =
        -1;


    let cabecalho =
        null;


    // ======================================
    // LOCALIZAR CABEÇALHO
    // ======================================

    for (
        let i = 0;
        i < linhas.length;
        i++
    ) {

        const linha =
            linhas[i];


        if (
            !Array.isArray(linha)
        ) {

            continue;

        }


        const texto =
            linha
                .map(
                    x =>
                        normalizarNomeColuna(
                            x
                        )
                )
                .join(" ");


        // ----------------------------------
        // Procura pelo cabeçalho do
        // sistema interno.
        // ----------------------------------

        if (

            (
                texto.includes(
                    "administradora"
                ) ||
                texto.includes(
                    "administrador"
                )
            )

            &&

            texto.includes(
                "autorizacao"
            )

        ) {

            cabecalho =
                linha;


            indiceCabecalho =
                i;


            break;

        }

    }


    // ======================================
    // CABEÇALHO NÃO ENCONTRADO
    // ======================================

    if (
        !cabecalho
    ) {

        console.error(
            "================================="
        );


        console.error(
            "Cabeçalho interno não encontrado."
        );


        console.error(
            "Linhas analisadas:",
            linhas.slice(
                0,
                10
            )
        );


        console.error(
            "================================="
        );


        return [];

    }


    // ======================================
    // MAPEAR COLUNAS
    // ======================================

    const coluna = {};


    cabecalho.forEach(
        (
            nome,
            index
        ) => {

            const chave =
                normalizarNomeColuna(
                    nome
                );


            if (
                chave
            ) {

                coluna[chave] =
                    index;

            }

        }
    );


    console.log(
        "COLUNAS INTERNAS:",
        coluna
    );


    // ======================================
    // FUNÇÃO PARA LOCALIZAR COLUNA
    // ======================================

    function encontrarColuna(
        alternativas
    ) {

        for (
            const alternativa of alternativas
        ) {

            const chave =
                normalizarNomeColuna(
                    alternativa
                );


            if (
                coluna[
                    chave
                ] !== undefined
            ) {

                return coluna[
                    chave
                ];

            }

        }


        return undefined;

    }


    // ======================================
    // LOCALIZAR COLUNAS
    // ======================================

    const colunaValor =
        encontrarColuna(
            [
                "valor"
            ]
        );


    const colunaHorario =
        encontrarColuna(
            [
                "horario",
                "hora",
                "hora lancamento",
                "horario lancamento"
            ]
        );


    const colunaData =
        encontrarColuna(
            [
                "data fiscal",
                "data",
                "data venda",
                "data lancamento"
            ]
        );


    const colunaCliente =
        encontrarColuna(
            [
                "cliente"
            ]
        );


    const colunaFilial =
        encontrarColuna(
            [
                "filial"
            ]
        );


    const colunaFuncionario =
        encontrarColuna(
            [
                "funcionario",
                "funcionario responsavel"
            ]
        );


    const colunaTipo =
        encontrarColuna(
            [
                "tipo inclusao",
                "tipo inclusão",
                "tipo"
            ]
        );


    const colunaAutorizacao =
        encontrarColuna(
            [
                "autorizacao",
                "autorização",
                "codigo autorizacao",
                "codigo autorização"
            ]
        );


    console.log(
        "ÍNDICES DAS COLUNAS:"
    );


    console.log(
        {
            valor:
                colunaValor,

            horario:
                colunaHorario,

            data:
                colunaData,

            cliente:
                colunaCliente,

            filial:
                colunaFilial,

            funcionario:
                colunaFuncionario,

            tipo:
                colunaTipo,

            autorizacao:
                colunaAutorizacao
        }
    );


    // ======================================
    // VERIFICAR COLUNAS ESSENCIAIS
    // ======================================

    if (
        colunaValor === undefined
    ) {

        console.error(
            "Coluna VALOR não encontrada."
        );

    }


    if (
        colunaData === undefined
    ) {

        console.error(
            "Coluna DATA não encontrada."
        );

    }


    if (
        colunaHorario === undefined
    ) {

        console.error(
            "Coluna HORÁRIO não encontrada."
        );

    }


    if (
        colunaAutorizacao === undefined
    ) {

        console.error(
            "Coluna AUTORIZAÇÃO não encontrada."
        );

    }


    // ======================================
    // LER LINHAS
    // ======================================

    for (
        let i = indiceCabecalho + 1;
        i < linhas.length;
        i++
    ) {

        const linha =
            linhas[i];


        if (
            !Array.isArray(linha)
        ) {

            continue;

        }


        // ----------------------------------
        // IGNORAR LINHA TOTALMENTE VAZIA
        // ----------------------------------

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
        // VALOR
        // ==================================

        const valor =
            converterValor(
                obterValorColuna(
                    linha,
                    colunaValor
                )
            );


        // ==================================
        // DATA
        // ==================================

        const dataBruta =
            obterValorColuna(
                linha,
                colunaData
            );


        // ==================================
        // HORA
        // ==================================

        const horaBruta =
            obterValorColuna(
                linha,
                colunaHorario
            );


        // ==================================
        // NORMALIZAR DATA + HORA
        // ==================================

        const dataHora =
            normalizarDataHoraInterno(
                dataBruta,
                horaBruta
            );


        // ==================================
        // AUTORIZAÇÃO
        // ==================================

        const autorizacao =
            normalizarAutorizacao(
                obterValorColuna(
                    linha,
                    colunaAutorizacao
                )
            );


        // ==================================
        // REGISTRO
        // ==================================

        const registro = {

            origem:
                "INTERNO",


            valor:
                valor,


            // --------------------------------
            // DATA/HORA
            // --------------------------------

            dataHora:
                dataHora.dataHoraTexto,


            data:
                dataHora.data,


            hora:
                dataHora.hora,


            // --------------------------------
            // CLIENTE
            // --------------------------------

            cliente:
                limparTexto(
                    obterValorColuna(
                        linha,
                        colunaCliente
                    )
                ),


            // --------------------------------
            // FILIAL
            // --------------------------------

            filial:
                limparTexto(
                    obterValorColuna(
                        linha,
                        colunaFilial
                    )
                ),


            // --------------------------------
            // FUNCIONÁRIO
            // --------------------------------

            operador:
                limparTexto(
                    obterValorColuna(
                        linha,
                        colunaFuncionario
                    )
                ),


            // --------------------------------
            // TIPO
            // --------------------------------

            tipo:
                limparTexto(
                    obterValorColuna(
                        linha,
                        colunaTipo
                    )
                ),


            // --------------------------------
            // AUTORIZAÇÃO
            // --------------------------------

            autorizacao:
                autorizacao

        };


        // ==================================
        // VALIDAR REGISTRO
        // ==================================

        if (
            registro.autorizacao &&
            registro.valor !== null
        ) {

            registros.push(
                registro
            );

        }

    }


    console.log(
        "================================="
    );


    console.log(
        "TRANSFORMAÇÃO INTERNO FINALIZADA"
    );


    console.log(
        "Registros válidos:",
        registros.length
    );


    console.log(
        "Primeiros registros:",
        registros.slice(
            0,
            5
        )
    );


    console.log(
        "================================="
    );


    return registros;

}


// ==========================================
// OBTER VALOR DE UMA COLUNA
// ==========================================

function obterValorColuna(
    linha,
    indice
) {

    if (
        indice === undefined ||
        indice === null
    ) {

        return "";

    }


    return linha[indice];

}


// ==========================================
// NORMALIZAR NOME DE COLUNA
// ==========================================

function normalizarNomeColuna(
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

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        );

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


    let texto =
        String(valor)
            .trim();


    // --------------------------------------
    // Remover .0 de números vindos do Excel
    // --------------------------------------

    if (
        texto.endsWith(".0")
    ) {

        texto =
            texto.substring(
                0,
                texto.length - 2
            );

    }


    return texto

        .replace(
            /\s/g,
            ""
        )

        .toUpperCase();

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


    // --------------------------------------
    // NUMBER
    // --------------------------------------

    if (
        typeof valor === "number"
    ) {

        if (
            !isFinite(valor)
        ) {

            return null;

        }


        return Number(
            valor.toFixed(2)
        );

    }


    // --------------------------------------
    // STRING
    // --------------------------------------

    let texto =
        String(valor)
            .trim();


    if (
        !texto
    ) {

        return null;

    }


    // --------------------------------------
    // REMOVER R$
    // --------------------------------------

    texto =
        texto.replace(
            /R\$/gi,
            ""
        )
        .trim();


    // --------------------------------------
    // FORMATO BRASILEIRO
    //
    // 1.234,56
    // --------------------------------------

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


    // --------------------------------------
    // REMOVER CARACTERES EXTRAS
    // --------------------------------------

    texto =
        texto.replace(
            /[^0-9.-]/g,
            ""
        );


    const numero =
        Number(
            texto
        );


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
// TEXTO
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


    return String(
        valor
    )
        .trim();

}


// ==========================================
// NORMALIZAR DATA/HORA DO PREMMIA
// ==========================================

function normalizarDataHoraPremmia(
    valor
) {

    // --------------------------------------
    // DATE
    // --------------------------------------

    if (
        valor instanceof Date
    ) {

        return criarDataHoraNormalizada(
            valor
        );

    }


    // --------------------------------------
    // NÚMERO DO EXCEL
    // --------------------------------------

    if (
        typeof valor === "number"
    ) {

        const data =
            converterNumeroExcelParaDate(
                valor
            );


        if (
            data
        ) {

            return criarDataHoraNormalizada(
                data
            );

        }

    }


    // --------------------------------------
    // TEXTO
    // --------------------------------------

    if (
        valor !== null &&
        valor !== undefined
    ) {

        const convertido =
            converterTextoParaDate(
                String(valor)
            );


        if (
            convertido
        ) {

            return criarDataHoraNormalizada(
                convertido
            );

        }

    }


    return {

        data:
            "",

        hora:
            "",

        dataHoraTexto:
            ""

    };

}


// ==========================================
// NORMALIZAR DATA/HORA INTERNO
// ==========================================

function normalizarDataHoraInterno(
    dataValor,
    horaValor
) {

    let data = null;


    let hora = null;


    // ======================================
    // DATA
    // ======================================

    if (
        dataValor instanceof Date
    ) {

        data =
            new Date(
                dataValor.getTime()
            );

    }

    else if (
        typeof dataValor === "number"
    ) {

        data =
            converterNumeroExcelParaDate(
                dataValor
            );

    }

    else if (
        dataValor !== null &&
        dataValor !== undefined &&
        String(dataValor).trim() !== ""
    ) {

        data =
            converterTextoParaDate(
                String(dataValor)
            );

    }


    // ======================================
    // HORA
    // ======================================

    let horaData = null;


    if (
        horaValor instanceof Date
    ) {

        horaData =
            horaValor;

    }

    else if (
        typeof horaValor === "number"
    ) {

        horaData =
            converterNumeroExcelParaHora(
                horaValor
            );

    }

    else if (
        horaValor !== null &&
        horaValor !== undefined
    ) {

        horaData =
            converterTextoParaHora(
                String(horaValor)
            );

    }


    // ======================================
    // COMBINAR DATA + HORA
    // ======================================

    if (
        data
    ) {

        const resultado =
            new Date(
                data.getTime()
            );


        if (
            horaData
        ) {

            resultado.setHours(
                horaData.getHours()
            );


            resultado.setMinutes(
                horaData.getMinutes()
            );


            resultado.setSeconds(
                horaData.getSeconds()
            );


            resultado.setMilliseconds(
                0
            );

        }
        else {

            resultado.setHours(
                0
            );


            resultado.setMinutes(
                0
            );


            resultado.setSeconds(
                0
            );


            resultado.setMilliseconds(
                0
            );

        }


        return criarDataHoraNormalizada(
            resultado
        );

    }


    // ======================================
    // SE NÃO ACHOU DATA, TENTA USAR
    // A HORA COMO DATE
    // ======================================

    if (
        horaData
    ) {

        return {

            data:
                "",

            hora:
                formatarHora(
                    horaData
                ),

            dataHoraTexto:
                formatarHora(
                    horaData
                )

        };

    }


    return {

        data:
            "",

        hora:
            "",

        dataHoraTexto:
            ""

    };

}


// ==========================================
// CRIAR DATA/HORA NORMALIZADA
// ==========================================

function criarDataHoraNormalizada(
    data
) {

    if (
        !data ||
        isNaN(
            data.getTime()
        )
    ) {

        return {

            data:
                "",

            hora:
                "",

            dataHoraTexto:
                ""

        };

    }


    return {

        data:
            formatarData(
                data
            ),

        hora:
            formatarHora(
                data
            ),

        dataHoraTexto:
            `${formatarData(data)} ${formatarHora(data)}`

    };

}


// ==========================================
// FORMATAR DATA
// ==========================================

function formatarData(
    data
) {

    if (
        !data ||
        isNaN(
            data.getTime()
        )
    ) {

        return "";

    }


    const dia =
        String(
            data.getDate()
        )
        .padStart(
            2,
            "0"
        );


    const mes =
        String(
            data.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const ano =
        data.getFullYear();


    return `${dia}/${mes}/${ano}`;

}


// ==========================================
// FORMATAR HORA
// ==========================================

function formatarHora(
    data
) {

    if (
        !data ||
        isNaN(
            data.getTime()
        )
    ) {

        return "";

    }


    const hora =
        String(
            data.getHours()
        )
        .padStart(
            2,
            "0"
        );


    const minuto =
        String(
            data.getMinutes()
        )
        .padStart(
            2,
            "0"
        );


    const segundo =
        String(
            data.getSeconds()
        )
        .padStart(
            2,
            "0"
        );


    return `${hora}:${minuto}:${segundo}`;

}


// ==========================================
// CONVERTER NÚMERO DO EXCEL PARA DATE
// ==========================================
//
// Excel normalmente armazena:
// 46000 = data
// 0.5 = 12:00
//
// ==========================================

function converterNumeroExcelParaDate(
    numero
) {

    if (
        typeof numero !== "number" ||
        !isFinite(numero)
    ) {

        return null;

    }


    // Sistema de datas do Excel
    const dataBase =
        new Date(
            Date.UTC(
                1899,
                11,
                30
            )
        );


    const inteiro =
        Math.floor(
            numero
        );


    const milissegundos =
        inteiro *
        86400000;


    const data =
        new Date(
            dataBase.getTime() +
            milissegundos
        );


    // --------------------------------------
    // Ajustar para horário local
    // --------------------------------------

    const fracao =
        numero -
        inteiro;


    const totalSegundos =
        Math.round(
            fracao *
            86400
        );


    data.setHours(
        Math.floor(
            totalSegundos / 3600
        )
    );


    data.setMinutes(
        Math.floor(
            (
                totalSegundos % 3600
            ) / 60
        )
    );


    data.setSeconds(
        totalSegundos % 60
    );


    data.setMilliseconds(
        0
    );


    return data;

}


// ==========================================
// CONVERTER NÚMERO DO EXCEL PARA HORA
// ==========================================

function converterNumeroExcelParaHora(
    numero
) {

    if (
        typeof numero !== "number" ||
        !isFinite(numero)
    ) {

        return null;

    }


    // Se vier como 0.5 = 12:00
    let fracao =
        numero;


    // Se vier como número inteiro,
    // pode representar segundos.
    if (
        fracao >= 1
    ) {

        fracao =
            fracao -
            Math.floor(fracao);

    }


    const totalSegundos =
        Math.round(
            fracao *
            86400
        );


    const hora =
        Math.floor(
            totalSegundos /
            3600
        );


    const minuto =
        Math.floor(
            (
                totalSegundos %
                3600
            ) /
            60
        );


    const segundo =
        totalSegundos %
        60;


    const data =
        new Date(
            2000,
            0,
            1,
            hora,
            minuto,
            segundo,
            0
        );


    return data;

}


// ==========================================
// CONVERTER TEXTO PARA DATE
// ==========================================

function converterTextoParaDate(
    valor
) {

    if (
        !valor
    ) {

        return null;

    }


    const texto =
        String(
            valor
        )
        .trim();


    if (
        !texto
    ) {

        return null;

    }


    // ======================================
    // DD/MM/YYYY HH:MM[:SS]
    // ======================================

    let match =
        texto.match(
            /(\d{1,2})\/(\d{1,2})\/(\d{2,4}).*?(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (
        match
    ) {

        let ano =
            Number(
                match[3]
            );


        if (
            ano < 100
        ) {

            ano += 2000;

        }


        const data =
            new Date(
                ano,
                Number(match[2]) - 1,
                Number(match[1]),
                Number(match[4]),
                Number(match[5]),
                Number(match[6] || 0),
                0
            );


        if (
            !isNaN(
                data.getTime()
            )
        ) {

            return data;

        }

    }


    // ======================================
    // DD/MM/YYYY
    // ======================================

    match =
        texto.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/
        );


    if (
        match
    ) {

        let ano =
            Number(
                match[3]
            );


        if (
            ano < 100
        ) {

            ano += 2000;

        }


        const data =
            new Date(
                ano,
                Number(match[2]) - 1,
                Number(match[1]),
                0,
                0,
                0,
                0
            );


        if (
            !isNaN(
                data.getTime()
            )
        ) {

            return data;

        }

    }


    // ======================================
    // YYYY-MM-DD HH:MM
    // ======================================

    match =
        texto.match(
            /(\d{4})-(\d{1,2})-(\d{1,2}).*?(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (
        match
    ) {

        const data =
            new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3]),
                Number(match[4]),
                Number(match[5]),
                Number(match[6] || 0),
                0
            );


        if (
            !isNaN(
                data.getTime()
            )
        ) {

            return data;

        }

    }


    // ======================================
    // TENTATIVA NATIVA
    // ======================================

    const data =
        new Date(
            texto
        );


    if (
        !isNaN(
            data.getTime()
        )
    ) {

        return data;

    }


    return null;

}


// ==========================================
// CONVERTER TEXTO PARA HORA
// ==========================================

function converterTextoParaHora(
    valor
) {

    if (
        !valor
    ) {

        return null;

    }


    const texto =
        String(
            valor
        )
        .trim();


    // --------------------------------------
    // HH:MM:SS
    // --------------------------------------

    let match =
        texto.match(
            /(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (
        match
    ) {

        return new Date(
            2000,
            0,
            1,
            Number(match[1]),
            Number(match[2]),
            Number(match[3] || 0),
            0
        );

    }


    return null;

}


// ==========================================
// COMPATIBILIDADE
// ==========================================

function extrairData(
    valor
) {

    if (
        valor instanceof Date
    ) {

        return formatarData(
            valor
        );

    }


    if (
        typeof valor === "number"
    ) {

        const data =
            converterNumeroExcelParaDate(
                valor
            );


        return data
            ? formatarData(data)
            : "";

    }


    const data =
        converterTextoParaDate(
            valor
        );


    return data
        ? formatarData(data)
        : "";

}


// ==========================================
// COMPATIBILIDADE
// ==========================================

function extrairHora(
    valor
) {

    if (
        valor instanceof Date
    ) {

        return formatarHora(
            valor
        );

    }


    if (
        typeof valor === "number"
    ) {

        const hora =
            converterNumeroExcelParaHora(
                valor
            );


        return hora
            ? formatarHora(hora)
            : "";

    }


    const hora =
        converterTextoParaHora(
            valor
        );


    return hora
        ? formatarHora(hora)
        : "";

}


// ==========================================
// CONTADOR NA TELA
// ==========================================

function atualizarContador() {

    const contador =
        document.getElementById(
            "contadorDados"
        );


    if (!contador) {

        return;

    }


    contador.innerHTML = `

        Premmia:
        <strong>
            ${dadosPremmia.length}
        </strong>
        registros

        |

        Interno:
        <strong>
            ${dadosInterno.length}
        </strong>
        registros

    `;

}


// ==========================================
// STATUS NA TELA
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
// ATUALIZAR TELA
// ==========================================

function atualizarTela() {

    atualizarContador();


    // ======================================
    // DUAS PLANILHAS CARREGADAS
    // ======================================

    if (

        dadosPremmia.length > 0 &&

        dadosInterno.length > 0

    ) {

        atualizarStatus(
            "Planilhas carregadas. Pronto para conferir."
        );


        if (
            btnConferir
        ) {

            btnConferir.disabled =
                false;

        }


        return;

    }


    // ======================================
    // SOMENTE PREMMIA
    // ======================================

    if (
        dadosPremmia.length > 0
    ) {

        atualizarStatus(
            "Planilha Premmia carregada. Aguardando planilha interna."
        );

    }


    // ======================================
    // SOMENTE INTERNO
    // ======================================

    else if (
        dadosInterno.length > 0
    ) {

        atualizarStatus(
            "Planilha interna carregada. Aguardando planilha Premmia."
        );

    }


    // ======================================
    // NENHUMA
    // ======================================

    else {

        atualizarStatus(
            "Aguardando carregamento das planilhas."
        );

    }


    if (
        btnConferir
    ) {

        btnConferir.disabled =
            true;

    }

}


// ==========================================
// DISPONIBILIZAR GLOBALMENTE
// ==========================================

window.dadosPremmia =
    dadosPremmia;


window.dadosInterno =
    dadosInterno;


window.extrairData =
    extrairData;


window.extrairHora =
    extrairHora;


window.converterValor =
    converterValor;


window.normalizarAutorizacao =
    normalizarAutorizacao;


window.normalizarDataHoraPremmia =
    normalizarDataHoraPremmia;


window.normalizarDataHoraInterno =
    normalizarDataHoraInterno;


window.atualizarTela =
    atualizarTela;


window.atualizarStatus =
    atualizarStatus;


// ==========================================
// LOG FINAL
// ==========================================

console.log(
    "================================="
);


console.log(
    "leituraExcel.js iniciado"
);


console.log(
    "Leitura por data + hora preparada."
);


console.log(
    "Datas Excel: suportadas"
);


console.log(
    "Horas Excel: suportadas"
);


console.log(
    "Tolerância é definida no conferencia.js"
);


console.log(
    "================================="
);
