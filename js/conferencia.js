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
// LIMPA TEXTO
// ============================================================

function limparTexto(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();

}


// ============================================================
// NORMALIZA CABEÇALHO
// ============================================================

function normalizarCabecalho(valor) {

    return limparTexto(valor)
        .replace(/[^A-Z0-9]/g, "");

}


// ============================================================
// CONVERTE VALOR
// ============================================================

function converterValor(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return 0;
    }

    if (typeof valor === "number") {

        return Number(
            valor.toFixed(2)
        );

    }

    let texto = String(valor)
        .trim()
        .replace(/\s/g, "")
        .replace(/R\$/gi, "");

    if (
        texto.includes(",") &&
        texto.includes(".")
    ) {

        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");

    }
    else if (
        texto.includes(",")
    ) {

        texto = texto.replace(",", ".");

    }

    texto = texto.replace(
        /[^\d.-]/g,
        ""
    );

    const numero = Number(texto);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    return Number(
        numero.toFixed(2)
    );

}


// ============================================================
// FORMATA VALOR
// ============================================================

function formatarValor(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ============================================================
// NORMALIZA DATA
// ============================================================

function normalizarData(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "";
    }

    if (
        valor instanceof Date &&
        !isNaN(valor.getTime())
    ) {

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

        return `${ano}-${mes}-${dia}`;

    }

    let texto =
        String(valor).trim();


    // dd/mm/yyyy
    let match =
        texto.match(
            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
        );


    if (match) {

        const dia =
            match[1].padStart(2, "0");

        const mes =
            match[2].padStart(2, "0");

        const ano =
            match[3];

        return `${ano}-${mes}-${dia}`;

    }


    // yyyy-mm-dd
    match =
        texto.match(
            /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
        );


    if (match) {

        const ano =
            match[1];

        const mes =
            match[2].padStart(2, "0");

        const dia =
            match[3].padStart(2, "0");

        return `${ano}-${mes}-${dia}`;

    }


    return "";

}


// ============================================================
// FORMATA DATA
// ============================================================

function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ============================================================
// NORMALIZA HORA
// ============================================================

function normalizarHora(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "";
    }


    if (
        valor instanceof Date &&
        !isNaN(valor.getTime())
    ) {

        const horas =
            String(
                valor.getHours()
            ).padStart(2, "0");

        const minutos =
            String(
                valor.getMinutes()
            ).padStart(2, "0");

        const segundos =
            String(
                valor.getSeconds()
            ).padStart(2, "0");

        return `${horas}:${minutos}:${segundos}`;

    }


    let texto =
        String(valor).trim();


    const match =
        texto.match(
            /(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (!match) {
        return "";
    }


    const horas =
        match[1].padStart(2, "0");

    const minutos =
        match[2].padStart(2, "0");

    const segundos =
        (match[3] || "00")
            .padStart(2, "0");


    return `${horas}:${minutos}:${segundos}`;

}


// ============================================================
// EXTRAI DATA + HORA
// ============================================================

function extrairDataHora(valor) {

    if (
        valor instanceof Date &&
        !isNaN(valor.getTime())
    ) {

        return {

            data:
                normalizarData(valor),

            hora:
                normalizarHora(valor)

        };

    }


    const texto =
        String(valor || "").trim();


    return {

        data:
            normalizarData(texto),

        hora:
            normalizarHora(texto)

    };

}


// ============================================================
// HORA EM SEGUNDOS
// ============================================================

function horaParaSegundos(hora) {

    if (!hora) {
        return null;
    }

    const partes =
        hora.split(":");

    if (partes.length < 2) {
        return null;
    }


    const h =
        Number(partes[0]);

    const m =
        Number(partes[1]);

    const s =
        Number(partes[2] || 0);


    if (
        !Number.isFinite(h) ||
        !Number.isFinite(m) ||
        !Number.isFinite(s)
    ) {
        return null;
    }


    return (
        h * 3600 +
        m * 60 +
        s
    );

}


// ============================================================
// NORMALIZA CARTÃO
// ============================================================

function normalizarCartao(valor) {

    const texto =
        limparTexto(valor);


    if (!texto) {
        return "";
    }


    if (
        texto.includes("CRED")
    ) {
        return "CREDITO";
    }


    if (
        texto.includes("DEB")
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


    if (
        texto.includes("DESCONTO")
    ) {
        return "DESCONTO";
    }


    return texto;

}


// ============================================================
// ENCONTRA COLUNA EXATA
// ============================================================

function encontrarColuna(
    cabecalhos,
    nomes
) {

    for (
        const nome of nomes
    ) {

        const procurado =
            normalizarCabecalho(nome);


        const indice =
            cabecalhos.findIndex(
                cab =>
                    normalizarCabecalho(
                        cab
                    ) === procurado
            );


        if (indice >= 0) {
            return indice;
        }

    }


    return -1;

}


// ============================================================
// ENCONTRA COLUNA PARCIAL
// ============================================================

function encontrarColunaParcial(
    cabecalhos,
    termos
) {

    for (
        let i = 0;
        i < cabecalhos.length;
        i++
    ) {

        const cab =
            normalizarCabecalho(
                cabecalhos[i]
            );


        for (
            const termo of termos
        ) {

            const palavra =
                normalizarCabecalho(
                    termo
                );


            if (
                cab.includes(palavra)
            ) {

                return i;

            }

        }

    }


    return -1;

}


// ============================================================
// DETECTA SE UMA LINHA É TOTAL
// ============================================================

function linhaEhTotal(
    linha
) {

    if (
        !Array.isArray(linha) ||
        !linha.length
    ) {
        return false;
    }


    const textos =
        linha.map(
            valor =>
                limparTexto(valor)
        );


    const textoCompleto =
        textos.join(" ");


    // Palavras claramente indicativas
    if (
        textoCompleto.includes("TOTAL GERAL") ||
        textoCompleto.includes("TOTAL") ||
        textoCompleto.includes("VALOR TOTAL") ||
        textoCompleto.includes("TOTAL LIQUIDO") ||
        textoCompleto.includes("TOTAL LIQUIDA")
    ) {

        return true;

    }


    return false;

}


// ============================================================
// DETECTA LINHA FINAL DE RESUMO DO SISTEMA
// ============================================================
//
// Algumas planilhas possuem uma linha final sem a palavra
// "TOTAL", mas com somente um valor preenchido.
// Para não correr o risco de transformar essa linha em venda,
// ela só será considerada total quando:
// - estiver depois dos lançamentos;
// - não possuir data;
// - não possuir horário;
// - não possuir transação/autorização/NSU;
// - possuir valor;
// - e estiver entre as últimas linhas da planilha.
//

function linhaPodeSerTotalSistema(
    linha,
    indices,
    numeroLinha,
    totalLinhas
) {

    if (
        !Array.isArray(linha) ||
        !linha.length
    ) {
        return false;
    }


    // Se já possui texto TOTAL,
    // é definitivamente uma linha de resumo.
    if (
        linhaEhTotal(linha)
    ) {

        return true;

    }


    // Só analisamos as últimas 5 linhas.
    if (
        numeroLinha <
        totalLinhas - 5
    ) {

        return false;

    }


    const valor =
        converterValor(
            indices.valor >= 0
                ? linha[indices.valor]
                : 0
        );


    if (!valor) {
        return false;
    }


    const movimento =
        indices.movimento >= 0
            ? linha[indices.movimento]
            : "";


    const dataFiscal =
        indices.dataFiscal >= 0
            ? linha[indices.dataFiscal]
            : "";


    const horario =
        indices.horario >= 0
            ? linha[indices.horario]
            : "";


    const transacao =
        indices.transacao >= 0
            ? linha[indices.transacao]
            : "";


    const autorizacao =
        indices.autorizacao >= 0
            ? linha[indices.autorizacao]
            : "";


    const nsu =
        indices.nsu >= 0
            ? linha[indices.nsu]
            : "";


    const temData =
        !!normalizarData(
            movimento
        ) ||
        !!normalizarData(
            dataFiscal
        );


    const temHora =
        !!normalizarHora(
            horario
        );


    const temIdentificador =
        !!limparTexto(
            transacao
        ) ||
        !!limparTexto(
            autorizacao
        ) ||
        !!limparTexto(
            nsu
        );


    // Linha sem características de lançamento
    // e localizada no final da planilha.
    if (
        !temData &&
        !temHora &&
        !temIdentificador
    ) {

        return true;

    }


    return false;

}


// ============================================================
// EXTRAI VALOR DO TOTAL
// ============================================================

function extrairValorTotal(
    linha,
    indiceValor
) {

    if (
        indiceValor >= 0
    ) {

        const valor =
            converterValor(
                linha[indiceValor]
            );


        if (valor > 0) {
            return valor;
        }

    }


    // Procura o último número válido
    // da linha.
    for (
        let i = linha.length - 1;
        i >= 0;
        i--
    ) {

        const valor =
            converterValor(
                linha[i]
            );


        if (valor > 0) {
            return valor;
        }

    }


    return 0;

}


// ============================================================
// TRANSFORMA PORTAL
// ============================================================

function transformarPremmia(
    linhas
) {

    if (
        !linhas ||
        !linhas.length
    ) {
        return [];
    }


    const cabecalhos =
        linhas[0];


    const colunaValor =
        encontrarColuna(
            cabecalhos,
            [
                "Valor líquido",
                "Valor liquido"
            ]
        );


    const colunaDataHora =
        encontrarColuna(
            cabecalhos,
            [
                "Data/Hora da transação",
                "Data/Hora da transacao",
                "Data Hora da transação",
                "Data Hora da transacao"
            ]
        );


    const colunaCodigo =
        encontrarColuna(
            cabecalhos,
            [
                "Código Transação",
                "Codigo Transacao",
                "Código da Transação",
                "Codigo da Transacao"
            ]
        );


    const colunaPagamento =
        encontrarColuna(
            cabecalhos,
            [
                "Forma de Pagamento"
            ]
        );


    console.log(
        "COLUNAS PORTAL"
    );

    console.log({

        colunaValor,

        colunaDataHora,

        colunaCodigo,

        colunaPagamento

    });


    const registros = [];


    for (
        let i = 1;
        i < linhas.length;
        i++
    ) {

        const linha =
            linhas[i];


        if (
            !linha ||
            !linha.length
        ) {
            continue;
        }


        if (
            linhaEhTotal(linha)
        ) {
            continue;
        }


        const valor =
            converterValor(
                colunaValor >= 0
                    ? linha[colunaValor]
                    : 0
            );


        const dataHora =
            extrairDataHora(
                colunaDataHora >= 0
                    ? linha[colunaDataHora]
                    : ""
            );


        const codigo =
            limparTexto(
                colunaCodigo >= 0
                    ? linha[colunaCodigo]
                    : ""
            );


        const pagamento =
            normalizarCartao(
                colunaPagamento >= 0
                    ? linha[colunaPagamento]
                    : ""
            );


        if (
            !valor &&
            !dataHora.data &&
            !codigo &&
            !pagamento
        ) {
            continue;
        }


        registros.push({

            origem:
                "PORTAL",

            linhaOriginal:
                i + 1,

            valor,

            data:
                dataHora.data,

            hora:
                dataHora.hora,

            codigoTransacao:
                codigo,

            formaPagamento:
                pagamento,

            usado:
                false

        });

    }


    return registros;

}


// ============================================================
// TRANSFORMA SISTEMA
// ============================================================

function transformarInterno(
    linhas
) {

    if (
        !linhas ||
        !linhas.length
    ) {

        return {

            registros: [],

            totalInformado: null

        };

    }


    const cabecalhos =
        linhas[0];


    const indices = {

        valor:
            encontrarColuna(
                cabecalhos,
                [
                    "Valor",
                    "Valor líquido",
                    "Valor liquido"
                ]
            ),

        horario:
            encontrarColuna(
                cabecalhos,
                [
                    "Horário",
                    "Horario"
                ]
            ),

        movimento:
            encontrarColuna(
                cabecalhos,
                [
                    "Movimento"
                ]
            ),

        dataFiscal:
            encontrarColuna(
                cabecalhos,
                [
                    "Data Fiscal"
                ]
            ),

        transacao:
            encontrarColuna(
                cabecalhos,
                [
                    "Transação",
                    "Transacao"
                ]
            ),

        autorizacao:
            encontrarColuna(
                cabecalhos,
                [
                    "Autorização",
                    "Autorizacao"
                ]
            ),

        nsu:
            encontrarColuna(
                cabecalhos,
                [
                    "NSU"
                ]
            ),

        tipoCartao:
            encontrarColuna(
                cabecalhos,
                [
                    "Tipo Cartão",
                    "Tipo Cartao"
                ]
            ),

        tipo:
            encontrarColuna(
                cabecalhos,
                [
                    "Tipo"
                ]
            ),

        bandeira:
            encontrarColuna(
                cabecalhos,
                [
                    "Código - Nome Bandeira",
                    "Codigo - Nome Bandeira"
                ]
            )

    };


    console.log(
        "COLUNAS SISTEMA"
    );

    console.log(
        indices
    );


    const registros = [];

    let totalInformado = null;


    // ========================================================
    // PRIMEIRA PASSAGEM
    // Procura a linha de total
    // ========================================================

    for (
        let i = 1;
        i < linhas.length;
        i++
    ) {

        const linha =
            linhas[i];


        if (
            !linha ||
            !linha.length
        ) {
            continue;
        }


        const ehTotal =
            linhaPodeSerTotalSistema(
                linha,
                indices,
                i,
                linhas.length
            );


        if (!ehTotal) {
            continue;
        }


        const valorTotal =
            extrairValorTotal(
                linha,
                indices.valor
            );


        if (
            valorTotal > 0
        ) {

            totalInformado =
                valorTotal;

            console.log(
                "TOTAL DO SISTEMA IDENTIFICADO:",
                totalInformado,
                "linha:",
                i + 1
            );

        }

    }


    // ========================================================
    // SEGUNDA PASSAGEM
    // Lê somente lançamentos reais
    // ========================================================

    for (
        let i = 1;
        i < linhas.length;
        i++
    ) {

        const linha =
            linhas[i];


        if (
            !linha ||
            !linha.length
        ) {
            continue;
        }


        // IMPORTANTE:
        // Se for linha de total, NÃO entra
        // nos dados da conciliação.
        if (
            linhaPodeSerTotalSistema(
                linha,
                indices,
                i,
                linhas.length
            )
        ) {

            continue;

        }


        const valor =
            converterValor(
                indices.valor >= 0
                    ? linha[indices.valor]
                    : 0
            );


        const movimento =
            indices.movimento >= 0
                ? linha[indices.movimento]
                : "";


        const dataFiscal =
            indices.dataFiscal >= 0
                ? linha[indices.dataFiscal]
                : "";


        const horario =
            indices.horario >= 0
                ? linha[indices.horario]
                : "";


        let data =
            normalizarData(
                movimento
            );


        if (!data) {

            data =
                normalizarData(
                    dataFiscal
                );

        }


        let hora =
            normalizarHora(
                horario
            );


        // Se Movimento possui data + hora
        if (
            movimento &&
            (
                !data ||
                !hora
            )
        ) {

            const dataHora =
                extrairDataHora(
                    movimento
                );


            if (
                !data &&
                dataHora.data
            ) {

                data =
                    dataHora.data;

            }


            if (
                !hora &&
                dataHora.hora
            ) {

                hora =
                    dataHora.hora;

            }

        }


        const transacao =
            limparTexto(
                indices.transacao >= 0
                    ? linha[indices.transacao]
                    : ""
            );


        const autorizacao =
            limparTexto(
                indices.autorizacao >= 0
                    ? linha[indices.autorizacao]
                    : ""
            );


        const nsu =
            limparTexto(
                indices.nsu >= 0
                    ? linha[indices.nsu]
                    : ""
            );


        let tipoCartao =
            normalizarCartao(
                indices.tipoCartao >= 0
                    ? linha[indices.tipoCartao]
                    : ""
            );


        if (
            !tipoCartao &&
            indices.tipo >= 0
        ) {

            tipoCartao =
                normalizarCartao(
                    linha[indices.tipo]
                );

        }


        const bandeira =
            limparTexto(
                indices.bandeira >= 0
                    ? linha[indices.bandeira]
                    : ""
            );


        // Linha completamente vazia
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

            origem:
                "SISTEMA",

            linhaOriginal:
                i + 1,

            valor,

            data,

            hora,

            codigoTransacao:
                transacao,

            autorizacao,

            nsu,

            tipoCartao,

            bandeira,

            usado:
                false

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

function lerArquivoExcel(
    arquivo,
    tipo
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (!arquivo) {

                reject(
                    "Arquivo não informado."
                );

                return;

            }


            const leitor =
                new FileReader();


            leitor.onload =
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
                                    type:
                                        "array",

                                    cellDates:
                                        true
                                }
                            );


                        let linhas = [];


                        // Procura a primeira aba com conteúdo
                        for (
                            let i = 0;
                            i <
                            workbook.SheetNames.length;
                            i++
                        ) {

                            const nomeAba =
                                workbook.SheetNames[i];


                            const planilha =
                                workbook.Sheets[
                                    nomeAba
                                ];


                            const dadosAba =
                                XLSX.utils.sheet_to_json(
                                    planilha,
                                    {
                                        header:
                                            1,

                                        defval:
                                            "",

                                        raw:
                                            true
                                    }
                                );


                            if (
                                dadosAba &&
                                dadosAba.length
                            ) {

                                linhas =
                                    dadosAba;

                                break;

                            }

                        }


                        if (
                            !linhas.length
                        ) {

                            reject(
                                "A planilha está vazia."
                            );

                            return;

                        }


                        // ====================================================
                        // PORTAL
                        // ====================================================

                        if (
                            tipo === "premmia"
                        ) {

                            const registros =
                                transformarPremmia(
                                    linhas
                                );


                            window.dadosPremmia =
                                registros;


                            window.resumoPremmia = {

                                quantidade:
                                    registros.length,

                                total:
                                    registros.reduce(
                                        (
                                            soma,
                                            registro
                                        ) =>
                                            soma +
                                            registro.valor,

                                        0
                                    )

                            };


                            console.log(
                                "Premmia carregado:",
                                registros.length,
                                "lançamentos"
                            );


                            console.log(
                                "Total Portal:",
                                window.resumoPremmia.total
                            );


                            resolve(
                                registros
                            );


                            return;

                        }


                        // ====================================================
                        // SISTEMA
                        // ====================================================

                        if (
                            tipo === "interno"
                        ) {

                            const resultado =
                                transformarInterno(
                                    linhas
                                );


                            window.dadosInterno =
                                resultado.registros;


                            window.resumoInterno = {

                                quantidade:
                                    resultado.registros.length,

                                totalCalculado:
                                    resultado.registros.reduce(
                                        (
                                            soma,
                                            registro
                                        ) =>
                                            soma +
                                            registro.valor,

                                        0
                                    ),

                                totalInformado:
                                    resultado.totalInformado

                            };


                            console.log(
                                "Sistema carregado:",
                                resultado.registros.length,
                                "lançamentos"
                            );


                            console.log(
                                "Total calculado:",
                                window.resumoInterno
                                    .totalCalculado
                            );


                            console.log(
                                "Total informado:",
                                window.resumoInterno
                                    .totalInformado
                            );


                            // =================================================
                            // ALERTA DE CONFERÊNCIA DO PRÓPRIO ARQUIVO
                            // =================================================

                            if (
                                resultado.totalInformado !==
                                null
                            ) {

                                const diferenca =
                                    Number(
                                        (
                                            resultado.totalCalculado -
                                            resultado.totalInformado
                                        ).toFixed(2)
                                    );


                                if (
                                    Math.abs(diferenca) >
                                    0.01
                                ) {

                                    console.warn(
                                        "ATENÇÃO: total informado pelo Sistema",
                                        resultado.totalInformado,
                                        "é diferente do total calculado",
                                        resultado.totalCalculado,
                                        "Diferença:",
                                        diferenca
                                    );

                                }
                                else {

                                    console.log(
                                        "OK: total do Sistema confere com os lançamentos."
                                    );

                                }

                            }


                            resolve(
                                resultado.registros
                            );


                            return;

                        }


                        reject(
                            "Tipo de arquivo desconhecido."
                        );

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


            leitor.onerror =
                function () {

                    reject(
                        "Não foi possível ler o arquivo."
                    );

                };


            leitor.readAsArrayBuffer(
                arquivo
            );

        }
    );

}


// ============================================================
// EXPORTAÇÕES GLOBAIS
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
