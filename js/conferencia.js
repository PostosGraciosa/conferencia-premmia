// ============================================================
// CONFERÊNCIA PREMMIA
// NOVA LÓGICA DE CONCILIAÇÃO
// ============================================================

console.log("================================");
console.log("conferencia.js iniciado");
console.log("================================");

window.resultadosConferencia = [];

window.configuracaoConferencia = {

    valor: true,

    data: true,

    codigoTransacao: false,

    formaPagamento: true,

    horarioAproximado: true,

    toleranciaMinutos: 10

};


// ============================================================
// UTILITÁRIOS
// ============================================================

function arredondar(valor) {

    return Math.round(
        (Number(valor) + Number.EPSILON) * 100
    ) / 100;

}


function valoresIguais(a, b) {

    return Math.abs(
        arredondar(a) -
        arredondar(b)
    ) < 0.01;

}


function textosIguais(a, b) {

    return (
        String(a || "").trim() ===
        String(b || "").trim()
    );

}


function obterDiferencaHorario(
    horaA,
    horaB
) {

    const a =
        window.horaParaSegundos
            ? window.horaParaSegundos(horaA)
            : null;

    const b =
        window.horaParaSegundos
            ? window.horaParaSegundos(horaB)
            : null;

    if (
        a === null ||
        b === null
    ) {
        return null;
    }

    let diferenca =
        Math.abs(a - b);

    // Trata virada de meia-noite
    if (diferenca > 43200) {
        diferenca =
            86400 - diferenca;
    }

    return diferenca;

}


function horarioDentroDaTolerancia(
    portal,
    interno,
    tolerancia
) {

    const diferenca =
        obterDiferencaHorario(
            portal.hora,
            interno.hora
        );

    if (diferenca === null) {

        // Se o horário não existir,
        // não impede a comparação.
        return true;

    }

    return (
        diferenca <=
        tolerancia * 60
    );

}


// ============================================================
// CRITÉRIOS
// ============================================================

function compararCriterios(
    portal,
    interno,
    config
) {

    const resultado = {

        valor: true,
        data: true,
        codigoTransacao: true,
        formaPagamento: true,
        horario: true,

        diferencaHorario: null,

        criteriosIguais: 0,
        criteriosTotais: 0

    };


    // --------------------------
    // VALOR
    // --------------------------

    if (config.valor) {

        resultado.criteriosTotais++;

        resultado.valor =
            valoresIguais(
                portal.valor,
                interno.valor
            );

        if (resultado.valor) {
            resultado.criteriosIguais++;
        }

    }


    // --------------------------
    // DATA
    // --------------------------

    if (config.data) {

        resultado.criteriosTotais++;

        resultado.data =
            textosIguais(
                portal.data,
                interno.data
            );

        if (resultado.data) {
            resultado.criteriosIguais++;
        }

    }


    // --------------------------
    // CÓDIGO
    // --------------------------

    if (config.codigoTransacao) {

        resultado.criteriosTotais++;

        resultado.codigoTransacao =
            textosIguais(
                portal.codigoTransacao,
                interno.codigoTransacao
            );

        if (
            resultado.codigoTransacao
        ) {
            resultado.criteriosIguais++;
        }

    }


    // --------------------------
    // FORMA DE PAGAMENTO
    // --------------------------

    if (config.formaPagamento) {

        resultado.criteriosTotais++;

        resultado.formaPagamento =
            textosIguais(
                portal.formaPagamento,
                interno.tipoCartao
            );

        if (
            resultado.formaPagamento
        ) {
            resultado.criteriosIguais++;
        }

    }


    // --------------------------
    // HORÁRIO
    // --------------------------

    if (config.horarioAproximado) {

        const diferenca =
            obterDiferencaHorario(
                portal.hora,
                interno.hora
            );

        resultado.diferencaHorario =
            diferenca;

        resultado.horario =
            horarioDentroDaTolerancia(
                portal,
                interno,
                config.toleranciaMinutos
            );

        // Horário aproximado não será
        // considerado um critério rígido
        // para determinar se é candidato.

    }


    return resultado;

}


// ============================================================
// CANDIDATO PRINCIPAL
// ============================================================

function ehCorrespondenciaExata(
    comparacao,
    config
) {

    if (
        config.valor &&
        !comparacao.valor
    ) {
        return false;
    }

    if (
        config.data &&
        !comparacao.data
    ) {
        return false;
    }

    if (
        config.codigoTransacao &&
        !comparacao.codigoTransacao
    ) {
        return false;
    }

    if (
        config.formaPagamento &&
        !comparacao.formaPagamento
    ) {
        return false;
    }

    if (
        config.horarioAproximado &&
        !comparacao.horario
    ) {
        return false;
    }

    return true;

}


// ============================================================
// CLASSIFICA DIVERGÊNCIA
// ============================================================

function identificarDivergencia(
    portal,
    interno
) {

    const valorIgual =
        valoresIguais(
            portal.valor,
            interno.valor
        );

    const dataIgual =
        textosIguais(
            portal.data,
            interno.data
        );

    const cartaoIgual =
        textosIguais(
            portal.formaPagamento,
            interno.tipoCartao
        );

    const codigoIgual =
        textosIguais(
            portal.codigoTransacao,
            interno.codigoTransacao
        );


    // Mesmo valor + mesma data,
    // mas cartão diferente
    if (
        valorIgual &&
        dataIgual &&
        !cartaoIgual
    ) {

        return "TIPO DE PAGAMENTO DIVERGENTE";

    }


    // Mesma data + mesmo cartão,
    // valor diferente
    if (
        dataIgual &&
        cartaoIgual &&
        !valorIgual
    ) {

        return "VALOR DIVERGENTE";

    }


    // Mesmo valor + mesmo cartão,
    // data diferente
    if (
        valorIgual &&
        cartaoIgual &&
        !dataIgual
    ) {

        return "DATA DIVERGENTE";

    }


    // Código igual, mas algum
    // outro critério divergiu
    if (
        codigoIgual &&
        (
            !valorIgual ||
            !dataIgual ||
            !cartaoIgual
        )
    ) {

        if (!valorIgual) {
            return "VALOR DIVERGENTE";
        }

        if (!dataIgual) {
            return "DATA DIVERGENTE";
        }

        if (!cartaoIgual) {
            return "TIPO DE PAGAMENTO DIVERGENTE";
        }

    }


    return "DIVERGENTE";

}


// ============================================================
// ENCONTRA MELHOR CANDIDATO
// ============================================================

function encontrarMelhorCandidato(
    portal,
    internos,
    config
) {

    let candidatos = [];

    for (
        let i = 0;
        i < internos.length;
        i++
    ) {

        const interno = internos[i];

        if (interno.usado) {
            continue;
        }

        const comparacao =
            compararCriterios(
                portal,
                interno,
                config
            );

        if (
            ehCorrespondenciaExata(
                comparacao,
                config
            )
        ) {

            let pontuacao =
                comparacao.criteriosIguais * 1000;

            // Quanto mais próximo o horário,
            // maior a prioridade
            if (
                comparacao.diferencaHorario !== null
            ) {

                pontuacao -=
                    comparacao.diferencaHorario;

            }

            candidatos.push({

                indice: i,

                registro: interno,

                comparacao,

                pontuacao

            });

        }

    }


    if (!candidatos.length) {
        return null;
    }


    candidatos.sort(
        (a, b) =>
            b.pontuacao -
            a.pontuacao
    );


    return candidatos[0];

}


// ============================================================
// PROCURA DIVERGÊNCIAS
// ============================================================

function encontrarPossivelDivergencia(
    portal,
    internos
) {

    let melhor = null;

    for (
        let i = 0;
        i < internos.length;
        i++
    ) {

        const interno = internos[i];

        if (interno.usado) {
            continue;
        }

        const valorIgual =
            valoresIguais(
                portal.valor,
                interno.valor
            );

        const dataIgual =
            textosIguais(
                portal.data,
                interno.data
            );

        const cartaoIgual =
            textosIguais(
                portal.formaPagamento,
                interno.tipoCartao
            );

        let pontuacao = 0;

        if (valorIgual) {
            pontuacao += 100;
        }

        if (dataIgual) {
            pontuacao += 50;
        }

        if (cartaoIgual) {
            pontuacao += 40;
        }


        const diferencaHorario =
            obterDiferencaHorario(
                portal.hora,
                interno.hora
            );


        if (
            diferencaHorario !== null &&
            diferencaHorario <= 600
        ) {

            pontuacao +=
                30 -
                (
                    diferencaHorario / 60
                );

        }


        if (pontuacao <= 0) {
            continue;
        }


        if (
            !melhor ||
            pontuacao >
            melhor.pontuacao
        ) {

            melhor = {

                indice: i,

                registro: interno,

                pontuacao,

                status:
                    identificarDivergencia(
                        portal,
                        interno
                    )

            };

        }

    }

    return melhor;

}


// ============================================================
// CONCILIAÇÃO
// ============================================================

function executarConferencia(config) {

    const portal =
        window.dadosPremmia || [];

    const internos =
        window.dadosInterno || [];


    if (!portal.length) {

        alert(
            "Carregue a planilha do Portal."
        );

        return [];

    }


    if (!internos.length) {

        alert(
            "Carregue a planilha do Sistema."
        );

        return [];

    }


    // Atualiza configuração
    window.configuracaoConferencia =
        Object.assign(
            {},
            window.configuracaoConferencia,
            config || {}
        );


    const configuracao =
        window.configuracaoConferencia;


    // Zera utilização
    portal.forEach(
        registro =>
            registro.usado = false
    );

    internos.forEach(
        registro =>
            registro.usado = false
    );


    const resultados = [];


    // ========================================================
    // 1 — PROCURA CORRESPONDÊNCIAS
    // ========================================================

    for (
        let i = 0;
        i < portal.length;
        i++
    ) {

        const registroPortal =
            portal[i];


        const candidato =
            encontrarMelhorCandidato(
                registroPortal,
                internos,
                configuracao
            );


        if (candidato) {

            const registroInterno =
                candidato.registro;

            registroPortal.usado = true;
            registroInterno.usado = true;


            const comparacao =
                candidato.comparacao;


            resultados.push({

                status: "CONFERIDA",

                portal:
                    registroPortal,

                interno:
                    registroInterno,

                diferencaValor:
                    arredondar(
                        registroPortal.valor -
                        registroInterno.valor
                    ),

                diferencaHorario:
                    comparacao.diferencaHorario,

                linhaPortal:
                    registroPortal.linhaOriginal,

                linhaInterno:
                    registroInterno.linhaOriginal

            });

        }

    }


    // ========================================================
    // 2 — PORTAL SEM CORRESPONDÊNCIA
    // ========================================================

    for (
        let i = 0;
        i < portal.length;
        i++
    ) {

        const registroPortal =
            portal[i];

        if (registroPortal.usado) {
            continue;
        }


        const divergencia =
            encontrarPossivelDivergencia(
                registroPortal,
                internos
            );


        if (divergencia) {

            const registroInterno =
                divergencia.registro;


            // Só associamos como divergência
            // se houver uma relação forte.
            if (
                divergencia.pontuacao >= 90
            ) {

                registroPortal.usado = true;
                registroInterno.usado = true;


                resultados.push({

                    status:
                        divergencia.status,

                    portal:
                        registroPortal,

                    interno:
                        registroInterno,

                    diferencaValor:
                        arredondar(
                            registroPortal.valor -
                            registroInterno.valor
                        ),

                    diferencaHorario:
                        obterDiferencaHorario(
                            registroPortal.hora,
                            registroInterno.hora
                        ),

                    linhaPortal:
                        registroPortal.linhaOriginal,

                    linhaInterno:
                        registroInterno.linhaOriginal

                });

                continue;

            }

        }


        // Não encontrou absolutamente nada
        resultados.push({

            status: "NÃO LANÇADA",

            portal:
                registroPortal,

            interno:
                null,

            diferencaValor:
                registroPortal.valor,

            diferencaHorario:
                null,

            linhaPortal:
                registroPortal.linhaOriginal,

            linhaInterno:
                null

        });

        registroPortal.usado = true;

    }


    // ========================================================
    // 3 — SOBRAS DO SISTEMA
    // ========================================================

    for (
        let i = 0;
        i < internos.length;
        i++
    ) {

        const registroInterno =
            internos[i];

        if (registroInterno.usado) {
            continue;
        }


        resultados.push({

            status: "LANÇADA A MAIS",

            portal:
                null,

            interno:
                registroInterno,

            diferencaValor:
                -registroInterno.valor,

            diferencaHorario:
                null,

            linhaPortal:
                null,

            linhaInterno:
                registroInterno.linhaOriginal

        });

        registroInterno.usado = true;

    }


    // ========================================================
    // 4 — ORDENAÇÃO
    // ========================================================

    const ordem = {

        "NÃO LANÇADA": 1,

        "LANÇADA A MAIS": 2,

        "VALOR DIVERGENTE": 3,

        "TIPO DE PAGAMENTO DIVERGENTE": 4,

        "DATA DIVERGENTE": 5,

        "DIVERGENTE": 6,

        "CONFERIDA": 7

    };


    resultados.sort(
        (a, b) =>
            (ordem[a.status] || 99) -
            (ordem[b.status] || 99)
    );


    window.resultadosConferencia =
        resultados;


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
        window.resumoConferencia
    );

    console.log(
        resultados
    );

    console.log(
        "================================"
    );


    if (
        typeof window.mostrarResultados ===
        "function"
    ) {

        window.mostrarResultados(
            resultados
        );

    }


    return resultados;

}


// ============================================================
// RESUMO
// ============================================================

function calcularResumoConferencia(
    resultados
) {

    const resumo = {

        totalResultados:
            resultados.length,

        conferidas: 0,

        naoLancadas: 0,

        lancadasAMais: 0,

        valorDivergente: 0,

        dataDivergente: 0,

        cartaoDivergente: 0,

        outrasDivergencias: 0,

        valorPortal:
            0,

        valorSistema:
            0,

        diferencaValor:
            0

    };


    resultados.forEach(
        resultado => {

            if (
                resultado.portal
            ) {

                resumo.valorPortal +=
                    resultado.portal.valor;

            }

            if (
                resultado.interno
            ) {

                resumo.valorSistema +=
                    resultado.interno.valor;

            }


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


                case "VALOR DIVERGENTE":

                    resumo.valorDivergente++;
                    break;


                case "DATA DIVERGENTE":

                    resumo.dataDivergente++;
                    break;


                case "TIPO DE PAGAMENTO DIVERGENTE":

                    resumo.cartaoDivergente++;
                    break;


                default:

                    resumo.outrasDivergencias++;
                    break;

            }

        }
    );


    resumo.valorPortal =
        arredondar(
            resumo.valorPortal
        );


    resumo.valorSistema =
        arredondar(
            resumo.valorSistema
        );


    resumo.diferencaValor =
        arredondar(
            resumo.valorPortal -
            resumo.valorSistema
        );


    return resumo;

}


// ============================================================
// ACESSO GLOBAL
// ============================================================

window.executarConferencia =
    executarConferencia;

window.calcularResumoConferencia =
    calcularResumoConferencia;

window.compararCriterios =
    compararCriterios;

console.log("================================");
console.log("conferencia.js carregado");
console.log("================================");
