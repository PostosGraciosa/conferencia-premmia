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


                if (
                    !workbook.SheetNames ||
                    workbook.SheetNames.length === 0
                ) {

                    alert(
                        "A planilha não possui nenhuma aba."
                    );

                    return;

                }


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
                    "ERRO AO ABRIR EXCEL:",
                    erro
                );


                alert(
                    "Não foi possível ler a planilha."
                );

            }

        };


    reader.onerror =
        function () {

            console.error(
                "Erro ao ler arquivo."
            );


            alert(
                "Erro ao ler o arquivo."
            );

        };


    reader.readAsArrayBuffer(file);

}


// ==========================================
// LER PREMMIA
// ==========================================

function lerPremmia(file) {

    console.log(
        "================================="
    );

    console.log(
        "LENDO PLANILHA PREMMIA"
    );

    console.log(
        "Arquivo:",
        file.name
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
                "PREMMIA PROCESSADO:",
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
        "================================="
    );

    console.log(
        "LENDO PLANILHA INTERNA"
    );

    console.log(
        "Arquivo:",
        file.name
    );


    abrirExcel(
        file,
        function (linhas) {

            console.log(
                "Linhas internas:",
                linhas.length
            );


            if (linhas.length > 0) {

                console.log(
                    "PRIMEIRA LINHA INTERNA:",
                    linhas[0]
                );

            }


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
                "INTERNO PROCESSADO:",
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


    if (
        !Array.isArray(linhas)
    ) {

        return registros;

    }


    linhas.forEach(
        function (linha, index) {

            if (
                !Array.isArray(linha)
            ) {

                return;

            }


            // Cabeçalho
            if (
                index === 0
            ) {

                return;

            }


            if (
                linha.length < 7
            ) {

                return;

            }


            const valor =
                converterValor(
                    linha[3]
                );


            if (
                valor === null
            ) {

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
        !Array.isArray(linhas) ||
        linhas.length === 0
    ) {

        console.warn(
            "Planilha interna vazia."
        );

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
            20
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
                        .toUpperCase()
                        .normalize("NFD")
                        .replace(
                            /[\u0300-\u036f]/g,
                            ""
                        );

                    }
                )
                .join(" | ");


        console.log(
            "LINHA " + i + ":",
            texto
        );


        // Procuramos principalmente
        // ADMINISTRADORA + VALOR

        if (
            texto.includes("ADMINISTRADORA") &&
            texto.includes("VALOR")
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
            "Cabeçalho não encontrado."
        );


        // Como último recurso,
        // usa a primeira linha.

        indiceCabecalho = 0;

    }


    console.log(
        "CABEÇALHO INTERNO ENCONTRADO NA LINHA:",
        indiceCabecalho
    );


    const cabecalho =
        linhas[indiceCabecalho] || [];


    console.log(
        "CABEÇALHO:",
        cabecalho
    );


    // ======================================
    // CRIAR MAPA DAS COLUNAS
    // ======================================

    const mapa = {};


    cabecalho.forEach(
        function (valor, index) {

            const nome =
                limparTexto(
                    valor
                )
                .toUpperCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );


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
    // LOCALIZAR COLUNA
    // ======================================

    function acharColuna() {

        const nomes =
            Array.from(arguments);


        // Primeiro tenta EXATAMENTE

        for (
            let i = 0;
            i < nomes.length;
            i++
        ) {

            const procurado =
                nomes[i]
                    .toUpperCase()
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    );


            if (
                mapa[procurado] !== undefined
            ) {

                return mapa[procurado];

            }

        }


        // Depois tenta CONTENDO

        const chaves =
            Object.keys(mapa);


        for (
            let i = 0;
            i < nomes.length;
            i++
        ) {

            const procurado =
                nomes[i]
                    .toUpperCase()
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    );


            const encontrada =
                chaves.find(
                    function (coluna) {

                        return coluna.includes(
                            procurado
                        );

                    }
                );


            if (
                encontrada !== undefined
            ) {

                return mapa[
                    encontrada
                ];

            }

        }


        return -1;

    }


    // ======================================
    // COLUNAS
    // ======================================

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
            "HORARIO",
            "HORÁRIO"
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
            "VALOR LIQUIDO",
            "VALOR LÍQUIDO"
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
            "FUNCIONARIO",
            "FUNCIONÁRIO"
        );


    const colunaTipo =
        acharColuna(
            "TIPO INCLUSAO",
            "TIPO INCLUSÃO"
        );


    const colunaCentroCusto =
        acharColuna(
            "C DE CUSTO",
            "C. DE CUSTO"
        );


    const colunaAutorizacao =
        acharColuna(
            "AUTORIZACAO",
            "AUTORIZAÇÃO"
        );


    console.log(
        "================================="
    );

    console.log(
        "COLUNAS ENCONTRADAS:"
    );

    console.log(
        "Administradora:",
        colunaAdministradora
    );

    console.log(
        "Valor:",
        colunaValor
    );

    console.log(
        "Horário:",
        colunaHorario
    );

    console.log(
        "Movimento:",
        colunaMovimento
    );

    console.log(
        "Data:",
        colunaData
    );

    console.log(
        "Bom Para:",
        colunaBomPara
    );

    console.log(
        "Valor Líquido:",
        colunaValorLiquido
    );

    console.log(
        "Cliente:",
        colunaCliente
    );

    console.log(
        "Filial:",
        colunaFilial
    );

    console.log(
        "Funcionário:",
        colunaFuncionario
    );

    console.log(
        "Tipo:",
        colunaTipo
    );

    console.log(
        "Centro de Custo:",
        colunaCentroCusto
    );

    console.log(
        "Autorização:",
        colunaAutorizacao
    );


    // ======================================
    // LER LINHAS
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


        // Ignora linha completamente vazia

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
        // NÃO TENTAR PEGAR QUALQUER NÚMERO
        // DA LINHA.
        //
        // Isso poderia pegar data,
        // código ou outro campo.
        // ==================================

        if (
            valor === null
        ) {

            console.warn(
                "Linha ignorada por não possuir valor:",
                i,
                linha
            );

            continue;

        }


        // ==================================
        // CRIAR REGISTRO
        // ==================================

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


    console.log(
        "TOTAL INTERNO TRANSFORMADO:",
        registros.length
    );


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
        coluna === undefined ||
        coluna === null
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
        coluna === undefined ||
        coluna === null
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


    // Excel pode trazer 12345.0

    texto =
        texto.replace(
            /\.0$/,
            ""
        );


    // Remove espaços

    texto =
        texto.replace(
            /\s/g,
            ""
        );


    // Remove caracteres especiais

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


    // Número real do Excel

    if (
        typeof valor === "number"
    ) {

        return Number(
            valor.toFixed(2)
        );

    }


    // Data não é valor

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
    // FORMATO BRASILEIRO
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
    // FORMATO DECIMAL
    //
    // 2.50
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
        "================================="
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

        // ==================================
        // HABILITA BOTÃO
        // ==================================

        if (btnConferir) {

            btnConferir.disabled =
                false;

            btnConferir.removeAttribute(
                "disabled"
            );

            btnConferir.style.pointerEvents =
                "auto";

            btnConferir.style.opacity =
                "1";

            btnConferir.style.cursor =
                "pointer";

        }


        atualizarStatus(
            "Planilhas carregadas. Pronto para conferir."
        );


        console.log(
            "================================="
        );

        console.log(
            "BOTÃO CONFERIR HABILITADO!"
        );

        console.log(
            "Premmia:",
            dadosPremmia.length
        );

        console.log(
            "Interno:",
            dadosInterno.length
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
            "BOTÃO AINDA DESABILITADO"
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
