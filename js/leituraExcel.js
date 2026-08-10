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
                            cellDates: true
                        }
                    );


                const nomeAba =
                    workbook.SheetNames[0];


                const planilha =
                    workbook.Sheets[nomeAba];


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

    console.log(
        "Lendo planilha Premmia..."
    );


    abrirExcel(
        file,
        function (linhas) {

            console.log(
                "Linhas Premmia:",
                linhas.length
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

    console.log(
        "Lendo planilha interna..."
    );


    abrirExcel(
        file,
        function (linhas) {

            console.log(
                "Linhas internas:",
                linhas.length
            );


            console.log(
                "Primeira linha interna:",
                linhas[0]
            );


            console.log(
                "Segunda linha interna:",
                linhas[1]
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
// TRANSFORMAR PREMMIA
// ==========================================
//
// PORTAL:
//
// CPF
// Nome
// Produto
// Valor
// Data/Hora da transação
// Código Transação
// Forma de Pagamento
// Status
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


            const valor =
                converterValor(
                    linha[3]
                );


            if (valor === null) {
                return;
            }


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
                    valor,

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


            registros.push(
                registro
            );

        }
    );


    return registros;

}


// ==========================================
// TRANSFORMAR INTERNO
// ==========================================
//
// SISTEMA:
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


    if (
        !linhas ||
        linhas.length === 0
    ) {

        return registros;

    }


    // ======================================
    // ENCONTRAR CABEÇALHO
    // ======================================

    let indiceCabecalho = -1;


    for (
        let i = 0;
        i < Math.min(
            linhas.length,
            15
        );
        i++
    ) {

        const linha =
            Array.isArray(linhas[i])
                ? linhas[i]
                : [];


        const texto =
            linha
                .map(
                    function (valor) {

                        return limparTexto(
                            valor
                        )
                        .toUpperCase();

                    }
                )
                .join(" | ");


        console.log(
            "LINHA CABEÇALHO:",
            i,
            texto
        );


        if (
            texto.includes(
                "ADMINISTRADORA"
            )
            &&
            texto.includes(
                "VALOR"
            )
        ) {

            indiceCabecalho =
                i;

            break;

        }

    }


    if (
        indiceCabecalho === -1
    ) {

        console.warn(
            "Cabeçalho não encontrado. Usando primeira linha."
        );

        indiceCabecalho = 0;

    }


    console.log(
        "Índice do cabeçalho:",
        indiceCabecalho
    );


    const cabecalho =
        linhas[indiceCabecalho] ||
        [];


    const mapa =
        {};


    cabecalho.forEach(
        function (valor, index) {

            const nome =
                limparTexto(
                    valor
                )
                .toUpperCase();


            if (nome) {

                mapa[nome] =
                    index;

            }

        }
    );


    console.log(
        "MAPA DAS COLUNAS:",
        mapa
    );


    // ======================================
    // LOCALIZAR COLUNAS
    // ======================================

    function acharColuna() {

        const nomes =
            Array.from(arguments);


        for (
            let i = 0;
            i < nomes.length;
            i++
        ) {

            const procurado =
                nomes[i]
                    .toUpperCase();


            const encontrada =
                Object.keys(mapa)
                    .find(
                        function (coluna) {

                            return (
                                coluna ===
                                    procurado
                                ||
                                coluna.includes(
                                    procurado
                                )
                            );

                        }
                    );


            if (
                encontrada !==
                undefined
            ) {

                return mapa[
                    encontrada
                ];

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
            administradora:
                colunaAdministradora,

            valor:
                colunaValor,

            horario:
                colunaHorario,

            movimento:
                colunaMovimento,

            data:
                colunaData,

            bomPara:
                colunaBomPara,

            valorLiquido:
                colunaValorLiquido,

            cliente:
                colunaCliente,

            filial:
                colunaFilial,

            funcionario:
                colunaFuncionario,

            tipo:
                colunaTipo,

            centroCusto:
                colunaCentroCusto,

            autorizacao:
                colunaAutorizacao
        }
    );


    // ======================================
    // LER REGISTROS
    // ======================================

    for (
        let i =
            indiceCabecalho + 1;

        i <
            linhas.length;

        i++
    ) {

        const linha =
            linhas[i];


        if (
            !Array.isArray(linha)
        ) {

            continue;

        }


        const vazia =
            linha.every(
                function (valor) {

                    return (
                        valor === "" ||
                        valor === null ||
                        valor === undefined
                    );

                }
            );


        if (vazia) {
            continue;
        }


        // ==================================
        // VALOR
        // ==================================

        let valor =
            null;


        if (
            colunaValor >= 0
        ) {

            valor =
                converterValor(
                    linha[
                        colunaValor
                    ]
                );

        }


        // ==================================
        // SE VALOR NÃO FOI ENCONTRADO,
        // TENTA LOCALIZAR UMA CÉLULA
        // QUE TENHA VALOR MONETÁRIO
        // ==================================

        if (
            valor === null
        ) {

            for (
                let c = 0;
                c < linha.length;
                c++
            ) {

                const tentativa =
                    converterValor(
                        linha[c]
                    );


                if (
                    tentativa !== null
                ) {

                    valor =
                        tentativa;

                    break;

                }

            }

        }


        if (
            valor === null
        ) {

            continue;

        }


        const registro = {

            origem:
                "INTERNO",

            administradora:
                pegarValor(
                    linha,
                    colunaAdministradora
                ),

            valor:
                valor,

            hora:
                pegarValor(
                    linha,
                    colunaHorario
                ),

            movimento:
                pegarValor(
                    linha,
                    colunaMovimento
                ),

            data:
                pegarValor(
                    linha,
                    colunaData
                ),

            bomPara:
                pegarValor(
                    linha,
                    colunaBomPara
                ),

            valorLiquido:
                converterValor(
                    pegarValorBruto(
                        linha,
                        colunaValorLiquido
                    )
                ),

            cliente:
                pegarValor(
                    linha,
                    colunaCliente
                ),

            filial:
                pegarValor(
                    linha,
                    colunaFilial
                ),

            operador:
                pegarValor(
                    linha,
                    colunaFuncionario
                ),

            tipo:
                pegarValor(
                    linha,
                    colunaTipo
                ),

            centroCusto:
                pegarValor(
                    linha,
                    colunaCentroCusto
                ),

            autorizacao:
                normalizarAutorizacao(
                    pegarValorBruto(
                        linha,
                        colunaAutorizacao
                    )
                )

        };


        registros.push(
            registro
        );


        console.log(
            "INTERNO:",
            registro
        );

    }


    return registros;

}


// ==========================================
// PEGAR VALOR BRUTO
// ==========================================

function pegarValorBruto(
    linha,
    coluna
) {

    if (
        coluna < 0 ||
        coluna === undefined
    ) {

        return "";

    }


    return linha[coluna];

}


// ==========================================
// PEGAR TEXTO
// ==========================================

function pegarValor(
    linha,
    coluna
) {

    if (
        coluna < 0 ||
        coluna === undefined
    ) {

        return "";

    }


    return limparTexto(
        linha[coluna]
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
            .trim()
            .toUpperCase();


    texto =
        texto.replace(
            /\.0$/,
            ""
        );


    texto =
        texto.replace(
            /\s/g,
            ""
        );


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
    // NÚMERO
    // ======================================

    if (
        typeof valor === "number"
    ) {

        return Number(
            valor.toFixed(2)
        );

    }


    // ======================================
    // DATA
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


    texto =
        texto.replace(
            /R\$/gi,
            ""
        )
        .trim();


    // ======================================
    // BRASIL
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

function limparTexto(
    valor
) {

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

function extrairData(
    valor
) {

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

function extrairHora(
    valor
) {

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


    const encontrado =
        texto.match(
            /\d{1,2}:\d{2}/
        );


    if (
        encontrado
    ) {

        return encontrado[0];

    }


    return "";

}


// ==========================================
// VERIFICAR ARQUIVOS
// ==========================================

function verificarArquivos() {

    console.log(
        "================================"
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
            "BOTÃO CONFERIR HABILITADO"
        );

    }

    else {

        if (btnConferir) {

            btnConferir.disabled =
                true;

        }


        atualizarStatus(
            "Aguardando carregamento das planilhas."
        );


        console.log(
            "AGUARDANDO PLANILHAS"
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

function atualizarStatus(
    texto
) {

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


// ==========================================
// MENSAGEM FINAL
// ==========================================

console.log(
    "leituraExcel.js completo carregado"
);
```
