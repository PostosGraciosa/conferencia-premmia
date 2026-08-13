// ============================================================
// LEITURA E NORMALIZAÇÃO DAS PLANILHAS
// CONFERÊNCIA PREMMIA
// ============================================================

console.log("================================");
console.log("leituraExcel.js iniciado");
console.log("================================");

window.dadosPremmia = [];
window.dadosInterno = [];

window.resumoPremmia = {
    quantidade: 0,
    total: 0
};

window.resumoInterno = {
    quantidade: 0,
    totalCalculado: 0,
    totalInformado: null
};


// ============================================================
// UTILITÁRIOS
// ============================================================

function limparTexto(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();

}


function normalizarCabecalho(valor) {

    return limparTexto(valor)
        .replace(/[^A-Z0-9]/g, "");

}


function converterValor(valor) {

    if (valor === null || valor === undefined || valor === "") {
        return 0;
    }

    if (typeof valor === "number") {
        return Number(valor.toFixed(2));
    }

    let texto = String(valor)
        .trim()
        .replace(/\s/g, "")
        .replace(/R\$/gi, "");

    // 1.234,56
    if (texto.includes(",") && texto.includes(".")) {

        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");

    }
    else if (texto.includes(",")) {

        texto = texto.replace(",", ".");

    }

    texto = texto.replace(/[^\d.-]/g, "");

    const numero = Number(texto);

    return Number.isFinite(numero)
        ? Number(numero.toFixed(2))
        : 0;

}


function formatarValor(valor) {

    return Number(valor || 0)
        .toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

}


function normalizarData(valor) {

    if (valor === null || valor === undefined || valor === "") {
        return "";
    }

    // Data JS
    if (valor instanceof Date && !isNaN(valor.getTime())) {

        const dia = String(valor.getDate()).padStart(2, "0");
        const mes = String(valor.getMonth() + 1).padStart(2, "0");
        const ano = valor.getFullYear();

        return `${ano}-${mes}-${dia}`;

    }

    let texto = String(valor).trim();

    // dd/mm/yyyy
    let match = texto.match(
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
    );

    if (match) {

        const dia = match[1].padStart(2, "0");
        const mes = match[2].padStart(2, "0");
        const ano = match[3];

        return `${ano}-${mes}-${dia}`;

    }

    // yyyy-mm-dd
    match = texto.match(
        /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
    );

    if (match) {

        const ano = match[1];
        const mes = match[2].padStart(2, "0");
        const dia = match[3].padStart(2, "0");

        return `${ano}-${mes}-${dia}`;

    }

    return "";

}


function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function normalizarHora(valor) {

    if (valor === null || valor === undefined || valor === "") {
        return "";
    }

    if (valor instanceof Date && !isNaN(valor.getTime())) {

        const horas = String(valor.getHours()).padStart(2, "0");
        const minutos = String(valor.getMinutes()).padStart(2, "0");
        const segundos = String(valor.getSeconds()).padStart(2, "0");

        return `${horas}:${minutos}:${segundos}`;

    }

    let texto = String(valor).trim();

    const match = texto.match(
        /(\d{1,2}):(\d{2})(?::(\d{2}))?/
    );

    if (!match) {
        return "";
    }

    const horas = match[1].padStart(2, "0");
    const minutos = match[2].padStart(2, "0");
    const segundos = (match[3] || "00").padStart(2, "0");

    return `${horas}:${minutos}:${segundos}`;

}


function extrairDataHora(valor) {

    if (valor instanceof Date && !isNaN(valor.getTime())) {

        return {
            data: normalizarData(valor),
            hora: normalizarHora(valor)
        };

    }

    const texto = String(valor || "").trim();

    const data = normalizarData(texto);
    const hora = normalizarHora(texto);

    return {
        data,
        hora
    };

}


function horaParaSegundos(hora) {

    if (!hora) {
        return null;
    }

    const partes = hora.split(":");

    if (partes.length < 2) {
        return null;
    }

    const h = Number(partes[0]);
    const m = Number(partes[1]);
    const s = Number(partes[2] || 0);

    if (
        !Number.isFinite(h) ||
        !Number.isFinite(m) ||
        !Number.isFinite(s)
    ) {
        return null;
    }

    return h * 3600 + m * 60 + s;

}


function normalizarCartao(valor) {

    const texto = limparTexto(valor);

    if (!texto) {
        return "";
    }

    if (
        texto.includes("CRED") ||
        texto.includes("CREDITO")
    ) {
        return "CREDITO";
    }

    if (
        texto.includes("DEB") ||
        texto.includes("DEBITO")
    ) {
        return "DEBITO";
    }

    if (
        texto.includes("PIX")
    ) {
        return "PIX";
    }

    if (
        texto.includes("DINHEIRO")
    ) {
        return "DINHEIRO";
    }

    if (
        texto.includes("VOUCHER") ||
        texto.includes("VALE")
    ) {
        return "VOUCHER";
    }

    if (
        texto.includes("QR")
    ) {
        return "QR";

    }

    return texto;

}


function encontrarColuna(cabecalhos, nomes) {

    for (const nome of nomes) {

        const procurado = normalizarCabecalho(nome);

        const indice = cabecalhos.findIndex(
            cab => normalizarCabecalho(cab) === procurado
        );

        if (indice >= 0) {
            return indice;
        }

    }

    return -1;

}


function encontrarColunaParcial(cabecalhos, termos) {

    for (let i = 0; i < cabecalhos.length; i++) {

        const cab = normalizarCabecalho(cabecalhos[i]);

        for (const termo of termos) {

            const palavra = normalizarCabecalho(termo);

            if (cab.includes(palavra)) {
                return i;
            }

        }

    }

    return -1;

}


// ============================================================
// DETECÇÃO DE TOTAL
// ============================================================

function linhaPareceTotal(linha) {

    const texto = linha
        .map(valor => limparTexto(valor))
        .join(" ");

    return (
        texto.includes("TOTAL") ||
        texto.includes("TOTAL GERAL") ||
        texto.includes("TOTALIZADOR")
    );

}


function extrairTotalDaLinha(linha) {

    for (let i = linha.length - 1; i >= 0; i--) {

        const valor = converterValor(linha[i]);

        if (valor !== 0) {
            return valor;
        }

    }

    return 0;

}


// ============================================================
// TRANSFORMA PORTAL PREMMIA
// ============================================================

function transformarPremmia(linhas) {

    if (!linhas || !linhas.length) {
        return [];
    }

    const cabecalhos = linhas[0];

    const colunaValor = encontrarColuna(
        cabecalhos,
        [
            "Valor líquido",
            "Valor liquido"
        ]
    );

    const colunaDataHora = encontrarColuna(
        cabecalhos,
        [
            "Data/Hora da transação",
            "Data/Hora da transacao",
            "Data Hora da transação",
            "Data Hora da transacao"
        ]
    );

    const colunaCodigo = encontrarColuna(
        cabecalhos,
        [
            "Código Transação",
            "Codigo Transacao",
            "Código da Transação",
            "Codigo da Transacao"
        ]
    );

    const colunaPagamento = encontrarColuna(
        cabecalhos,
        [
            "Forma de Pagamento",
            "Forma de Pagamento"
        ]
    );

    console.log("COLUNAS PORTAL");
    console.log({
        colunaValor,
        colunaDataHora,
        colunaCodigo,
        colunaPagamento
    });

    const registros = [];

    for (let i = 1; i < linhas.length; i++) {

        const linha = linhas[i];

        if (!linha || !linha.length) {
            continue;
        }

        if (linhaPareceTotal(linha)) {
            continue;
        }

        const valor = converterValor(
            colunaValor >= 0 ? linha[colunaValor] : 0
        );

        const dataHora = extrairDataHora(
            colunaDataHora >= 0
                ? linha[colunaDataHora]
                : ""
        );

        const codigo = limparTexto(
            colunaCodigo >= 0
                ? linha[colunaCodigo]
                : ""
        );

        const pagamento = normalizarCartao(
            colunaPagamento >= 0
                ? linha[colunaPagamento]
                : ""
        );

        // Ignora linhas completamente vazias
        if (
            !valor &&
            !dataHora.data &&
            !codigo &&
            !pagamento
        ) {
            continue;
        }

        registros.push({

            origem: "PORTAL",

            linhaOriginal: i + 1,

            valor,

            data: dataHora.data,

            hora: dataHora.hora,

            codigoTransacao: codigo,

            formaPagamento: pagamento,

            usado: false

        });

    }

    return registros;

}


// ============================================================
// TRANSFORMA SISTEMA INTERNO
// ============================================================

function transformarInterno(linhas) {

    if (!linhas || !linhas.length) {
        return [];
    }

    const cabecalhos = linhas[0];

    const colunaValor = encontrarColuna(
        cabecalhos,
        [
            "Valor",
            "Valor líquido",
            "Valor liquido"
        ]
    );

    const colunaHorario = encontrarColuna(
        cabecalhos,
        [
            "Horário",
            "Horario"
        ]
    );

    const colunaMovimento = encontrarColuna(
        cabecalhos,
        [
            "Movimento"
        ]
    );

    const colunaDataFiscal = encontrarColuna(
        cabecalhos,
        [
            "Data Fiscal"
        ]
    );

    const colunaTransacao = encontrarColuna(
        cabecalhos,
        [
            "Transação",
            "Transacao"
        ]
    );

    const colunaAutorizacao = encontrarColuna(
        cabecalhos,
        [
            "Autorização",
            "Autorizacao"
        ]
    );

    const colunaNSU = encontrarColuna(
        cabecalhos,
        [
            "NSU"
        ]
    );

    const colunaTipoCartao = encontrarColuna(
        cabecalhos,
        [
            "Tipo Cartão",
            "Tipo Cartao"
        ]
    );

    const colunaTipo = encontrarColuna(
        cabecalhos,
        [
            "Tipo"
        ]
    );

    const colunaBandeira = encontrarColuna(
        cabecalhos,
        [
            "Código - Nome Bandeira",
            "Codigo - Nome Bandeira"
        ]
    );

    console.log("COLUNAS SISTEMA");
    console.log({
        colunaValor,
        colunaHorario,
        colunaMovimento,
        colunaDataFiscal,
        colunaTransacao,
        colunaAutorizacao,
        colunaNSU,
        colunaTipoCartao,
        colunaTipo,
        colunaBandeira
    });

    const registros = [];

    let totalInformado = null;

    for (let i = 1; i < linhas.length; i++) {

        const linha = linhas[i];

        if (!linha || !linha.length) {
            continue;
        }

        if (linhaPareceTotal(linha)) {

            const total = extrairTotalDaLinha(linha);

            if (total > 0) {
                totalInformado = total;
            }

            continue;
        }

        const valor = converterValor(
            colunaValor >= 0
                ? linha[colunaValor]
                : 0
        );

        const movimento = colunaMovimento >= 0
            ? linha[colunaMovimento]
            : "";

        const dataFiscal = colunaDataFiscal >= 0
            ? linha[colunaDataFiscal]
            : "";

        const horario = colunaHorario >= 0
            ? linha[colunaHorario]
            : "";

        let data = normalizarData(movimento);

        if (!data) {
            data = normalizarData(dataFiscal);
        }

        let hora = normalizarHora(horario);

        // Caso Movimento possua data + hora
        if (
            !hora &&
            movimento
        ) {

            const dh = extrairDataHora(movimento);

            if (dh.data) {
                data = dh.data;
            }

            if (dh.hora) {
                hora = dh.hora;
            }

        }

        const transacao = limparTexto(
            colunaTransacao >= 0
                ? linha[colunaTransacao]
                : ""
        );

        const autorizacao = limparTexto(
            colunaAutorizacao >= 0
                ? linha[colunaAutorizacao]
                : ""
        );

        const nsu = limparTexto(
            colunaNSU >= 0
                ? linha[colunaNSU]
                : ""
        );

        let tipoCartao = normalizarCartao(
            colunaTipoCartao >= 0
                ? linha[colunaTipoCartao]
                : ""
        );

        if (!tipoCartao && colunaTipo >= 0) {

            tipoCartao = normalizarCartao(
                linha[colunaTipo]
            );

        }

        const bandeira = limparTexto(
            colunaBandeira >= 0
                ? linha[colunaBandeira]
                : ""
        );

        if (
            !valor &&
            !data &&
            !hora &&
            !transacao &&
            !autorizacao &&
            !nsu
        ) {
            continue;
        }

        registros.push({

            origem: "SISTEMA",

            linhaOriginal: i + 1,

            valor,

            data,

            hora,

            codigoTransacao: transacao,

            autorizacao,

            nsu,

            tipoCartao,

            bandeira,

            usado: false

        });

    }

    return {
        registros,
        totalInformado
    };

}


// ============================================================
// LEITURA DO ARQUIVO
// ============================================================

function lerArquivoExcel(arquivo, tipo) {

    return new Promise((resolve, reject) => {

        if (!arquivo) {
            reject("Arquivo não informado.");
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (evento) {

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

                let linhas = [];

                // Procura a primeira aba que tenha conteúdo
                for (
                    let i = 0;
                    i < workbook.SheetNames.length;
                    i++
                ) {

                    const nomeAba =
                        workbook.SheetNames[i];

                    const planilha =
                        workbook.Sheets[nomeAba];

                    const dadosAba =
                        XLSX.utils.sheet_to_json(
                            planilha,
                            {
                                header: 1,
                                defval: "",
                                raw: true
                            }
                        );

                    if (
                        dadosAba &&
                        dadosAba.length
                    ) {

                        linhas = dadosAba;

                        break;

                    }

                }

                if (!linhas.length) {
                    reject("A planilha está vazia.");
                    return;
                }

                if (tipo === "premmia") {

                    const registros =
                        transformarPremmia(linhas);

                    window.dadosPremmia =
                        registros;

                    window.resumoPremmia = {

                        quantidade:
                            registros.length,

                        total:
                            registros.reduce(
                                (soma, registro) =>
                                    soma + registro.valor,
                                0
                            )

                    };

                    console.log(
                        "Premmia carregado:",
                        window.dadosPremmia
                    );

                    resolve(
                        window.dadosPremmia
                    );

                }
                else if (tipo === "interno") {

                    const resultado =
                        transformarInterno(linhas);

                    window.dadosInterno =
                        resultado.registros;

                    window.resumoInterno = {

                        quantidade:
                            resultado.registros.length,

                        totalCalculado:
                            resultado.registros.reduce(
                                (soma, registro) =>
                                    soma + registro.valor,
                                0
                            ),

                        totalInformado:
                            resultado.totalInformado

                    };

                    console.log(
                        "Sistema carregado:",
                        window.dadosInterno
                    );

                    console.log(
                        "Resumo Sistema:",
                        window.resumoInterno
                    );

                    resolve(
                        window.dadosInterno
                    );

                }
                else {

                    reject(
                        "Tipo de arquivo desconhecido."
                    );

                }

            }
            catch (erro) {

                console.error(
                    "Erro ao processar Excel:",
                    erro
                );

                reject(
                    "Erro ao processar a planilha."
                );

            }

        };

        leitor.onerror = function () {

            reject(
                "Não foi possível ler o arquivo."
            );

        };

        leitor.readAsArrayBuffer(arquivo);

    });

}


// ============================================================
// EXPORTAÇÃO GLOBAL
// ============================================================

window.lerArquivoExcel =
    lerArquivoExcel;

window.transformarPremmia =
    transformarPremmia;

window.transformarInterno =
    transformarInterno;

window.normalizarCartao =
    normalizarCartao;

window.normalizarData =
    normalizarData;

window.normalizarHora =
    normalizarHora;

window.horaParaSegundos =
    horaParaSegundos;

window.converterValor =
    converterValor;

window.formatarValor =
    formatarValor;

window.formatarData =
    formatarData;

console.log("================================");
console.log("leituraExcel.js carregado");
console.log("================================");
