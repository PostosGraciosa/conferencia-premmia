// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
//
// RESPONSABILIDADE:
//
// 1. Ler planilha Premmia
// 2. Ler planilha Sistema Interno
// 3. Normalizar valores
// 4. Normalizar datas
// 5. Normalizar horários
// 6. Calcular totais
// 7. Entregar os dados para conferencia.js
//
// REGRA:
//
// A conferência NÃO depende da autorização.
//
// A comparação será feita por:
//
// VALOR
// +
// DATA
// +
// HORÁRIO
//
// A tolerância de horário é controlada
// pelo conferencia.js.
// ==========================================


// ==========================================
// DADOS GLOBAIS
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
// ABRIR EXCEL / CSV
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

        }
        catch (erro) {

            console.error(
                "Erro ao ler arquivo:",
                erro
            );

            alert(
                "Não foi possível ler a planilha."
            );

            callback([]);

        }

    };

    reader.onerror = function () {

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

    abrirExcel(
        file,
        function (linhas) {

            dadosPremmia =
                transformarPremmia(linhas);

            window.dadosPremmia =
                dadosPremmia;

            console.log(
                "================================="
            );

            console.log(
                "PREMMIA CARREGADO"
            );

            console.log(
                "Total de registros:",
                dadosPremmia.length
            );

            console.log(
                "Valor total:",
                calcularTotalPremmia()
            );

            console.log(
                dadosPremmia
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

    abrirExcel(
        file,
        function (linhas) {

            dadosInterno =
                transformarInterno(linhas);

            window.dadosInterno =
                dadosInterno;

            console.log(
                "================================="
            );

            console.log(
                "INTERNO CARREGADO"
            );

            console.log(
                "Total de registros:",
                dadosInterno.length
            );

            console.log(
                "Valor total:",
                calcularTotalInterno()
            );

            console.log(
                dadosInterno
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

    atualizarContador();

    // IMPORTANTE:
    // Atualiza os totais sempre que qualquer
    // planilha for carregada.

    atualizarTotaisPlanilhas();

    atualizarTela();

}


// ==========================================
// TRANSFORMAR PREMMIA
// ==========================================

function transformarPremmia(linhas) {

    const registros = [];

    if (!Array.isArray(linhas)) {
        return registros;
    }

    linhas.forEach(
        (linha, index) => {

            // ----------------------------------
            // PULA CABEÇALHO
            // ----------------------------------

            if (index === 0) {
                return;
            }

            if (!Array.isArray(linha)) {
                return;
            }

            if (linha.length < 8) {
                return;
            }

            // ----------------------------------
            // DATA/HORA
            // ----------------------------------

            const dataHoraOriginal =
                linha[4];

            const data =
                extrairData(
                    dataHoraOriginal
                );

            const hora =
                extrairHora(
                    dataHoraOriginal
                );

            // ----------------------------------
            // REGISTRO
            // ----------------------------------

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
                        linha[3]
                    ),

                dataHora:
                    dataHoraOriginal,

                data:
                    data,

                hora:
                    hora,

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

            // ----------------------------------
            // IMPORTANTE
            //
            // AUTORIZAÇÃO NÃO É OBRIGATÓRIA.
            //
            // A conferência usa:
            // VALOR + DATA + HORA
            // ----------------------------------

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

function transformarInterno(linhas) {

    const registros = [];

    if (!Array.isArray(linhas)) {
        return registros;
    }

    let cabecalho = null;
    let indiceCabecalho = -1;


    // ======================================
    // ENCONTRAR CABEÇALHO
    // ======================================

    for (
        let i = 0;
        i < linhas.length;
        i++
    ) {

        if (!Array.isArray(linhas[i])) {
            continue;
        }

        const texto =
            linhas[i]
                .map(
                    x =>
                        normalizarTexto(x)
                )
                .join(" ");

        if (
            texto.includes("administradora") &&
            (
                texto.includes("autorizacao") ||
                texto.includes("autorização")
            )
        ) {

            cabecalho =
                linhas[i];

            indiceCabecalho =
                i;

            break;

        }

    }


    // ======================================
    // CABEÇALHO NÃO ENCONTRADO
    // ======================================

    if (!cabecalho) {

        console.error(
            "Cabeçalho interno não encontrado."
        );

        console.log(
            "Linhas recebidas:",
            linhas
        );

        return [];

    }


    // ======================================
    // MAPEAR COLUNAS
    // ======================================

    const coluna = {};

    cabecalho.forEach(
        (nome, index) => {

            const nomeNormalizado =
                normalizarTexto(nome);

            if (nomeNormalizado) {

                coluna[
                    nomeNormalizado
                ] = index;

            }

        }
    );


    console.log(
        "Colunas encontradas:",
        coluna
    );


    // ======================================
    // LOCALIZAR COLUNA
    // ======================================

    function encontrarColuna(nomes) {

        for (
            const nome of nomes
        ) {

            const chave =
                normalizarTexto(nome);

            if (
                coluna[chave] !== undefined
            ) {

                return coluna[chave];

            }

        }

        return -1;

    }


    // ======================================
    // LOCALIZAR COLUNAS
    // ======================================

    const colunaValor =
        encontrarColuna([
            "valor"
        ]);

    const colunaHorario =
        encontrarColuna([
            "horário",
            "horario",
            "hora"
        ]);

    const colunaData =
        encontrarColuna([
            "data fiscal",
            "data"
        ]);

    const colunaCliente =
        encontrarColuna([
            "cliente"
        ]);

    const colunaFilial =
        encontrarColuna([
            "filial"
        ]);

    const colunaFuncionario =
        encontrarColuna([
            "funcionário",
            "funcionario",
            "operador"
        ]);

    const colunaTipo =
        encontrarColuna([
            "tipo inclusão",
            "tipo inclusao",
            "tipo"
        ]);

    const colunaAutorizacao =
        encontrarColuna([
            "autorização",
            "autorizacao"
        ]);


    console.log(
        "Mapeamento das colunas:"
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
        "Data:",
        colunaData
    );

    console.log(
        "Cliente:",
        colunaCliente
    );

    console.log(
        "Autorização:",
        colunaAutorizacao
    );


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

        if (!Array.isArray(linha)) {
            continue;
        }


        // ----------------------------------
        // DATA
        // ----------------------------------

        const valorData =
            colunaData >= 0
                ? linha[colunaData]
                : "";


        // ----------------------------------
        // HORA
        // ----------------------------------

        const valorHora =
            colunaHorario >= 0
                ? linha[colunaHorario]
                : "";


        const data =
            extrairData(
                valorData
            );

        const hora =
            extrairHora(
                valorHora
            );


        // ----------------------------------
        // REGISTRO
        // ----------------------------------

        const registro = {

            origem:
                "INTERNO",

            valor:
                converterValor(
                    colunaValor >= 0
                        ? linha[colunaValor]
                        : null
                ),

            data:
                data,

            hora:
                hora,

            dataHora:
                combinarDataHora(
                    data,
                    hora
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

            autorizacao:
                normalizarAutorizacao(
                    colunaAutorizacao >= 0
                        ? linha[colunaAutorizacao]
                        : ""
                )

        };


        // ----------------------------------
        // IMPORTANTE
        //
        // NÃO exigimos autorização.
        //
        // O lançamento entra se possuir valor.
        // ----------------------------------

        if (
            registro.valor !== null
        ) {

            registros.push(
                registro
            );

            console.log(
                "INTERNO:",
                registro
            );

        }

    }


    return registros;

}


// ==========================================
// COMBINAR DATA + HORA
// ==========================================

function combinarDataHora(data, hora) {

    if (!data && !hora) {
        return "";
    }

    if (data && hora) {
        return `${data} ${hora}`;
    }

    return data || hora || "";

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

    return String(valor)
        .trim()
        .replace(/\s/g, "")
        .replace(/\.0$/, "")
        .toUpperCase();

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


    // --------------------------------------
    // NÚMERO
    // --------------------------------------

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


    // --------------------------------------
    // REMOVE R$
    // --------------------------------------

    texto =
        texto
            .replace(/R\$/gi, "")
            .trim();


    // --------------------------------------
    // BRASILEIRO
    // 1.234,56
    // --------------------------------------

    if (
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

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
// TEXTO
// ==========================================

function limparTexto(valor) {

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
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(valor) {

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
        );

}


// ==========================================
// DATA
// ==========================================

function extrairData(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "";

    }


    // --------------------------------------
    // DATE DO EXCEL
    // --------------------------------------

    if (
        valor instanceof Date
    ) {

        if (
            isNaN(valor.getTime())
        ) {

            return "";

        }

        const dia =
            String(
                valor.getDate()
            ).padStart(2, "0");

        const mes =
            String(
                valor.getMonth() + 1
            ).padStart(2, "0");

        const ano =
            valor.getFullYear();

        return `${dia}/${mes}/${ano}`;

    }


    // --------------------------------------
    // NÚMERO DO EXCEL
    // --------------------------------------

    if (
        typeof valor === "number"
    ) {

        const data =
            XLSX.SSF.parse_date_code(
                valor
            );

        if (
            data &&
            data.y
        ) {

            const dia =
                String(data.d)
                    .padStart(2, "0");

            const mes =
                String(data.m)
                    .padStart(2, "0");

            return `${dia}/${mes}/${data.y}`;

        }

    }


    const texto =
        String(valor)
            .trim();


    // --------------------------------------
    // DD/MM/YYYY
    // --------------------------------------

    const match =
        texto.match(
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/
        );


    if (match) {

        let ano =
            Number(match[3]);

        if (ano < 100) {
            ano += 2000;
        }

        return (
            String(
                Number(match[1])
            ).padStart(2, "0")
            +
            "/" +
            String(
                Number(match[2])
            ).padStart(2, "0")
            +
            "/" +
            ano
        );

    }


    // --------------------------------------
    // DATA ISO
    // --------------------------------------

    const data =
        new Date(texto);

    if (
        !isNaN(data.getTime())
    ) {

        const dia =
            String(
                data.getDate()
            ).padStart(2, "0");

        const mes =
            String(
                data.getMonth() + 1
            ).padStart(2, "0");

        const ano =
            data.getFullYear();

        return `${dia}/${mes}/${ano}`;

    }


    return "";

}


// ==========================================
// HORA
// ==========================================

function extrairHora(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "";

    }


    // --------------------------------------
    // DATE DO EXCEL
    // --------------------------------------

    if (
        valor instanceof Date
    ) {

        if (
            isNaN(valor.getTime())
        ) {

            return "";

        }

        const hora =
            String(
                valor.getHours()
            ).padStart(2, "0");

        const minuto =
            String(
                valor.getMinutes()
            ).padStart(2, "0");

        const segundo =
            String(
                valor.getSeconds()
            ).padStart(2, "0");

        return `${hora}:${minuto}:${segundo}`;

    }


    // --------------------------------------
    // NÚMERO DO EXCEL
    // --------------------------------------

    if (
        typeof valor === "number" &&
        valor >= 0 &&
        valor < 1
    ) {

        const totalSegundos =
            Math.round(
                valor *
                24 *
                60 *
                60
            );

        const horas =
            Math.floor(
                totalSegundos / 3600
            );

        const minutos =
            Math.floor(
                (
                    totalSegundos % 3600
                ) / 60
            );

        const segundos =
            totalSegundos % 60;

        return (
            String(horas)
                .padStart(2, "0")
            +
            ":" +
            String(minutos)
                .padStart(2, "0")
            +
            ":" +
            String(segundos)
                .padStart(2, "0")
        );

    }


    const texto =
        String(valor)
            .trim();


    const match =
        texto.match(
            /(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (match) {

        const hora =
            String(
                Number(match[1])
            ).padStart(2, "0");

        const minuto =
            String(
                Number(match[2])
            ).padStart(2, "0");

        const segundo =
            String(
                Number(match[3] || 0)
            ).padStart(2, "0");

        return `${hora}:${minuto}:${segundo}`;

    }


    return "";

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
// STATUS
// ==========================================

function atualizarStatus(texto) {

    const status =
        document.getElementById(
            "statusSistema"
        );

    if (status) {
        status.textContent = texto;
    }

}


// ==========================================
// ATUALIZAR TELA
// ==========================================

function atualizarTela() {

    atualizarContador();

    if (
        dadosPremmia.length > 0 &&
        dadosInterno.length > 0
    ) {

        atualizarStatus(
            "Planilhas carregadas. Pronto para conferir."
        );

        if (btnConferir) {
            btnConferir.disabled = false;
        }

    }
    else {

        atualizarStatus(
            "Aguardando carregamento das planilhas."
        );

        if (btnConferir) {
            btnConferir.disabled = true;
        }

    }

}


// ==========================================
// TOTAL PORTAL PREMMIA
// ==========================================

function calcularTotalPremmia() {

    return Number(
        dadosPremmia.reduce(
            (total, registro) => {

                return total +
                    Number(
                        registro.valor || 0
                    );

            },
            0
        ).toFixed(2)
    );

}


// ==========================================
// TOTAL SISTEMA INTERNO
// ==========================================

function calcularTotalInterno() {

    return Number(
        dadosInterno.reduce(
            (total, registro) => {

                return total +
                    Number(
                        registro.valor || 0
                    );

            },
            0
        ).toFixed(2)
    );

}


// ==========================================
// ATUALIZAR TOTAIS
// ==========================================

function atualizarTotaisPlanilhas() {

    const totalPremmia =
        calcularTotalPremmia();

    const totalInterno =
        calcularTotalInterno();

    const diferenca =
        Number(
            (
                totalInterno -
                totalPremmia
            ).toFixed(2)
        );


    // --------------------------------------
    // GLOBAIS
    // --------------------------------------

    window.totalPremmia =
        totalPremmia;

    window.totalInterno =
        totalInterno;

    window.diferencaTotais =
        diferenca;


    // --------------------------------------
    // ELEMENTOS
    // --------------------------------------

    const elementoPremmia =
        document.getElementById(
            "totalPortalPremmia"
        );

    const elementoInterno =
        document.getElementById(
            "totalSistemaInterno"
        );

    const elementoDiferenca =
        document.getElementById(
            "diferencaTotais"
        );


    // --------------------------------------
    // ATUALIZAR PORTAL
    // --------------------------------------

    if (elementoPremmia) {

        elementoPremmia.textContent =
            formatarMoedaLeitura(
                totalPremmia
            );

    }


    // --------------------------------------
    // ATUALIZAR INTERNO
    // --------------------------------------

    if (elementoInterno) {

        elementoInterno.textContent =
            formatarMoedaLeitura(
                totalInterno
            );

    }


    // --------------------------------------
    // ATUALIZAR DIFERENÇA
    // --------------------------------------

    if (elementoDiferenca) {

        elementoDiferenca.textContent =
            formatarMoedaLeitura(
                diferenca
            );

    }


    console.log(
        "================================="
    );

    console.log(
        "TOTAIS DAS PLANILHAS"
    );

    console.log(
        "Portal Premmia:",
        formatarMoedaLeitura(
            totalPremmia
        )
    );

    console.log(
        "Sistema Interno:",
        formatarMoedaLeitura(
            totalInterno
        )
    );

    console.log(
        "Diferença Sistema - Portal:",
        formatarMoedaLeitura(
            diferenca
        )
    );

    console.log(
        "================================="
    );

}


// ==========================================
// FORMATAR MOEDA
// ==========================================

function formatarMoedaLeitura(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ==========================================
// DISPONIBILIZAR GLOBALMENTE
// ==========================================

window.dadosPremmia =
    dadosPremmia;

window.dadosInterno =
    dadosInterno;

window.lerPremmia =
    lerPremmia;

window.lerInterno =
    lerInterno;

window.transformarPremmia =
    transformarPremmia;

window.transformarInterno =
    transformarInterno;

window.calcularTotalPremmia =
    calcularTotalPremmia;

window.calcularTotalInterno =
    calcularTotalInterno;

window.atualizarTotaisPlanilhas =
    atualizarTotaisPlanilhas;


console.log(
    "================================="
);

console.log(
    "leituraExcel.js iniciado"
);

console.log(
    "Conferência por VALOR + DATA + HORA"
);

console.log(
    "Tolerância configurada no conferencia.js"
);

console.log(
    "================================="
);
