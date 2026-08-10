// ======================================================
// SISTEMA DE CONFERÊNCIA PREMMIA
// leituraExcel.js
// ====================================================== 

let dadosPremmia = [];
let dadosInterno = [];


// ======================================================
// INICIALIZAÇÃO
// ======================================================

function iniciarLeituraExcel() {

    console.log("================================");
    console.log("leituraExcel.js iniciado");
    console.log("================================");

    configurarArquivos();
    atualizarInterface();
}


// ======================================================
// GARANTIR EXECUÇÃO
// ======================================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarLeituraExcel
    );

} else {

    iniciarLeituraExcel();

}


// ======================================================
// CONFIGURAR ARQUIVOS
// ======================================================

function configurarArquivos() {

    const arquivoPremmia =
        document.getElementById("arquivoPremmia");

    const arquivoInterno =
        document.getElementById("arquivoInterno");


    // ==================================================
    // PREMMIA
    // ==================================================

    if (arquivoPremmia) {

        arquivoPremmia.addEventListener(
            "change",
            function () {

                const file =
                    this.files && this.files[0];

                if (!file) {
                    return;
                }

                console.log(
                    "Arquivo Premmia selecionado:",
                    file.name
                );

                const nome =
                    document.getElementById(
                        "nomePremmia"
                    );

                if (nome) {

                    nome.textContent =
                        file.name;

                }

                lerPremmia(file);

            }
        );

    } else {

        console.error(
            "ERRO: #arquivoPremmia não encontrado."
        );

    }


    // ==================================================
    // SISTEMA INTERNO
    // ==================================================

    if (arquivoInterno) {

        arquivoInterno.addEventListener(
            "change",
            function () {

                const file =
                    this.files && this.files[0];

                if (!file) {
                    return;
                }

                console.log(
                    "Arquivo interno selecionado:",
                    file.name
                );

                const nome =
                    document.getElementById(
                        "nomeInterno"
                    );

                if (nome) {

                    nome.textContent =
                        file.name;

                }

                lerInterno(file);

            }
        );

    } else {

        console.error(
            "ERRO: #arquivoInterno não encontrado."
        );

    }

}


// ======================================================
// ABRIR EXCEL
// ======================================================

function abrirExcel(
    file,
    callback
) {

    if (
        typeof XLSX === "undefined"
    ) {

        console.error(
            "Biblioteca XLSX não carregada."
        );

        alert(
            "Erro: a biblioteca Excel (XLSX) não foi carregada."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (evento) {

            try {

                const dados =
                    new Uint8Array(
                        evento.target.result
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

                    throw new Error(
                        "Nenhuma aba encontrada."
                    );

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


                console.log(
                    "Aba carregada:",
                    nomeAba
                );

                console.log(
                    "Quantidade de linhas:",
                    linhas.length
                );


                callback(linhas);

            }
            catch (erro) {

                console.error(
                    "Erro ao ler Excel:",
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
                "Erro ao abrir arquivo."
            );

            alert(
                "Erro ao abrir o arquivo."
            );

        };


    reader.readAsArrayBuffer(file);

}


// ======================================================
// LER PREMMIA
// ======================================================

function lerPremmia(file) {

    console.log(
        "================================"
    );

    console.log(
        "LENDO PREMMIA"
    );

    console.log(
        "================================"
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
                "Premmia carregado:",
                dadosPremmia
            );


            console.log(
                "Quantidade Premmia:",
                dadosPremmia.length
            );


            atualizarInterface();

        }
    );

}


// ======================================================
// LER INTERNO
// ======================================================

function lerInterno(file) {

    console.log(
        "================================"
    );

    console.log(
        "LENDO SISTEMA INTERNO"
    );

    console.log(
        "================================"
    );


    abrirExcel(
        file,
        function (linhas) {

            console.log(
                "Linhas internas:",
                linhas.length
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


            console.log(
                "Quantidade Interno:",
                dadosInterno.length
            );


            atualizarInterface();

        }
    );

}


// ======================================================
// TRANSFORMAR PREMMIA
// ======================================================

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
        function (linha, index) {

            if (
                !Array.isArray(linha)
            ) {

                return;

            }


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
                    extrairHoraCompleta(
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


// ======================================================
// TRANSFORMAR INTERNO
// ======================================================

function transformarInterno(
    linhas
) {

    const registros = [];


    if (
        !Array.isArray(linhas)
    ) {

        return registros;

    }


    const indiceCabecalho =
        encontrarCabecalho(
            linhas
        );


    if (
        indiceCabecalho === -1
    ) {

        console.error(
            "Cabeçalho do sistema interno não encontrado."
        );

        return registros;

    }


    const cabecalho =
        linhas[indiceCabecalho];


    const colunas =
        cabecalho.map(
            function (valor) {

                return normalizarCabecalho(
                    valor
                );

            }
        );


    const colunaAdministradora =
        localizarColuna(
            colunas,
            [
                "ADMINISTRADORA"
            ]
        );


    const colunaValor =
        localizarColuna(
            colunas,
            [
                "VALOR"
            ]
        );


    const colunaHorario =
        localizarColuna(
            colunas,
            [
                "HORÁRIO",
                "HORARIO"
            ]
        );


    const colunaMovimento =
        localizarColuna(
            colunas,
            [
                "MOVIMENTO"
            ]
        );


    const colunaData =
        localizarColuna(
            colunas,
            [
                "DATA FISCAL",
                "DATA"
            ]
        );


    const colunaBomPara =
        localizarColuna(
            colunas,
            [
                "BOM PARA"
            ]
        );


    const colunaValorLiquido =
        localizarColuna(
            colunas,
            [
                "VALOR LÍQUIDO",
                "VALOR LIQUIDO"
            ]
        );


    const colunaCliente =
        localizarColuna(
            colunas,
            [
                "CLIENTE"
            ]
        );


    const colunaFilial =
        localizarColuna(
            colunas,
            [
                "FILIAL"
            ]
        );


    const colunaFuncionario =
        localizarColuna(
            colunas,
            [
                "FUNCIONÁRIO",
                "FUNCIONARIO"
            ]
        );


    const colunaTipo =
        localizarColuna(
            colunas,
            [
                "TIPO INCLUSÃO",
                "TIPO INCLUSAO"
            ]
        );


    const colunaCentroCusto =
        localizarColuna(
            colunas,
            [
                "C. DE CUSTO",
                "C DE CUSTO"
            ]
        );


    const colunaAutorizacao =
        localizarColuna(
            colunas,
            [
                "AUTORIZAÇÃO",
                "AUTORIZACAO"
            ]
        );


    console.log(
        "MAPEAMENTO INTERNO:",
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

            funcionario:
                colunaFuncionario,

            tipo:
                colunaTipo,

            autorizacao:
                colunaAutorizacao
        }
    );


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


        const valor =
            colunaValor >= 0
                ? converterValor(
                    linha[colunaValor]
                )
                : null;


        if (
            valor === null
        ) {

            continue;

        }


        const registro = {

            origem:
                "INTERNO",

            administradora:
                pegarTexto(
                    linha,
                    colunaAdministradora
                ),

            valor:
                valor,

            hora:
                pegarTexto(
                    linha,
                    colunaHorario
                ),

            movimento:
                pegarTexto(
                    linha,
                    colunaMovimento
                ),

            data:
                pegarTexto(
                    linha,
                    colunaData
                ),

            bomPara:
                pegarTexto(
                    linha,
                    colunaBomPara
                ),

            valorLiquido:
                converterValor(
                    pegarBruto(
                        linha,
                        colunaValorLiquido
                    )
                ),

            cliente:
                pegarTexto(
                    linha,
                    colunaCliente
                ),

            filial:
                pegarTexto(
                    linha,
                    colunaFilial
                ),

            operador:
                pegarTexto(
                    linha,
                    colunaFuncionario
                ),

            tipo:
                pegarTexto(
                    linha,
                    colunaTipo
                ),

            centroCusto:
                pegarTexto(
                    linha,
                    colunaCentroCusto
                ),

            autorizacao:
                normalizarAutorizacao(
                    pegarBruto(
                        linha,
                        colunaAutorizacao
                    )
                )

        };


        registros.push(
            registro
        );

    }


    return registros;

}


// ======================================================
// ENCONTRAR CABEÇALHO
// ======================================================

function encontrarCabecalho(
    linhas
) {

    const obrigatorios = [

        "ADMINISTRADORA",
        "VALOR",
        "HORARIO",
        "MOVIMENTO",
        "DATA FISCAL"

    ];


    for (
        let i = 0;

        i <
            Math.min(
                linhas.length,
                30
            );

        i++
    ) {

        const linha =
            Array.isArray(
                linhas[i]
            )
                ? linhas[i]
                : [];


        const colunas =
            linha.map(
                function (valor) {

                    return normalizarCabecalho(
                        valor
                    );

                }
            );


        let encontrados = 0;


        obrigatorios.forEach(
            function (nome) {

                if (
                    colunas.includes(nome)
                ) {

                    encontrados++;

                }

            }
        );


        if (
            encontrados >= 3
        ) {

            return i;

        }

    }


    return -1;

}


// ======================================================
// LOCALIZAR COLUNA
// ======================================================

function localizarColuna(
    colunas,
    nomes
) {

    for (
        let i = 0;

        i <
            nomes.length;

        i++
    ) {

        const indice =
            colunas.indexOf(
                normalizarCabecalho(
                    nomes[i]
                )
            );


        if (
            indice !== -1
        ) {

            return indice;

        }

    }


    return -1;

}


// ======================================================
// NORMALIZAR CABEÇALHO
// ======================================================

function normalizarCabecalho(
    valor
) {

    return limparTexto(valor)
        .toUpperCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


// ======================================================
// PEGAR BRUTO
// ======================================================

function pegarBruto(
    linha,
    coluna
) {

    if (
        coluna === undefined ||
        coluna < 0
    ) {

        return "";

    }


    return linha[coluna];

}


// ======================================================
// PEGAR TEXTO
// ======================================================

function pegarTexto(
    linha,
    coluna
) {

    return limparTexto(
        pegarBruto(
            linha,
            coluna
        )
    );

}


// ======================================================
// CONVERTER VALOR
// ======================================================

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


    let texto =
        String(valor)
        .trim();


    if (
        !texto
    ) {

        return null;

    }


    texto =
        texto
        .replace(
            /R\$/gi,
            ""
        )
        .trim();


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
        !Number.isFinite(numero)
    ) {

        return null;

    }


    return Number(
        numero.toFixed(2)
    );

}


// ======================================================
// LIMPAR TEXTO
// ======================================================

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


// ======================================================
// EXTRAIR DATA
// ======================================================

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


    const texto =
        String(valor);


    const encontrado =
        texto.match(
            /\d{1,2}\/\d{1,2}\/\d{4}/
        );


    if (
        encontrado
    ) {

        return encontrado[0];

    }


    return texto;

}


// ======================================================
// EXTRAIR HORA COMPLETA
// ======================================================

function extrairHoraCompleta(
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
                minute: "2-digit",
                second: "2-digit"
            }
        );

    }


    const texto =
        String(valor);


    const encontrado =
        texto.match(
            /\d{1,2}:\d{2}(?::\d{2})?/
        );


    if (
        encontrado
    ) {

        return encontrado[0];

    }


    return "";

}


// ======================================================
// NORMALIZAR AUTORIZAÇÃO
// ======================================================

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
        .replace(
            /\.0$/,
            ""
        )
        .replace(
            /\s/g,
            ""
        )
        .replace(
            /[^\w]/g,
            ""
        );

}


// ======================================================
// ATUALIZAR INTERFACE
// ======================================================

function atualizarInterface() {

    const btn =
        document.getElementById(
            "btnConferir"
        );


    const quantidadePremmia =
        dadosPremmia.length;


    const quantidadeInterno =
        dadosInterno.length;


    console.log(
        "================================"
    );

    console.log(
        "VERIFICANDO PLANILHAS"
    );

    console.log(
        "Premmia:",
        quantidadePremmia
    );

    console.log(
        "Interno:",
        quantidadeInterno
    );


    if (btn) {

        // IMPORTANTE:
        // O botão NÃO depende mais
        // somente do atributo disabled
        // colocado no HTML.

        if (
            quantidadePremmia > 0 &&
            quantidadeInterno > 0
        ) {

            btn.disabled = false;

            btn.removeAttribute(
                "disabled"
            );

            btn.style.pointerEvents =
                "auto";

            btn.style.opacity =
                "1";

            btn.style.cursor =
                "pointer";

            atualizarStatus(
                "Planilhas carregadas. Pronto para conferir."
            );

        }
        else {

            btn.disabled = true;

            atualizarStatus(
                "Aguardando carregamento das planilhas."
            );

        }

    }


    atualizarContador();

}


// ======================================================
// CONTADOR
// ======================================================

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


// ======================================================
// STATUS
// ======================================================

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


// ======================================================
// DISPONIBILIZAR GLOBAL
// ======================================================

window.dadosPremmia =
    dadosPremmia;

window.dadosInterno =
    dadosInterno;


// ======================================================
// LIMPAR
// ======================================================

window.limparDadosPlanilhas =
    function () {

        dadosPremmia = [];

        dadosInterno = [];


        window.dadosPremmia =
            dadosPremmia;

        window.dadosInterno =
            dadosInterno;


        const arquivoPremmia =
            document.getElementById(
                "arquivoPremmia"
            );

        const arquivoInterno =
            document.getElementById(
                "arquivoInterno"
            );


        if (arquivoPremmia) {
            arquivoPremmia.value = "";
        }


        if (arquivoInterno) {
            arquivoInterno.value = "";
        }


        const nomePremmia =
            document.getElementById(
                "nomePremmia"
            );

        const nomeInterno =
            document.getElementById(
                "nomeInterno"
            );


        if (nomePremmia) {

            nomePremmia.textContent =
                "Nenhum arquivo selecionado";

        }


        if (nomeInterno) {

            nomeInterno.textContent =
                "Nenhum arquivo selecionado";

        }


        atualizarInterface();

    };


// ======================================================
// EXPORTAR FUNÇÕES
// ======================================================

window.atualizarInterface =
    atualizarInterface;

window.converterValor =
    converterValor;

window.normalizarAutorizacao =
    normalizarAutorizacao;


console.log(
    "leituraExcel.js completo carregado"
);
