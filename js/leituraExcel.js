// ==========================================
// SISTEMA DE CONFERÊNCIA PREMMIA
// leituraExcel.js
// ==========================================

let dadosPremmia = [];
let dadosInterno = [];


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("leituraExcel.js iniciado");

    configurarArquivos();

    atualizarInterface();

});


// ==========================================
// CONFIGURAR ARQUIVOS
// ==========================================

function configurarArquivos() {

    const arquivoPremmia =
        document.getElementById("arquivoPremmia");

    const arquivoInterno =
        document.getElementById("arquivoInterno");


    if (!arquivoPremmia) {

        console.error(
            "ERRO: #arquivoPremmia não encontrado."
        );

    } else {

        arquivoPremmia.addEventListener(
            "change",
            function () {

                const file = this.files[0];

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
                    nome.textContent = file.name;
                }


                lerPremmia(file);

            }
        );

    }


    if (!arquivoInterno) {

        console.error(
            "ERRO: #arquivoInterno não encontrado."
        );

    } else {

        arquivoInterno.addEventListener(
            "change",
            function () {

                const file = this.files[0];

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
                    nome.textContent = file.name;
                }


                lerInterno(file);

            }
        );

    }

}


// ==========================================
// LER ARQUIVO EXCEL
// ==========================================

function abrirExcel(file, callback) {

    if (
        typeof XLSX === "undefined"
    ) {

        console.error(
            "A biblioteca XLSX não foi carregada."
        );

        alert(
            "Erro: a biblioteca Excel (XLSX) não foi carregada."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function (evento) {

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


    reader.onerror = function () {

        console.error(
            "Erro ao abrir arquivo."
        );


        alert(
            "Erro ao abrir o arquivo."
        );

    };


    reader.readAsArrayBuffer(file);

}


// ==========================================
// PREMMIA
// ==========================================

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


// ==========================================
// INTERNO
// ==========================================

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


            console.log(
                "Primeiras linhas:",
                linhas.slice(0, 5)
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


// ==========================================
// TRANSFORMAR PREMMIA
// ==========================================
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


            // pula cabeçalho
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
// NORMALIZAR NOME DE COLUNA
// ==========================================

function normalizarCabecalho(valor) {

    return limparTexto(valor)
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();

}


// ==========================================
// ENCONTRAR CABEÇALHO INTERNO
// ==========================================

function encontrarCabecalho(linhas) {

    const nomesObrigatorios = [
        "ADMINISTRADORA",
        "VALOR",
        "HORARIO",
        "MOVIMENTO",
        "DATA FISCAL",
        "BOM PARA",
        "VALOR LIQUIDO",
        "CLIENTE",
        "FILIAL",
        "FUNCIONARIO",
        "TIPO INCLUSAO",
        "C. DE CUSTO",
        "AUTORIZACAO"
    ];


    for (
        let linhaIndex = 0;
        linhaIndex < Math.min(linhas.length, 20);
        linhaIndex++
    ) {

        const linha =
            Array.isArray(
                linhas[linhaIndex]
            )
                ? linhas[linhaIndex]
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


        nomesObrigatorios.forEach(
            function (nome) {

                const existe =
                    colunas.some(
                        function (coluna) {

                            return (
                                coluna === nome
                                ||
                                coluna.includes(nome)
                            );

                        }
                    );


                if (existe) {
                    encontrados++;
                }

            }
        );


        console.log(
            "Linha analisada como cabeçalho:",
            linhaIndex,
            colunas,
            "Encontrados:",
            encontrados
        );


        if (
            encontrados >= 5
        ) {

            return {
                indice: linhaIndex,
                colunas: colunas
            };

        }

    }


    return null;

}


// ==========================================
// LOCALIZAR COLUNA
// ==========================================

function localizarColuna(
    colunas,
    nomes
) {

    for (
        let i = 0;
        i < nomes.length;
        i++
    ) {

        const procurado =
            normalizarCabecalho(
                nomes[i]
            );


        for (
            let c = 0;
            c < colunas.length;
            c++
        ) {

            if (
                colunas[c] === procurado
            ) {

                return c;

            }

        }

    }


    // segunda tentativa:
    // contém o nome

    for (
        let i = 0;
        i < nomes.length;
        i++
    ) {

        const procurado =
            normalizarCabecalho(
                nomes[i]
            );


        for (
            let c = 0;
            c < colunas.length;
            c++
        ) {

            if (
                colunas[c].includes(
                    procurado
                )
            ) {

                return c;

            }

        }

    }


    return -1;

}


// ==========================================
// TRANSFORMAR INTERNO
// ==========================================

function transformarInterno(linhas) {

    const registros = [];


    if (
        !Array.isArray(linhas)
        ||
        linhas.length === 0
    ) {

        return registros;

    }


    const cabecalho =
        encontrarCabecalho(
            linhas
        );


    if (!cabecalho) {

        console.error(
            "Não foi possível localizar o cabeçalho da planilha interna."
        );


        alert(
            "Não consegui localizar o cabeçalho da planilha interna.\n\n" +
            "Verifique se ela contém as colunas:\n" +
            "Administradora, Valor, Horário, Movimento, Data Fiscal, " +
            "Bom Para, Valor Líquido, Cliente, Filial, Funcionário, " +
            "Tipo Inclusão, C. de Custo e Autorização."
        );


        return registros;

    }


    const indiceCabecalho =
        cabecalho.indice;


    const colunas =
        cabecalho.colunas;


    console.log(
        "Cabeçalho interno encontrado na linha:",
        indiceCabecalho
    );


    console.log(
        "Colunas internas:",
        colunas
    );


    // ======================================
    // LOCALIZAR TODAS AS COLUNAS
    // ======================================

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
                "DATA FISCAL"
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


        const vazia =
            linha.every(
                function (valor) {

                    return (
                        valor === ""
                        ||
                        valor === null
                        ||
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

        let valor = null;


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
        // NÃO PEGAR QUALQUER NÚMERO
        //
        // Se a coluna Valor estiver correta,
        // usamos somente ela.
        // ==================================

        if (
            valor === null
        ) {

            console.warn(
                "Linha interna sem valor:",
                i,
                linha
            );


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

function pegarBruto(
    linha,
    coluna
) {

    if (
        coluna === undefined
        ||
        coluna < 0
    ) {

        return "";

    }


    return linha[coluna];

}


// ==========================================
// PEGAR TEXTO
// ==========================================

function pegarTexto(
    linha,
    coluna
) {

    const valor =
        pegarBruto(
            linha,
            coluna
        );


    return limparTexto(
        valor
    );

}


// ==========================================
// NORMALIZAR AUTORIZAÇÃO
// ==========================================

function normalizarAutorizacao(
    valor
) {

    if (
        valor === null
        ||
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
        valor === null
        ||
        valor === undefined
        ||
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
    //
    // 2,50
    // 25,04
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


    if (!texto) {
        return null;
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
        valor === null
        ||
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


    if (encontrado) {

        return encontrado[0];

    }


    return "";

}


// ==========================================
// ATUALIZAR INTERFACE
// ==========================================

function atualizarInterface() {

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


    const btn =
        document.getElementById(
            "btnConferir"
        );


    if (
        dadosPremmia.length > 0
        &&
        dadosInterno.length > 0
    ) {

        if (btn) {

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

        }


        atualizarStatus(
            "Planilhas carregadas. Pronto para conferir."
        );


        console.log(
            "================================"
        );

        console.log(
            "BOTÃO CONFERIR HABILITADO"
        );

        console.log(
            "================================"
        );

    }

    else {

        if (btn) {

            btn.disabled = true;

        }


        atualizarStatus(
            "Aguardando carregamento das planilhas."
        );


        console.log(
            "Aguardando as duas planilhas."
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
// DISPONIBILIZAR DADOS
// ==========================================

window.dadosPremmia =
    dadosPremmia;


window.dadosInterno =
    dadosInterno;


// ==========================================
// LIMPAR SISTEMA
// ==========================================

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


// ==========================================
// FINAL
// ==========================================

console.log(
    "leituraExcel.js completo carregado"
);
