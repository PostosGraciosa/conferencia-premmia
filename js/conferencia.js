// ==========================================
// CONFERÊNCIA PREMMIA
// conferencia.js
//
// REGRA PRINCIPAL:
//
// 1. Mesmo valor
// 2. Mesma data
// 3. Horário aproximado
// 4. Escolhe o lançamento interno
//    mais próximo
//
// A AUTORIZAÇÃO NÃO É USADA COMO
// CHAVE PRINCIPAL DE CONFERÊNCIA.
//
// Tolerância padrão: +/- 10 minutos
// ==========================================


// ==========================================
// CONFIGURAÇÕES
// ==========================================

const TOLERANCIA_MINUTOS = 10;

const TOLERANCIA_MS =
    TOLERANCIA_MINUTOS * 60 * 1000;


// ==========================================
// RESULTADOS
// ==========================================

let resultadosConferencia = [];


// ==========================================
// BOTÃO CONFERIR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const btnConferir =
            document.getElementById("btnConferir");

        if (btnConferir) {

            btnConferir.addEventListener(
                "click",
                iniciarConferencia
            );

        }

    }
);


// ==========================================
// INICIAR CONFERÊNCIA
// ==========================================

function iniciarConferencia() {

    // --------------------------------------
    // VERIFICAR PLANILHAS
    // --------------------------------------

    if (
        !Array.isArray(window.dadosPremmia) ||
        !Array.isArray(window.dadosInterno)
    ) {

        alert(
            "As duas planilhas precisam ser carregadas."
        );

        return;
    }


    if (
        window.dadosPremmia.length === 0
    ) {

        alert(
            "A planilha do Premmia não possui registros."
        );

        return;
    }


    if (
        window.dadosInterno.length === 0
    ) {

        alert(
            "A planilha do sistema interno não possui registros."
        );

        return;
    }


    // --------------------------------------
    // LIMPAR RESULTADOS
    // --------------------------------------

    resultadosConferencia = [];


    // --------------------------------------
    // CONTROLE DOS LANÇAMENTOS INTERNOS
    //
    // Cada lançamento interno só pode ser
    // usado uma única vez.
    // --------------------------------------

    const internosUtilizados =
        new Set();


    // ======================================
    // PRIMEIRA ETAPA
    //
    // PREMMIA → INTERNO
    // ======================================

    window.dadosPremmia.forEach(
        (
            premmia,
            indicePremmia
        ) => {

            // --------------------------------
            // PROCURAR MESMO VALOR
            // + MESMA DATA
            // + HORÁRIO MAIS PRÓXIMO
            // --------------------------------

            const melhorCorrespondencia =
                encontrarMelhorCorrespondencia(
                    premmia,
                    window.dadosInterno,
                    internosUtilizados
                );


            // =================================
            // NÃO ENCONTROU MESMO VALOR
            // =================================

            if (!melhorCorrespondencia) {

                // --------------------------------
                // PROCURAR MESMO DIA/HORÁRIO
                // COM VALOR DIFERENTE
                // --------------------------------

                const candidatoValorDiferente =
                    encontrarCandidatoValorDiferente(
                        premmia,
                        window.dadosInterno,
                        internosUtilizados
                    );


                if (candidatoValorDiferente) {

                    internosUtilizados.add(
                        candidatoValorDiferente.indice
                    );


                    resultadosConferencia.push(

                        criarResultado({

                            status:
                                "VALOR_DIVERGENTE",

                            premmia:
                                premmia,

                            interno:
                                candidatoValorDiferente.registro,

                            diferenca:
                                calcularDiferenca(
                                    premmia.valor,
                                    candidatoValorDiferente.registro.valor
                                ),

                            diferencaHorario:
                                candidatoValorDiferente.diferencaMinutos,

                            observacao:
                                "Existe lançamento próximo no horário, porém com valor diferente."

                        })

                    );

                    return;
                }


                // =================================
                // NÃO LANÇADA
                // =================================

                resultadosConferencia.push(

                    criarResultado({

                        status:
                            "NAO_LANCADA",

                        premmia:
                            premmia,

                        interno:
                            null,

                        diferenca:
                            normalizarValor(
                                premmia.valor
                            ),

                        diferencaHorario:
                            null,

                        observacao:
                            "Venda do Premmia não encontrada no sistema interno dentro da tolerância de data e horário."

                    })

                );

                return;
            }


            // =================================
            // MARCAR INTERNO COMO UTILIZADO
            // =================================

            internosUtilizados.add(
                melhorCorrespondencia.indice
            );


            // =================================
            // DETERMINAR STATUS
            // =================================

            let status =
                "CORRETA";

            let observacao =
                "Venda conferida.";


            // --------------------------------
            // MESMO VALOR E MESMA DATA,
            // MAS HORÁRIO DIFERENTE
            // --------------------------------

            if (
                melhorCorrespondencia.diferencaMinutos >
                0.01
            ) {

                status =
                    "CORRESPONDENCIA_DATA_HORA";

                observacao =
                    "Venda conferida por valor e data, com horário aproximado dentro da tolerância.";

            }


            // =================================
            // RESULTADO
            // =================================

            resultadosConferencia.push(

                criarResultado({

                    status:
                        status,

                    premmia:
                        premmia,

                    interno:
                        melhorCorrespondencia.registro,

                    diferenca:
                        calcularDiferenca(
                            premmia.valor,
                            melhorCorrespondencia.registro.valor
                        ),

                    diferencaHorario:
                        melhorCorrespondencia.diferencaMinutos,

                    observacao:
                        observacao

                })

            );

        }
    );


    // ======================================
    // SEGUNDA ETAPA
    //
    // LANÇAMENTOS INTERNOS QUE SOBRARAM
    // ======================================

    window.dadosInterno.forEach(
        (
            interno,
            indiceInterno
        ) => {

            if (
                internosUtilizados.has(
                    indiceInterno
                )
            ) {

                return;
            }


            resultadosConferencia.push(

                criarResultado({

                    status:
                        "LANCADA_A_MAIS",

                    premmia:
                        null,

                    interno:
                        interno,

                    diferenca:
                        normalizarValor(
                            interno.valor
                        ),

                    diferencaHorario:
                        null,

                    observacao:
                        "Lançamento encontrado no sistema interno sem correspondente no Portal Premmia."

                })

            );

        }
    );


    // ======================================
    // ORDENAR RESULTADOS
    // MAIS RECENTES PRIMEIRO
    // ======================================

    resultadosConferencia.sort(
        ordenarResultados
    );


    // ======================================
    // SALVAR GLOBALMENTE
    // ======================================

    window.resultadosConferencia =
        resultadosConferencia;


    // ======================================
    // MOSTRAR RESULTADOS
    // ======================================

    mostrarResultados();


    // ======================================
    // LOG
    // ======================================

    console.log(
        "================================="
    );

    console.log(
        "CONFERÊNCIA PREMMIA"
    );

    console.log(
        "================================="
    );

    console.log(
        "Premmia:",
        window.dadosPremmia.length
    );

    console.log(
        "Interno:",
        window.dadosInterno.length
    );

    console.log(
        "Resultados:",
        resultadosConferencia.length
    );

    console.log(
        "Tolerância:",
        TOLERANCIA_MINUTOS,
        "minutos"
    );

    console.log(
        "================================="
    );

}


// ==========================================
// ENCONTRAR MELHOR CORRESPONDÊNCIA
// ==========================================
//
// Procura:
//
// MESMO VALOR
// +
// MESMA DATA
// +
// HORÁRIO MAIS PRÓXIMO
// +
// DENTRO DA TOLERÂNCIA
//
// ==========================================

function encontrarMelhorCorrespondencia(
    premmia,
    internos,
    internosUtilizados
) {

    const valorPremmia =
        normalizarValor(
            premmia?.valor
        );


    const tempoPremmia =
        obterDataHora(
            premmia
        );


    if (
        tempoPremmia === null
    ) {

        return null;
    }


    let melhor =
        null;


    internos.forEach(
        (
            interno,
            indice
        ) => {

            // --------------------------------
            // JÁ UTILIZADO
            // --------------------------------

            if (
                internosUtilizados.has(
                    indice
                )
            ) {

                return;
            }


            // --------------------------------
            // MESMO VALOR
            // --------------------------------

            const valorInterno =
                normalizarValor(
                    interno?.valor
                );


            if (
                Math.abs(
                    valorPremmia -
                    valorInterno
                ) >= 0.01
            ) {

                return;
            }


            // --------------------------------
            // DATA + HORA
            // --------------------------------

            const tempoInterno =
                obterDataHora(
                    interno
                );


            if (
                tempoInterno === null
            ) {

                return;
            }


            // --------------------------------
            // MESMA DATA
            // --------------------------------

            if (
                !mesmaData(
                    tempoPremmia,
                    tempoInterno
                )
            ) {

                return;
            }


            // --------------------------------
            // DIFERENÇA DE HORÁRIO
            // --------------------------------

            const diferencaMs =
                Math.abs(
                    tempoPremmia -
                    tempoInterno
                );


            // --------------------------------
            // FORA DA TOLERÂNCIA
            // --------------------------------

            if (
                diferencaMs >
                TOLERANCIA_MS
            ) {

                return;
            }


            const diferencaMinutos =
                diferencaMs / 60000;


            // --------------------------------
            // PRIMEIRO CANDIDATO
            // --------------------------------

            if (
                !melhor
            ) {

                melhor = {

                    registro:
                        interno,

                    indice:
                        indice,

                    diferencaMinutos:
                        diferencaMinutos

                };

                return;
            }


            // --------------------------------
            // ESCOLHER MAIS PRÓXIMO
            // --------------------------------

            if (
                diferencaMinutos <
                melhor.diferencaMinutos
            ) {

                melhor = {

                    registro:
                        interno,

                    indice:
                        indice,

                    diferencaMinutos:
                        diferencaMinutos

                };

            }

        }
    );


    return melhor;
}


// ==========================================
// ENCONTRAR CANDIDATO COM VALOR DIFERENTE
// ==========================================

function encontrarCandidatoValorDiferente(
    premmia,
    internos,
    internosUtilizados
) {

    const tempoPremmia =
        obterDataHora(
            premmia
        );


    if (
        tempoPremmia === null
    ) {

        return null;
    }


    const valorPremmia =
        normalizarValor(
            premmia?.valor
        );


    let melhor =
        null;


    internos.forEach(
        (
            interno,
            indice
        ) => {

            // --------------------------------
            // JÁ UTILIZADO
            // --------------------------------

            if (
                internosUtilizados.has(
                    indice
                )
            ) {

                return;
            }


            // --------------------------------
            // DATA + HORA
            // --------------------------------

            const tempoInterno =
                obterDataHora(
                    interno
                );


            if (
                tempoInterno === null
            ) {

                return;
            }


            // --------------------------------
            // MESMA DATA
            // --------------------------------

            if (
                !mesmaData(
                    tempoPremmia,
                    tempoInterno
                )
            ) {

                return;
            }


            // --------------------------------
            // DIFERENÇA DE HORÁRIO
            // --------------------------------

            const diferencaMs =
                Math.abs(
                    tempoPremmia -
                    tempoInterno
                );


            if (
                diferencaMs >
                TOLERANCIA_MS
            ) {

                return;
            }


            const diferencaMinutos =
                diferencaMs / 60000;


            // --------------------------------
            // VALOR
            // --------------------------------

            const valorInterno =
                normalizarValor(
                    interno?.valor
                );


            // Se valor igual, a função
            // principal deveria encontrar.

            if (
                Math.abs(
                    valorPremmia -
                    valorInterno
                ) < 0.01
            ) {

                return;
            }


            // --------------------------------
            // ESCOLHER MAIS PRÓXIMO
            // --------------------------------

            if (
                !melhor ||
                diferencaMinutos <
                melhor.diferencaMinutos
            ) {

                melhor = {

                    registro:
                        interno,

                    indice:
                        indice,

                    diferencaMinutos:
                        diferencaMinutos

                };

            }

        }
    );


    return melhor;
}


// ==========================================
// OBTER DATA + HORA
// ==========================================

function obterDataHora(
    registro
) {

    if (
        !registro
    ) {

        return null;
    }


    // --------------------------------------
    // CAMPOS NORMALIZADOS
    // --------------------------------------

    let data =
        registro.data ||
        registro.dataVenda ||
        registro.dataLancamento ||
        "";


    let hora =
        registro.hora ||
        registro.horario ||
        registro.horaVenda ||
        "";


    // --------------------------------------
    // DATA JÁ COM HORA
    // --------------------------------------

    if (
        data &&
        String(data).includes(":")
    ) {

        const convertido =
            converterDataHora(
                data
            );


        if (
            convertido !== null
        ) {

            return convertido;
        }

    }


    // --------------------------------------
    // DATA + HORA SEPARADAS
    // --------------------------------------

    if (
        data &&
        hora
    ) {

        const convertido =
            converterDataHora(
                `${data} ${hora}`
            );


        if (
            convertido !== null
        ) {

            return convertido;
        }

    }


    // --------------------------------------
    // PROCURAR NOS DEMAIS CAMPOS
    // --------------------------------------

    const campos =
        Object.keys(
            registro
        );


    for (
        const campo of campos
    ) {

        const valor =
            registro[campo];


        if (
            valor === null ||
            valor === undefined
        ) {

            continue;
        }


        const texto =
            String(valor);


        if (
            /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(
                texto
            ) &&
            /\d{1,2}:\d{2}/.test(
                texto
            )
        ) {

            const convertido =
                converterDataHora(
                    texto
                );


            if (
                convertido !== null
            ) {

                return convertido;
            }

        }

    }


    return null;
}


// ==========================================
// CONVERTER DATA + HORA
// ==========================================

function converterDataHora(
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
    // JÁ É DATE
    // --------------------------------------

    if (
        valor instanceof Date
    ) {

        const tempo =
            valor.getTime();


        return isNaN(tempo)
            ? null
            : tempo;

    }


    const texto =
        String(valor)
            .trim();


    // --------------------------------------
    // DD/MM/YYYY HH:MM:SS
    // --------------------------------------

    let match =
        texto.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (
        match
    ) {

        let dia =
            Number(match[1]);

        let mes =
            Number(match[2]) - 1;

        let ano =
            Number(match[3]);

        const hora =
            Number(match[4]);

        const minuto =
            Number(match[5]);

        const segundo =
            Number(match[6] || 0);


        if (
            ano < 100
        ) {

            ano += 2000;
        }


        const data =
            new Date(
                ano,
                mes,
                dia,
                hora,
                minuto,
                segundo,
                0
            );


        // --------------------------------
        // VALIDAR DATA
        // --------------------------------

        if (
            data.getFullYear() !== ano ||
            data.getMonth() !== mes ||
            data.getDate() !== dia
        ) {

            return null;
        }


        return data.getTime();
    }


    // --------------------------------------
    // DD/MM/YYYY
    // --------------------------------------

    match =
        texto.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/
        );


    if (
        match
    ) {

        const dia =
            Number(match[1]);

        const mes =
            Number(match[2]) - 1;

        let ano =
            Number(match[3]);


        if (
            ano < 100
        ) {

            ano += 2000;
        }


        const data =
            new Date(
                ano,
                mes,
                dia,
                0,
                0,
                0,
                0
            );


        if (
            data.getFullYear() !== ano ||
            data.getMonth() !== mes ||
            data.getDate() !== dia
        ) {

            return null;
        }


        return data.getTime();
    }


    // --------------------------------------
    // ISO / DATE NATIVO
    // --------------------------------------

    const data =
        new Date(
            texto
        );


    if (
        !isNaN(
            data.getTime()
        )
    ) {

        return data.getTime();
    }


    return null;
}


// ==========================================
// MESMA DATA
// ==========================================

function mesmaData(
    data1,
    data2
) {

    const primeiro =
        new Date(data1);


    const segundo =
        new Date(data2);


    return (
        primeiro.getFullYear() ===
        segundo.getFullYear()
    ) &&
    (
        primeiro.getMonth() ===
        segundo.getMonth()
    ) &&
    (
        primeiro.getDate() ===
        segundo.getDate()
    );
}


// ==========================================
// NORMALIZAR VALOR
// ==========================================

function normalizarValor(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return 0;
    }


    // --------------------------------------
    // NUMBER
    // --------------------------------------

    if (
        typeof valor === "number"
    ) {

        return arredondar(
            valor
        );
    }


    let texto =
        String(valor)
            .trim();


    // --------------------------------------
    // R$
    // --------------------------------------

    texto =
        texto
            .replace(
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
    // FORMATO NORMAL
    //
    // 1234.56
    // --------------------------------------

    const numero =
        Number(
            texto
        );


    if (
        isNaN(numero)
    ) {

        return 0;
    }


    return arredondar(
        numero
    );
}


// ==========================================
// CALCULAR DIFERENÇA
// ==========================================

function calcularDiferenca(
    valorPremmia,
    valorInterno
) {

    const valor1 =
        normalizarValor(
            valorPremmia
        );


    const valor2 =
        normalizarValor(
            valorInterno
        );


    return arredondar(
        valor1 -
        valor2
    );
}


// ==========================================
// ARREDONDAR
// ==========================================

function arredondar(
    valor
) {

    return Number(
        Number(
            valor || 0
        ).toFixed(2)
    );
}


// ==========================================
// CRIAR RESULTADO
// ==========================================

function criarResultado({
    status,
    premmia,
    interno,
    diferenca = 0,
    diferencaHorario = null,
    observacao = ""
}) {

    return {

        status:
            status,

        premmia:
            premmia,

        interno:
            interno,


        // ----------------------------------
        // PREMMIA
        // ----------------------------------

        dataPremmia:
            obterDataRegistro(
                premmia
            ),

        horaPremmia:
            obterHoraRegistro(
                premmia
            ),


        // ----------------------------------
        // INTERNO
        // ----------------------------------

        dataInterno:
            obterDataRegistro(
                interno
            ),

        horaInterno:
            obterHoraRegistro(
                interno
            ),


        // ----------------------------------
        // CLIENTE
        // ----------------------------------

        cliente:
            premmia?.cliente ||
            interno?.cliente ||
            "",


        // ----------------------------------
        // AUTORIZAÇÕES
        //
        // Apenas para EXIBIÇÃO.
        // Não participam da conferência.
        // ----------------------------------

        autorizacaoPremmia:
            premmia?.autorizacao ||
            "",

        autorizacaoInterno:
            interno?.autorizacao ||
            "",


        // ----------------------------------
        // VALORES
        // ----------------------------------

        valorPremmia:
            premmia
                ? normalizarValor(
                    premmia.valor
                )
                : null,

        valorInterno:
            interno
                ? normalizarValor(
                    interno.valor
                )
                : null,


        // ----------------------------------
        // DIFERENÇA
        // ----------------------------------

        diferenca:
            arredondar(
                diferenca
            ),


        // ----------------------------------
        // DIFERENÇA DE HORÁRIO
        // ----------------------------------

        diferencaHorario:
            diferencaHorario !== null
                ? arredondar(
                    diferencaHorario
                )
                : null,


        // ----------------------------------
        // OPERADOR
        //
        // Apenas informação.
        // Não participa da conferência.
        // ----------------------------------

        operador:
            interno?.operador ||
            "",


        // ----------------------------------
        // PAGAMENTO
        // ----------------------------------

        pagamento:
            premmia?.pagamento ||
            "",


        // ----------------------------------
        // TIPO
        // ----------------------------------

        tipo:
            premmia?.operacao ||
            interno?.tipo ||
            "",


        // ----------------------------------
        // OBSERVAÇÃO
        // ----------------------------------

        observacao:
            observacao

    };
}


// ==========================================
// OBTER DATA PARA EXIBIÇÃO
// ==========================================

function obterDataRegistro(
    registro
) {

    if (
        !registro
    ) {

        return "";
    }


    const campos = [

        registro.data,
        registro.dataVenda,
        registro.dataLancamento

    ];


    for (
        const valor of campos
    ) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            continue;
        }


        const texto =
            String(valor);


        const match =
            texto.match(
                /(\d{1,2}\/\d{1,2}\/\d{2,4})/
            );


        if (
            match
        ) {

            return match[1];
        }

    }


    return "";
}


// ==========================================
// OBTER HORA PARA EXIBIÇÃO
// ==========================================

function obterHoraRegistro(
    registro
) {

    if (
        !registro
    ) {

        return "";
    }


    const campos = [

        registro.hora,
        registro.horario,
        registro.horaVenda,
        registro.data,
        registro.dataVenda,
        registro.dataLancamento

    ];


    for (
        const valor of campos
    ) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            continue;
        }


        const texto =
            String(valor);


        const match =
            texto.match(
                /(\d{1,2}:\d{2}(?::\d{2})?)/
            );


        if (
            match
        ) {

            return match[1];
        }

    }


    return "";
}


// ==========================================
// ORDENAR RESULTADOS
// ==========================================

function ordenarResultados(
    a,
    b
) {

    const dataA =
        obterDataHora(
            a.premmia ||
            a.interno
        );


    const dataB =
        obterDataHora(
            b.premmia ||
            b.interno
        );


    if (
        dataA === null &&
        dataB === null
    ) {

        return 0;
    }


    if (
        dataA === null
    ) {

        return 1;
    }


    if (
        dataB === null
    ) {

        return -1;
    }


    return dataB - dataA;
}


// ==========================================
// MOSTRAR RESULTADOS
// ==========================================

function mostrarResultados() {

    const resultado =
        document.getElementById(
            "resultado"
        );


    const tabelaResultado =
        document.getElementById(
            "tabelaResultado"
        );


    if (
        resultado
    ) {

        resultado.style.display =
            "block";
    }


    if (
        tabelaResultado
    ) {

        tabelaResultado.style.display =
            "block";
    }


    atualizarResumo();


    renderizarTabela(
        resultadosConferencia
    );


    if (
        resultado
    ) {

        resultado.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }
}


// ==========================================
// ATUALIZAR RESUMO
// ==========================================

function atualizarResumo() {

    const resumo = {

        CORRETA: {
            quantidade: 0,
            valor: 0
        },

        CORRESPONDENCIA_DATA_HORA: {
            quantidade: 0,
            valor: 0
        },

        NAO_LANCADA: {
            quantidade: 0,
            valor: 0
        },

        LANCADA_A_MAIS: {
            quantidade: 0,
            valor: 0
        },

        VALOR_DIVERGENTE: {
            quantidade: 0,
            valor: 0
        }

    };


    resultadosConferencia.forEach(
        resultado => {

            if (
                !resumo[
                    resultado.status
                ]
            ) {

                return;
            }


            resumo[
                resultado.status
            ].quantidade++;


            let valor =
                resultado.valorPremmia;


            if (
                valor === null ||
                valor === undefined
            ) {

                valor =
                    resultado.valorInterno;
            }


            if (
                valor !== null &&
                valor !== undefined
            ) {

                resumo[
                    resultado.status
                ].valor +=
                    Number(valor);

            }

        }
    );


    // ======================================
    // CONFERIDAS
    // ======================================

    preencherResumo(
        "totalCorretas",
        "valorCorretas",
        resumo.CORRETA
    );


    // ======================================
    // CORRESPONDÊNCIA DATA/HORA
    // ======================================

    preencherResumo(
        "totalCorrespondencias",
        "valorCorrespondencias",
        resumo.CORRESPONDENCIA_DATA_HORA
    );


    // ======================================
    // NÃO LANÇADAS
    // ======================================

    preencherResumo(
        "totalNaoLancadas",
        "valorNaoLancadas",
        resumo.NAO_LANCADA
    );


    // ======================================
    // LANÇADAS A MAIS
    // ======================================

    preencherResumo(
        "totalLancadasMais",
        "valorLancadasMais",
        resumo.LANCADA_A_MAIS
    );


    // ======================================
    // VALOR DIVERGENTE
    // ======================================

    preencherResumo(
        "totalValorErrado",
        "valorValorErrado",
        resumo.VALOR_DIVERGENTE
    );


    // --------------------------------------
    // COMPATIBILIDADE ANTIGA
    // --------------------------------------

    const totalAutorizacao =
        document.getElementById(
            "totalAutorizacao"
        );


    const valorAutorizacao =
        document.getElementById(
            "valorAutorizacao"
        );


    if (
        totalAutorizacao
    ) {

        totalAutorizacao.textContent =
            "0";
    }


    if (
        valorAutorizacao
    ) {

        valorAutorizacao.textContent =
            "R$ 0,00";
    }
}


// ==========================================
// PREENCHER RESUMO
// ==========================================

function preencherResumo(
    idQuantidade,
    idValor,
    dados
) {

    const quantidade =
        document.getElementById(
            idQuantidade
        );


    const valor =
        document.getElementById(
            idValor
        );


    if (
        quantidade
    ) {

        quantidade.textContent =
            dados.quantidade;
    }


    if (
        valor
    ) {

        valor.textContent =
            formatarMoeda(
                dados.valor
            );
    }
}


// ==========================================
// RENDERIZAR TABELA
// ==========================================

function renderizarTabela(
    resultados
) {

    const corpo =
        document.getElementById(
            "corpoTabela"
        );


    if (
        !corpo
    ) {

        return;
    }


    corpo.innerHTML =
        "";


    if (
        !resultados ||
        resultados.length === 0
    ) {

        corpo.innerHTML = `

            <tr>

                <td
                    colspan="13"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >

                    Nenhum resultado encontrado.

                </td>

            </tr>

        `;

        return;
    }


    resultados.forEach(
        resultado => {

            const tr =
                document.createElement(
                    "tr"
                );


            const diferencaHorario =
                resultado.diferencaHorario !== null
                    ? formatarDiferencaHorario(
                        resultado.diferencaHorario
                    )
                    : "—";


            tr.innerHTML = `

                <td>
                    ${criarBadgeStatus(
                        resultado.status
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.dataPremmia ||
                        "—"
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.horaPremmia ||
                        "—"
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.dataInterno ||
                        "—"
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.horaInterno ||
                        "—"
                    )}
                </td>

                <td>
                    ${diferencaHorario}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.cliente ||
                        "—"
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.autorizacaoPremmia ||
                        "—"
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.autorizacaoInterno ||
                        "—"
                    )}
                </td>

                <td class="valor">

                    ${
                        resultado.valorPremmia !== null
                            ? formatarMoeda(
                                resultado.valorPremmia
                            )
                            : "—"
                    }

                </td>

                <td class="valor">

                    ${
                        resultado.valorInterno !== null
                            ? formatarMoeda(
                                resultado.valorInterno
                            )
                            : "—"
                    }

                </td>

                <td>

                    ${formatarDiferenca(
                        resultado.diferenca
                    )}

                </td>

                <td>

                    ${escaparHTML(
                        resultado.operador ||
                        "—"
                    )}

                </td>

            `;


            corpo.appendChild(
                tr
            );

        }
    );
}


// ==========================================
// BADGE STATUS
// ==========================================

function criarBadgeStatus(
    status
) {

    const nomes = {

        CORRETA:
            "🟢 CONFERIDA",

        CORRESPONDENCIA_DATA_HORA:
            "🔵 DATA/HORA",

        NAO_LANCADA:
            "🔴 NÃO LANÇADA",

        LANCADA_A_MAIS:
            "🟡 LANÇADA A MAIS",

        VALOR_DIVERGENTE:
            "🟠 VALOR DIVERGENTE"

    };


    const classes = {

        CORRETA:
            "status-correta",

        CORRESPONDENCIA_DATA_HORA:
            "status-correspondencia",

        NAO_LANCADA:
            "status-nao-lancada",

        LANCADA_A_MAIS:
            "status-lancada-mais",

        VALOR_DIVERGENTE:
            "status-valor-divergente"

    };


    return `

        <span
            class="status ${
                classes[status] || ""
            }"
        >

            ${
                nomes[status] ||
                status
            }

        </span>

    `;
}


// ==========================================
// FORMATAR DIFERENÇA DE HORÁRIO
// ==========================================

function formatarDiferencaHorario(
    minutos
) {

    if (
        minutos === null ||
        minutos === undefined
    ) {

        return "—";
    }


    const valor =
        Number(minutos);


    if (
        Math.abs(valor) < 0.01
    ) {

        return "0 min";
    }


    if (
        valor < 1
    ) {

        return `${Math.round(
            valor * 60
        )} seg`;
    }


    return `${valor.toFixed(1)} min`;
}


// ==========================================
// FORMATAR DIFERENÇA DE VALOR
// ==========================================

function formatarDiferenca(
    valor
) {

    const numero =
        Number(
            valor || 0
        );


    if (
        Math.abs(numero) < 0.01
    ) {

        return `

            <span class="diferenca-zero">
                R$ 0,00
            </span>

        `;
    }


    if (
        numero > 0
    ) {

        return `

            <span class="diferenca-positiva">

                ${formatarMoeda(
                    numero
                )}

            </span>

        `;
    }


    return `

        <span class="diferenca-negativa">

            ${formatarMoeda(
                numero
            )}

        </span>

    `;
}


// ==========================================
// FORMATAR MOEDA
// ==========================================

function formatarMoeda(
    valor
) {

    const numero =
        Number(
            valor || 0
        );


    return numero.toLocaleString(
        "pt-BR",
        {

            style:
                "currency",

            currency:
                "BRL"

        }
    );
}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escaparHTML(
    valor
) {

    return String(
        valor ?? ""
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


// ==========================================
// FILTROS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll(
                ".filtro"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        function () {

                            document
                                .querySelectorAll(
                                    ".filtro"
                                )
                                .forEach(
                                    item => {

                                        item.classList.remove(
                                            "ativo"
                                        );

                                    }
                                );


                            this.classList.add(
                                "ativo"
                            );


                            const filtro =
                                this.dataset.filtro;


                            // --------------------------------
                            // TODOS
                            // --------------------------------

                            if (
                                filtro === "TODOS"
                            ) {

                                renderizarTabela(
                                    resultadosConferencia
                                );

                                return;
                            }


                            // --------------------------------
                            // FILTRAR
                            // --------------------------------

                            const filtrados =
                                resultadosConferencia.filter(
                                    resultado =>
                                        resultado.status ===
                                        filtro
                                );


                            renderizarTabela(
                                filtrados
                            );

                        }
                    );

                }
            );

    }
);


// ==========================================
// DISPONIBILIZAR GLOBALMENTE
// ==========================================

window.resultadosConferencia =
    resultadosConferencia;


window.formatarMoeda =
    formatarMoeda;


window.renderizarTabela =
    renderizarTabela;


window.iniciarConferencia =
    iniciarConferencia;


window.TOLERANCIA_MINUTOS =
    TOLERANCIA_MINUTOS;
