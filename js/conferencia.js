// ============================================================
// CONFERÊNCIA PREMMIA
// conferencia.js
// ============================================================

console.log("================================");
console.log("conferencia.js iniciado");
console.log("================================");


// ============================================================
// CONFIGURAÇÕES
// ============================================================

const TOLERANCIA_HORARIO_MINUTOS = 10;
const TOLERANCIA_VALOR = 0.01;


// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================

window.resultadosConferencia = [];

window.resumoConferencia = {};

window.filtrosConferencia = {
    valor: [],
    data: [],
    codigoTransacao: [],
    formaPagamento: [],
    horario: []
};


// ============================================================
// NORMALIZAR TEXTO
// ============================================================

function normalizarTexto(valor) {

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
// NORMALIZAR VALOR
// ============================================================

function normalizarValor(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return 0;
    }

    if (
        typeof valor === "number"
    ) {
        return Number(
            valor.toFixed(2)
        );
    }

    let texto =
        String(valor)
            .trim()
            .replace(/\s/g, "")
            .replace(/R\$/gi, "");

    // Formato brasileiro
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
        !Number.isFinite(numero)
    ) {
        return 0;
    }

    return Number(
        numero.toFixed(2)
    );

}


// ============================================================
// ARREDONDAR
// ============================================================

function arredondar(valor) {

    return Number(
        Number(valor || 0)
            .toFixed(2)
    );

}


// ============================================================
// COMPARAR VALORES
// ============================================================

function valoresIguais(
    valor1,
    valor2
) {

    return (
        Math.abs(
            normalizarValor(valor1) -
            normalizarValor(valor2)
        ) < TOLERANCIA_VALOR
    );

}


// ============================================================
// NORMALIZAR DATA
// ============================================================

function normalizarDataConferencia(
    valor
) {

    if (
        !valor
    ) {
        return "";
    }


    // Date
    if (
        valor instanceof Date &&
        !isNaN(valor.getTime())
    ) {

        return (
            `${valor.getFullYear()}-${String(
                valor.getMonth() + 1
            ).padStart(2, "0")}-${String(
                valor.getDate()
            ).padStart(2, "0")}`
        );

    }


    const texto =
        String(valor)
            .trim();


    // yyyy-mm-dd
    let match =
        texto.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );


    if (
        match
    ) {

        return (
            `${match[1]}-${String(
                match[2]
            ).padStart(2, "0")}-${String(
                match[3]
            ).padStart(2, "0")}`
        );

    }


    // dd/mm/yyyy
    match =
        texto.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
        );


    if (
        match
    ) {

        return (
            `${match[3]}-${String(
                match[2]
            ).padStart(2, "0")}-${String(
                match[1]
            ).padStart(2, "0")}`
        );

    }


    // dd-mm-yyyy
    match =
        texto.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})/
        );


    if (
        match
    ) {

        return (
            `${match[3]}-${String(
                match[2]
            ).padStart(2, "0")}-${String(
                match[1]
            ).padStart(2, "0")}`
        );

    }


    return texto;

}


// ============================================================
// NORMALIZAR HORA
// ============================================================

function normalizarHoraConferencia(
    valor
) {

    if (
        !valor
    ) {
        return "";
    }


    // Date
    if (
        valor instanceof Date &&
        !isNaN(valor.getTime())
    ) {

        return (
            `${String(
                valor.getHours()
            ).padStart(2, "0")}:${String(
                valor.getMinutes()
            ).padStart(2, "0")}:${String(
                valor.getSeconds()
            ).padStart(2, "0")}`
        );

    }


    const texto =
        String(valor)
            .trim();


    const match =
        texto.match(
            /(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (
        !match
    ) {
        return "";
    }


    return (
        `${String(
            match[1]
        ).padStart(2, "0")}:${match[2]}:${String(
            match[3] || "00"
        ).padStart(2, "0")}`
    );

}


// ============================================================
// HORA → SEGUNDOS
// ============================================================

function horaParaSegundosConferencia(
    hora
) {

    const normalizada =
        normalizarHoraConferencia(
            hora
        );


    if (
        !normalizada
    ) {
        return null;
    }


    const partes =
        normalizada.split(":");


    const horas =
        Number(partes[0]);

    const minutos =
        Number(partes[1]);

    const segundos =
        Number(partes[2]);


    if (
        !Number.isFinite(horas) ||
        !Number.isFinite(minutos) ||
        !Number.isFinite(segundos)
    ) {
        return null;
    }


    return (
        horas * 3600 +
        minutos * 60 +
        segundos
    );

}


// ============================================================
// DIFERENÇA DE HORÁRIO
// ============================================================

function diferencaHorarioSegundos(
    hora1,
    hora2
) {

    const segundos1 =
        horaParaSegundosConferencia(
            hora1
        );


    const segundos2 =
        horaParaSegundosConferencia(
            hora2
        );


    if (
        segundos1 === null ||
        segundos2 === null
    ) {
        return null;
    }


    let diferenca =
        Math.abs(
            segundos1 -
            segundos2
        );


    // Trata virada da meia-noite
    if (
        diferenca > 43200
    ) {

        diferenca =
            86400 -
            diferenca;

    }


    return diferenca;

}


// ============================================================
// HORÁRIOS COMPATÍVEIS
// ============================================================

function horariosCompativeis(
    hora1,
    hora2,
    toleranciaMinutos =
        TOLERANCIA_HORARIO_MINUTOS
) {

    const diferenca =
        diferencaHorarioSegundos(
            hora1,
            hora2
        );


    // Se uma das planilhas não possui horário,
    // não impede a correspondência.
    if (
        diferenca === null
    ) {
        return true;
    }


    return (
        diferenca <=
        toleranciaMinutos * 60
    );

}


// ============================================================
// NORMALIZAR CARTÃO / FORMA DE PAGAMENTO
// ============================================================

function normalizarCartaoConferencia(
    valor
) {

    const texto =
        normalizarTexto(
            valor
        );


    if (
        !texto
    ) {
        return "";
    }


    // PIX
    if (
        texto.includes("PIX")
    ) {
        return "PIX";
    }


    // CRÉDITO
    if (
        texto.includes("CRED")
    ) {
        return "CREDITO";
    }


    // DÉBITO
    if (
        texto.includes("DEB")
    ) {
        return "DEBITO";
    }


    // DINHEIRO
    if (
        texto.includes("DINHEIRO")
    ) {
        return "DINHEIRO";
    }


    // VOUCHER
    if (
        texto.includes("VOUCHER") ||
        texto.includes("VALE")
    ) {
        return "VOUCHER";
    }


    // DESCONTO
    if (
        texto.includes("DESCONTO")
    ) {
        return "DESCONTO";
    }


    // QR CODE
    if (
        texto.includes("QR")
    ) {
        return "QR";
    }


    return texto;

}


// ============================================================
// OBTER CARTÃO
// ============================================================

function obterCartao(
    registro
) {

    if (
        !registro
    ) {
        return "";
    }


    return normalizarCartaoConferencia(

        registro.tipoCartao ||

        registro.formaPagamento ||

        registro.tipo ||

        registro.bandeira ||

        ""

    );

}


// ============================================================
// CHAVE PRINCIPAL
// DATA + VALOR + CARTÃO
// ============================================================

function criarChavePrincipal(
    registro
) {

    if (
        !registro
    ) {
        return "";
    }


    const data =
        normalizarDataConferencia(
            registro.data
        );


    const valor =
        normalizarValor(
            registro.valor
        );


    const cartao =
        obterCartao(
            registro
        );


    if (
        !data ||
        !cartao
    ) {
        return "";
    }


    return (
        `${data}|${valor.toFixed(2)}|${cartao}`
    );

}


// ============================================================
// CHAVE DATA + VALOR
// ============================================================

function criarChaveDataValor(
    registro
) {

    if (
        !registro
    ) {
        return "";
    }


    const data =
        normalizarDataConferencia(
            registro.data
        );


    const valor =
        normalizarValor(
            registro.valor
        );


    if (
        !data
    ) {
        return "";
    }


    return (
        `${data}|${valor.toFixed(2)}`
    );

}


// ============================================================
// CHAVE DATA + CARTÃO
// ============================================================

function criarChaveDataCartao(
    registro
) {

    if (
        !registro
    ) {
        return "";
    }


    const data =
        normalizarDataConferencia(
            registro.data
        );


    const cartao =
        obterCartao(
            registro
        );


    if (
        !data ||
        !cartao
    ) {
        return "";
    }


    return (
        `${data}|${cartao}`
    );

}


// ============================================================
// CHAVE VALOR + CARTÃO
// ============================================================

function criarChaveValorCartao(
    registro
) {

    if (
        !registro
    ) {
        return "";
    }


    const valor =
        normalizarValor(
            registro.valor
        );


    const cartao =
        obterCartao(
            registro
        );


    if (
        !cartao
    ) {
        return "";
    }


    return (
        `${valor.toFixed(2)}|${cartao}`
    );

}


// ============================================================
// CRIAR ÍNDICE
// ============================================================

function criarIndice(
    registros,
    funcaoChave
) {

    const indice =
        new Map();


    registros.forEach(
        (
            registro,
            index
        ) => {

            const chave =
                funcaoChave(
                    registro
                );


            if (
                !chave
            ) {
                return;
            }


            if (
                !indice.has(chave)
            ) {

                indice.set(
                    chave,
                    []
                );

            }


            indice
                .get(chave)
                .push(index);

        }
    );


    return indice;

}


// ============================================================
// ENCONTRAR CORRESPONDÊNCIA PRINCIPAL
// ============================================================

function encontrarCorrespondenciaPrincipal(
    portal,
    internos,
    indices,
    internosUtilizados,
    toleranciaMinutos =
        TOLERANCIA_HORARIO_MINUTOS
) {

    const chave =
        criarChavePrincipal(
            portal
        );


    if (
        !chave
    ) {
        return null;
    }


    const candidatos =
        indices.principal.get(
            chave
        ) || [];


    let melhor =
        null;


    let menorDiferenca =
        Infinity;


    candidatos.forEach(
        index => {

            if (
                internosUtilizados.has(
                    index
                )
            ) {
                return;
            }


            const interno =
                internos[index];


            if (
                !interno
            ) {
                return;
            }


            if (
                !horariosCompativeis(
                    portal.hora,
                    interno.hora,
                    toleranciaMinutos
                )
            ) {
                return;
            }


            const diferenca =
                diferencaHorarioSegundos(
                    portal.hora,
                    interno.hora
                );


            const distancia =
                diferenca === null
                    ? 0
                    : diferenca;


            if (
                distancia <
                menorDiferenca
            ) {

                menorDiferenca =
                    distancia;

                melhor = {
                    index: index,
                    registro: interno
                };

            }

        }
    );


    return melhor;

}


// ============================================================
// DATA + VALOR
// DETECTA CARTÃO DIVERGENTE
// ============================================================

function encontrarPorDataValor(
    portal,
    internos,
    indices,
    internosUtilizados,
    toleranciaMinutos =
        TOLERANCIA_HORARIO_MINUTOS
) {

    const chave =
        criarChaveDataValor(
            portal
        );


    const candidatos =
        indices.dataValor.get(
            chave
        ) || [];


    let melhor =
        null;


    let menorDiferenca =
        Infinity;


    candidatos.forEach(
        index => {

            if (
                internosUtilizados.has(
                    index
                )
            ) {
                return;
            }


            const interno =
                internos[index];


            if (
                !interno
            ) {
                return;
            }


            if (
                !horariosCompativeis(
                    portal.hora,
                    interno.hora,
                    toleranciaMinutos
                )
            ) {
                return;
            }


            const diferenca =
                diferencaHorarioSegundos(
                    portal.hora,
                    interno.hora
                );


            const distancia =
                diferenca === null
                    ? 0
                    : diferenca;


            if (
                distancia <
                menorDiferenca
            ) {

                menorDiferenca =
                    distancia;

                melhor = {
                    index: index,
                    registro: interno
                };

            }

        }
    );


    return melhor;

}


// ============================================================
// DATA + CARTÃO
// DETECTA VALOR DIVERGENTE
// ============================================================

function encontrarPorDataCartao(
    portal,
    internos,
    indices,
    internosUtilizados,
    toleranciaMinutos =
        TOLERANCIA_HORARIO_MINUTOS
) {

    const chave =
        criarChaveDataCartao(
            portal
        );


    const candidatos =
        indices.dataCartao.get(
            chave
        ) || [];


    let melhor =
        null;


    let menorDiferenca =
        Infinity;


    candidatos.forEach(
        index => {

            if (
                internosUtilizados.has(
                    index
                )
            ) {
                return;
            }


            const interno =
                internos[index];


            if (
                !interno
            ) {
                return;
            }


            if (
                !horariosCompativeis(
                    portal.hora,
                    interno.hora,
                    toleranciaMinutos
                )
            ) {
                return;
            }


            const diferenca =
                diferencaHorarioSegundos(
                    portal.hora,
                    interno.hora
                );


            const distancia =
                diferenca === null
                    ? 0
                    : diferenca;


            if (
                distancia <
                menorDiferenca
            ) {

                menorDiferenca =
                    distancia;

                melhor = {
                    index: index,
                    registro: interno
                };

            }

        }
    );


    return melhor;

}


// ============================================================
// VALOR + CARTÃO
// DETECTA DATA DIVERGENTE
// ============================================================

function encontrarPorValorCartao(
    portal,
    internos,
    indices,
    internosUtilizados
) {

    const chave =
        criarChaveValorCartao(
            portal
        );


    const candidatos =
        indices.valorCartao.get(
            chave
        ) || [];


    let melhor =
        null;


    let menorDistancia =
        Infinity;


    candidatos.forEach(
        index => {

            if (
                internosUtilizados.has(
                    index
                )
            ) {
                return;
            }


            const interno =
                internos[index];


            if (
                !interno
            ) {
                return;
            }


            const dataPortal =
                normalizarDataConferencia(
                    portal.data
                );


            const dataInterno =
                normalizarDataConferencia(
                    interno.data
                );


            if (
                !dataPortal ||
                !dataInterno
            ) {
                return;
            }


            const distancia =
                Math.abs(
                    new Date(
                        dataPortal
                    ).getTime() -

                    new Date(
                        dataInterno
                    ).getTime()
                );


            if (
                distancia <
                menorDistancia
            ) {

                menorDistancia =
                    distancia;

                melhor = {
                    index: index,
                    registro: interno
                };

            }

        }
    );


    return melhor;

}


// ============================================================
// CRIAR RESULTADO
// ============================================================

function criarResultado(
    status,
    portal,
    interno,
    observacao = ""
) {

    return {

        status: status,

        observacao: observacao,


        // ================================================
        // OBJETOS ORIGINAIS
        // ================================================

        portal:
            portal || null,

        interno:
            interno || null,


        // ================================================
        // PORTAL
        // ================================================

        dataPortal:
            portal
                ? portal.data
                : "",

        valorPortal:
            portal
                ? normalizarValor(
                    portal.valor
                )
                : null,

        cartaoPortal:
            portal
                ? obterCartao(
                    portal
                )
                : "",

        horaPortal:
            portal
                ? portal.hora
                : "",

        codigoPortal:
            portal
                ? (
                    portal.codigoTransacao ||
                    portal.codigo ||
                    portal.transacao ||
                    ""
                )
                : "",


        // ================================================
        // SISTEMA
        // ================================================

        dataSistema:
            interno
                ? interno.data
                : "",

        valorSistema:
            interno
                ? normalizarValor(
                    interno.valor
                )
                : null,

        cartaoSistema:
            interno
                ? obterCartao(
                    interno
                )
                : "",

        horaSistema:
            interno
                ? interno.hora
                : "",

        codigoSistema:
            interno
                ? (
                    interno.codigoTransacao ||
                    interno.codigo ||
                    interno.transacao ||
                    ""
                )
                : "",

        autorizacao:
            interno
                ? (
                    interno.autorizacao ||
                    ""
                )
                : "",

        nsu:
            interno
                ? (
                    interno.nsu ||
                    ""
                )
                : "",


        // ================================================
        // DIFERENÇAS
        // ================================================

        diferencaValor:

            portal &&
            interno

                ? arredondar(
                    normalizarValor(
                        portal.valor
                    ) -
                    normalizarValor(
                        interno.valor
                    )
                )

                : null,


        diferencaHorario:

            portal &&
            interno

                ? diferencaHorarioSegundos(
                    portal.hora,
                    interno.hora
                )

                : null

    };

}


// ============================================================
// CONFERÊNCIA PRINCIPAL
// ============================================================

function executarConferencia(
    config = {}
) {

    console.log(
        "================================"
    );

    console.log(
        "INICIANDO CONFERÊNCIA"
    );

    console.log(
        "================================"
    );


    const portal =
        Array.isArray(
            window.dadosPremmia
        )
            ? window.dadosPremmia
            : [];


    const internos =
        Array.isArray(
            window.dadosInterno
        )
            ? window.dadosInterno
            : [];


    if (
        !portal.length &&
        !internos.length
    ) {

        console.warn(
            "Nenhuma planilha carregada."
        );


        window.resultadosConferencia =
            [];


        return [];

    }


    console.log(
        "Portal:",
        portal.length,
        "lançamentos"
    );


    console.log(
        "Sistema:",
        internos.length,
        "lançamentos"
    );


    const toleranciaMinutos =
        Number(
            config.toleranciaMinutos
        ) ||
        TOLERANCIA_HORARIO_MINUTOS;


    const internosUtilizados =
        new Set();


    // ========================================================
    // ÍNDICES
    // ========================================================

    const indices = {

        principal:
            criarIndice(
                internos,
                criarChavePrincipal
            ),

        dataValor:
            criarIndice(
                internos,
                criarChaveDataValor
            ),

        dataCartao:
            criarIndice(
                internos,
                criarChaveDataCartao
            ),

        valorCartao:
            criarIndice(
                internos,
                criarChaveValorCartao
            )

    };


    const resultados = [];


    // ========================================================
    // PROCESSAR PORTAL
    // ========================================================

    portal.forEach(
        portalRegistro => {

            let correspondencia;


            // =================================================
            // 1
            // DATA + VALOR + CARTÃO
            // =================================================

            correspondencia =
                encontrarCorrespondenciaPrincipal(
                    portalRegistro,
                    internos,
                    indices,
                    internosUtilizados,
                    toleranciaMinutos
                );


            if (
                correspondencia
            ) {

                internosUtilizados.add(
                    correspondencia.index
                );


                resultados.push(
                    criarResultado(
                        "CONFERIDA",
                        portalRegistro,
                        correspondencia.registro,
                        "Data, valor e tipo de cartão correspondentes."
                    )
                );


                return;

            }


            // =================================================
            // 2
            // DATA + VALOR
            // CARTÃO DIVERGENTE
            // =================================================

            correspondencia =
                encontrarPorDataValor(
                    portalRegistro,
                    internos,
                    indices,
                    internosUtilizados,
                    toleranciaMinutos
                );


            if (
                correspondencia
            ) {

                internosUtilizados.add(
                    correspondencia.index
                );


                resultados.push(
                    criarResultado(
                        "TIPO DE PAGAMENTO DIVERGENTE",
                        portalRegistro,
                        correspondencia.registro,
                        "Data e valor correspondem, mas o tipo de cartão/pagamento é diferente."
                    )
                );


                return;

            }


            // =================================================
            // 3
            // DATA + CARTÃO
            // VALOR DIVERGENTE
            // =================================================

            correspondencia =
                encontrarPorDataCartao(
                    portalRegistro,
                    internos,
                    indices,
                    internosUtilizados,
                    toleranciaMinutos
                );


            if (
                correspondencia
            ) {

                internosUtilizados.add(
                    correspondencia.index
                );


                resultados.push(
                    criarResultado(
                        "VALOR DIVERGENTE",
                        portalRegistro,
                        correspondencia.registro,
                        "Data e tipo de cartão correspondem, mas o valor é diferente."
                    )
                );


                return;

            }


            // =================================================
            // 4
            // VALOR + CARTÃO
            // DATA DIVERGENTE
            // =================================================

            correspondencia =
                encontrarPorValorCartao(
                    portalRegistro,
                    internos,
                    indices,
                    internosUtilizados
                );


            if (
                correspondencia
            ) {

                internosUtilizados.add(
                    correspondencia.index
                );


                resultados.push(
                    criarResultado(
                        "DATA DIVERGENTE",
                        portalRegistro,
                        correspondencia.registro,
                        "Valor e tipo de cartão correspondem, mas a data é diferente."
                    )
                );


                return;

            }


            // =================================================
            // 5
            // NÃO LANÇADA
            // =================================================

            resultados.push(
                criarResultado(
                    "NÃO LANÇADA",
                    portalRegistro,
                    null,
                    "Lançamento encontrado no Portal, mas não localizado no Sistema."
                )
            );

        }
    );


    // ========================================================
    // LANÇADAS A MAIS
    // ========================================================
    //
    // SOMENTE lançamentos reais do sistema.
    //
    // O TOTAL da planilha NÃO entra aqui.
    //
    // ========================================================

    internos.forEach(
        (
            interno,
            index
        ) => {

            if (
                internosUtilizados.has(
                    index
                )
            ) {
                return;
            }


            resultados.push(
                criarResultado(
                    "LANÇADA A MAIS",
                    null,
                    interno,
                    "Lançamento encontrado no Sistema, mas não localizado no Portal."
                )
            );

        }
    );


    // ========================================================
    // SALVAR
    // ========================================================

    window.resultadosConferencia =
        resultados;


    // ========================================================
    // RESUMO
    // ========================================================

    window.resumoConferencia =
        calcularResumoConferencia(
            resultados
        );


    console.log(
        "================================"
    );

    console.log(
        "CONFERÊNCIA FINALIZADA"
    );

    console.log(
        "Resultados:",
        resultados.length
    );

    console.log(
        "================================"
    );


    console.table(
        resultados
    );


    // ========================================================
    // MOSTRAR
    // ========================================================

    mostrarResultados(
        resultados
    );


    atualizarResumoConferencia();


    return resultados;

}


// ============================================================
// CALCULAR RESUMO
// ============================================================

function calcularResumoConferencia(
    resultados
) {

    const resumo = {

        totalResultados:
            resultados.length,

        conferidas:
            0,

        naoLancadas:
            0,

        lancadasAMais:
            0,

        tipoCartaoDivergente:
            0,

        valorDivergente:
            0,

        dataDivergente:
            0,


        valorPortal:
            0,

        valorSistema:
            0,

        valorSistemaCalculado:
            0,

        diferencaValor:
            0

    };


    // ========================================================
    // CONTAGEM
    // ========================================================

    resultados.forEach(
        resultado => {

            switch (
                resultado.status
            ) {

                case "CONFERIDA":

                    resumo.conferidas++;

                    break;


                case "NÃO LANÇADA":

                    resumo.naoLancadas++;

                    break;


                case "LANÇADA A MAIS":

                    resumo.lancadasAMais++;

                    break;


                case "TIPO DE PAGAMENTO DIVERGENTE":

                    resumo.tipoCartaoDivergente++;

                    break;


                case "VALOR DIVERGENTE":

                    resumo.valorDivergente++;

                    break;


                case "DATA DIVERGENTE":

                    resumo.dataDivergente++;

                    break;

            }

        }
    );


    // ========================================================
    // TOTAL PORTAL
    // ========================================================

    if (
        window.resumoPremmia
    ) {

        if (
            window.resumoPremmia.total !==
            undefined
        ) {

            resumo.valorPortal =
                normalizarValor(
                    window.resumoPremmia.total
                );

        }

    }


    // ========================================================
    // SE NÃO EXISTIR RESUMO DO PORTAL,
    // CALCULA PELAS LINHAS
    // ========================================================

    if (
        resumo.valorPortal === 0
    ) {

        resumo.valorPortal =
            resultados.reduce(
                (
                    total,
                    resultado
                ) => {

                    if (
                        resultado.portal
                    ) {

                        return (
                            total +
                            normalizarValor(
                                resultado.portal.valor
                            )
                        );

                    }

                    return total;

                },
                0
            );

    }


    // ========================================================
    // TOTAL SISTEMA
    //
    // PRIORIDADE:
    // 1 - total informado pela planilha
    // 2 - total calculado pelas linhas
    // ========================================================

    if (
        window.resumoInterno
    ) {

        if (
            window.resumoInterno.totalInformado !==
            undefined &&
            window.resumoInterno.totalInformado !==
            null
        ) {

            resumo.valorSistema =
                normalizarValor(
                    window.resumoInterno.totalInformado
                );

        }

        else if (
            window.resumoInterno.total !==
            undefined
        ) {

            resumo.valorSistema =
                normalizarValor(
                    window.resumoInterno.total
                );

        }

        else if (
            window.resumoInterno.totalCalculado !==
            undefined
        ) {

            resumo.valorSistema =
                normalizarValor(
                    window.resumoInterno.totalCalculado
                );

        }

    }


    // ========================================================
    // TOTAL CALCULADO DAS LINHAS
    // ========================================================

    if (
        window.resumoInterno
    ) {

        if (
            window.resumoInterno.totalCalculado !==
            undefined
        ) {

            resumo.valorSistemaCalculado =
                normalizarValor(
                    window.resumoInterno.totalCalculado
                );

        }

    }


    // Se não tiver cálculo fornecido
    if (
        resumo.valorSistemaCalculado === 0 &&
        window.dadosInterno
    ) {

        resumo.valorSistemaCalculado =
            window.dadosInterno.reduce(
                (
                    total,
                    registro
                ) => {

                    return (
                        total +
                        normalizarValor(
                            registro.valor
                        )
                    );

                },
                0
            );

    }


    // ========================================================
    // DIFERENÇA TOTAL
    // ========================================================

    resumo.valorPortal =
        arredondar(
            resumo.valorPortal
        );


    resumo.valorSistema =
        arredondar(
            resumo.valorSistema
        );


    resumo.valorSistemaCalculado =
        arredondar(
            resumo.valorSistemaCalculado
        );


    resumo.diferencaValor =
        arredondar(
            resumo.valorPortal -
            resumo.valorSistema
        );


    return resumo;

}


// ============================================================
// ATUALIZAR RESUMO DA TELA
// ============================================================

function atualizarResumoConferencia() {

    const resumo =
        window.resumoConferencia ||
        {};


    function preencher(
        id,
        valor
    ) {

        const elemento =
            document.getElementById(
                id
            );


        if (
            elemento
        ) {

            elemento.textContent =
                valor;

        }

    }


    // ========================================================
    // TOTAIS
    // ========================================================

    preencher(
        "totalPortal",
        formatarMoeda(
            resumo.valorPortal || 0
        )
    );


    preencher(
        "totalSistema",
        formatarMoeda(
            resumo.valorSistema || 0
        )
    );


    // ========================================================
    // QUANTIDADES
    // ========================================================

    preencher(
        "qtdPortal",
        `${window.dadosPremmia?.length || 0} lançamentos`
    );


    preencher(
        "qtdSistema",
        `${window.dadosInterno?.length || 0} lançamentos`
    );


    preencher(
        "qtdConferidas",
        resumo.conferidas || 0
    );


    preencher(
        "qtdNaoLancadas",
        resumo.naoLancadas || 0
    );


    preencher(
        "qtdLancadasAMais",
        resumo.lancadasAMais || 0
    );


    // ========================================================
    // DIFERENÇA TOTAL
    // ========================================================

    preencher(
        "diferencaTotal",
        formatarMoeda(
            resumo.diferencaValor || 0
        )
    );


    // ========================================================
    // OUTROS IDs, SE EXISTIREM
    // ========================================================

    preencher(
        "totalResultados",
        resumo.totalResultados || 0
    );


    preencher(
        "valorPortal",
        formatarMoeda(
            resumo.valorPortal || 0
        )
    );


    preencher(
        "valorSistema",
        formatarMoeda(
            resumo.valorSistema || 0
        )
    );


    preencher(
        "valorSistemaCalculado",
        formatarMoeda(
            resumo.valorSistemaCalculado || 0
        )
    );


    preencher(
        "totalSistemaCalculado",
        formatarMoeda(
            resumo.valorSistemaCalculado || 0
        )
    );


    preencher(
        "totalConferidas",
        resumo.conferidas || 0
    );


    preencher(
        "totalNaoLancadas",
        resumo.naoLancadas || 0
    );


    preencher(
        "totalLancadasAMais",
        resumo.lancadasAMais || 0
    );


    preencher(
        "totalValorDivergente",
        resumo.valorDivergente || 0
    );


    preencher(
        "totalDataDivergente",
        resumo.dataDivergente || 0
    );


    preencher(
        "totalCartaoDivergente",
        resumo.tipoCartaoDivergente || 0
    );

}


// ============================================================
// FILTROS
// ============================================================

function aplicarFiltrosConferencia(
    resultados,
    filtros = {}
) {

    if (
        !Array.isArray(
            resultados
        )
    ) {

        return [];

    }


    const filtroValor =
        Array.isArray(
            filtros.valor
        )
            ? filtros.valor
            : [];


    const filtroData =
        Array.isArray(
            filtros.data
        )
            ? filtros.data
            : [];


    const filtroCodigo =
        Array.isArray(
            filtros.codigoTransacao
        )
            ? filtros.codigoTransacao
            : [];


    const filtroPagamento =
        Array.isArray(
            filtros.formaPagamento
        )
            ? filtros.formaPagamento
            : [];


    const filtroHorario =
        Array.isArray(
            filtros.horario
        )
            ? filtros.horario
            : [];


    return resultados.filter(
        resultado => {

            // =================================================
            // VALOR
            // =================================================

            if (
                filtroValor.length
            ) {

                const valorPortal =
                    resultado.valorPortal;


                const valorSistema =
                    resultado.valorSistema;


                const encontrou =
                    filtroValor.some(
                        valor => {

                            const numero =
                                normalizarValor(
                                    valor
                                );


                            return (

                                valoresIguais(
                                    valorPortal,
                                    numero
                                )

                                ||

                                valoresIguais(
                                    valorSistema,
                                    numero
                                )

                            );

                        }
                    );


                if (
                    !encontrou
                ) {

                    return false;

                }

            }


            // =================================================
            // DATA
            // =================================================

            if (
                filtroData.length
            ) {

                const dataPortal =
                    normalizarDataConferencia(
                        resultado.dataPortal
                    );


                const dataSistema =
                    normalizarDataConferencia(
                        resultado.dataSistema
                    );


                const encontrou =
                    filtroData.some(
                        data => {

                            const normalizada =
                                normalizarDataConferencia(
                                    data
                                );


                            return (

                                dataPortal ===
                                normalizada

                                ||

                                dataSistema ===
                                normalizada

                            );

                        }
                    );


                if (
                    !encontrou
                ) {

                    return false;

                }

            }


            // =================================================
            // CÓDIGO
            // =================================================

            if (
                filtroCodigo.length
            ) {

                const codigoPortal =
                    normalizarTexto(
                        resultado.codigoPortal
                    );


                const codigoSistema =
                    normalizarTexto(
                        resultado.codigoSistema
                    );


                const encontrou =
                    filtroCodigo.some(
                        codigo => {

                            const termo =
                                normalizarTexto(
                                    codigo
                                );


                            return (

                                codigoPortal.includes(
                                    termo
                                )

                                ||

                                codigoSistema.includes(
                                    termo
                                )

                            );

                        }
                    );


                if (
                    !encontrou
                ) {

                    return false;

                }

            }


            // =================================================
            // FORMA DE PAGAMENTO
            // =================================================

            if (
                filtroPagamento.length
            ) {

                const portalCartao =
                    normalizarCartaoConferencia(
                        resultado.cartaoPortal
                    );


                const sistemaCartao =
                    normalizarCartaoConferencia(
                        resultado.cartaoSistema
                    );


                const encontrou =
                    filtroPagamento.some(
                        pagamento => {

                            const termo =
                                normalizarCartaoConferencia(
                                    pagamento
                                );


                            return (

                                portalCartao ===
                                termo

                                ||

                                sistemaCartao ===
                                termo

                            );

                        }
                    );


                if (
                    !encontrou
                ) {

                    return false;

                }

            }


            // =================================================
            // HORÁRIO
            // =================================================

            if (
                filtroHorario.length
            ) {

                const encontrou =
                    filtroHorario.some(
                        horario => {

                            return (

                                horariosCompativeis(
                                    horario,
                                    resultado.horaPortal
                                )

                                ||

                                horariosCompativeis(
                                    horario,
                                    resultado.horaSistema
                                )

                            );

                        }
                    );


                if (
                    !encontrou
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


// ============================================================
// ATUALIZAR RESULTADOS COM FILTROS
// ============================================================

function atualizarResultadosComFiltros(
    filtros = {}
) {

    window.filtrosConferencia =
        filtros;


    const resultados =
        window.resultadosConferencia ||
        [];


    const filtrados =
        aplicarFiltrosConferencia(
            resultados,
            filtros
        );


    mostrarResultados(
        filtrados
    );


    return filtrados;

}


// ============================================================
// LIMPAR FILTROS
// ============================================================

function limparFiltrosConferencia() {

    window.filtrosConferencia = {

        valor: [],

        data: [],

        codigoTransacao: [],

        formaPagamento: [],

        horario: []

    };


    mostrarResultados(
        window.resultadosConferencia || []
    );

}


// ============================================================
// ORDENAR RESULTADOS
// ============================================================

function ordenarResultados(
    resultados
) {

    const ordem = {

        "NÃO LANÇADA": 1,

        "LANÇADA A MAIS": 2,

        "TIPO DE PAGAMENTO DIVERGENTE": 3,

        "VALOR DIVERGENTE": 4,

        "DATA DIVERGENTE": 5,

        "CONFERIDA": 6

    };


    return [
        ...(resultados || [])
    ].sort(
        (
            a,
            b
        ) => {

            const ordemA =
                ordem[
                    a.status
                ] || 99;


            const ordemB =
                ordem[
                    b.status
                ] || 99;


            if (
                ordemA !==
                ordemB
            ) {

                return (
                    ordemA -
                    ordemB
                );

            }


            const dataA =
                normalizarDataConferencia(
                    a.dataPortal ||
                    a.dataSistema
                );


            const dataB =
                normalizarDataConferencia(
                    b.dataPortal ||
                    b.dataSistema
                );


            return dataA.localeCompare(
                dataB
            );

        }
    );

}


// ============================================================
// MOSTRAR RESULTADOS
// ============================================================

function mostrarResultados(
    resultados
) {

    // ========================================================
    // ATENÇÃO:
    //
    // #tabelaResultados É O PRÓPRIO <tbody>
    //
    // Não usar:
    //
    // #tabelaResultados tbody
    //
    // ========================================================

    const tabela =
        document.getElementById(
            "tabelaResultados"
        );


    if (
        !tabela
    ) {

        console.error(
            "Elemento #tabelaResultados não encontrado."
        );

        return;

    }


    // ========================================================
    // NENHUM RESULTADO
    // ========================================================

    if (
        !resultados ||
        !resultados.length
    ) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="sem-resultados"
                >

                    Nenhum resultado encontrado.

                </td>

            </tr>

        `;

        return;

    }


    // ========================================================
    // ORDENA
    // ========================================================

    const dados =
        ordenarResultados(
            resultados
        );


    // ========================================================
    // MONTA LINHAS
    // ========================================================

    tabela.innerHTML =

        dados
            .map(
                resultado => {

                    // ----------------------------------------
                    // OBJETOS
                    // ----------------------------------------

                    const portal =
                        resultado.portal ||
                        {};

                    const interno =
                        resultado.interno ||
                        {};


                    // ----------------------------------------
                    // PORTAL
                    // ----------------------------------------

                    const dataPortal =
                        resultado.dataPortal ||
                        portal.data ||
                        "";


                    const valorPortal =
                        resultado.valorPortal !==
                            null &&

                        resultado.valorPortal !==
                            undefined

                            ? resultado.valorPortal

                            : portal.valor;


                    const cartaoPortal =
                        resultado.cartaoPortal ||
                        portal.tipoCartao ||
                        portal.formaPagamento ||
                        "";


                    const horaPortal =
                        resultado.horaPortal ||
                        portal.hora ||
                        "";


                    // ----------------------------------------
                    // SISTEMA
                    // ----------------------------------------

                    const dataSistema =
                        resultado.dataSistema ||
                        interno.data ||
                        "";


                    const valorSistema =
                        resultado.valorSistema !==
                            null &&

                        resultado.valorSistema !==
                            undefined

                            ? resultado.valorSistema

                            : interno.valor;


                    const cartaoSistema =
                        resultado.cartaoSistema ||
                        interno.tipoCartao ||
                        interno.formaPagamento ||
                        "";


                    const horaSistema =
                        resultado.horaSistema ||
                        interno.hora ||
                        "";


                    // ----------------------------------------
                    // STATUS
                    // ----------------------------------------

                    const status =
                        resultado.status ||
                        "";


                    return `

                        <tr
                            data-status="${escapeHtml(
                                status
                            )}"
                        >

                            <td>

                                <span
                                    class="status ${classeStatus(
                                        status
                                    )}"
                                >

                                    ${escapeHtml(
                                        status
                                    )}

                                </span>

                            </td>


                            <td>

                                ${formatarDataSegura(
                                    dataPortal
                                )}

                            </td>


                            <td>

                                ${formatarMoeda(
                                    valorPortal
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    cartaoPortal ||
                                    "—"
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    horaPortal ||
                                    "—"
                                )}

                            </td>


                            <td>

                                ${formatarDataSegura(
                                    dataSistema
                                )}

                            </td>


                            <td>

                                ${
                                    valorSistema !==
                                        null &&

                                    valorSistema !==
                                        undefined &&

                                    valorSistema !==
                                        ""

                                        ? formatarMoeda(
                                            valorSistema
                                        )

                                        : "—"
                                }

                            </td>


                            <td>

                                ${escapeHtml(
                                    cartaoSistema ||
                                    "—"
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    horaSistema ||
                                    "—"
                                )}

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


// ============================================================
// FORMATA MOEDA
// ============================================================

function formatarMoeda(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "—";

    }


    return normalizarValor(
        valor
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ============================================================
// FORMATA DATA
// ============================================================

function formatarDataSegura(
    data
) {

    if (
        !data
    ) {

        return "—";

    }


    if (
        typeof window.formatarData ===
        "function"
    ) {

        const resultado =
            window.formatarData(
                data
            );


        if (
            resultado
        ) {

            return resultado;

        }

    }


    const normalizada =
        normalizarDataConferencia(
            data
        );


    const partes =
        normalizada.split("-");


    if (
        partes.length === 3 &&
        partes[0].length === 4
    ) {

        return (
            `${partes[2]}/${partes[1]}/${partes[0]}`
        );

    }


    return escapeHtml(
        String(data)
    );

}


// ============================================================
// STATUS
// ============================================================

function classeStatus(
    status
) {

    switch (
        status
    ) {

        case "CONFERIDA":

            return "conferida";


        case "NÃO LANÇADA":

            return "nao-lancada";


        case "LANÇADA A MAIS":

            return "lancada-mais";


        case "VALOR DIVERGENTE":

            return "valor-divergente";


        case "DATA DIVERGENTE":

            return "data-divergente";


        case "TIPO DE PAGAMENTO DIVERGENTE":

            return "cartao-divergente";


        default:

            return "divergente";

    }

}


// ============================================================
// FORMATA STATUS
// ============================================================

function formatarStatusConferencia(
    status
) {

    switch (
        status
    ) {

        case "CONFERIDA":

            return "🟢 CONFERIDA";


        case "NÃO LANÇADA":

            return "🔴 NÃO LANÇADA";


        case "LANÇADA A MAIS":

            return "🟠 LANÇADA A MAIS";


        case "VALOR DIVERGENTE":

            return "🟡 VALOR DIVERGENTE";


        case "DATA DIVERGENTE":

            return "🔵 DATA DIVERGENTE";


        case "TIPO DE PAGAMENTO DIVERGENTE":

            return "🟣 TIPO DE CARTÃO DIVERGENTE";


        default:

            return status || "";

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    valor
) {

    return String(
        valor === null ||
        valor === undefined
            ? ""
            : valor
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// EXPOR FUNÇÕES
// ============================================================

window.executarConferencia =
    executarConferencia;

window.calcularResumoConferencia =
    calcularResumoConferencia;

window.atualizarResumoConferencia =
    atualizarResumoConferencia;

window.mostrarResultados =
    mostrarResultados;

window.aplicarFiltrosConferencia =
    aplicarFiltrosConferencia;

window.atualizarResultadosComFiltros =
    atualizarResultadosComFiltros;

window.limparFiltrosConferencia =
    limparFiltrosConferencia;

window.normalizarCartaoConferencia =
    normalizarCartaoConferencia;

window.normalizarDataConferencia =
    normalizarDataConferencia;

window.normalizarHoraConferencia =
    normalizarHoraConferencia;

window.horaParaSegundosConferencia =
    horaParaSegundosConferencia;

window.diferencaHorarioSegundos =
    diferencaHorarioSegundos;

window.horariosCompativeis =
    horariosCompativeis;

window.formatarMoeda =
    formatarMoeda;

window.formatarDataSegura =
    formatarDataSegura;

window.formatarStatusConferencia =
    formatarStatusConferencia;

window.ordenarResultados =
    ordenarResultados;

window.escapeHtml =
    escapeHtml;


console.log(
    "conferencia.js carregado corretamente."
);

console.log(
    "Tolerância de horário:",
    TOLERANCIA_HORARIO_MINUTOS,
    "minutos"
);
