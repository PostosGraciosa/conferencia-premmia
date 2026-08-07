// ==========================================
// CONFERÊNCIA PREMMIA
// app.js
// Controle geral da aplicação
// ==========================================


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Sistema Conferência Premmia iniciado."
        );


        inicializarSistema();

    }
);


// ==========================================
// INICIALIZAR SISTEMA
// ==========================================

function inicializarSistema() {


    atualizarStatusSistema(
        "Aguardando carregamento das planilhas."
    );


    configurarBotaoLimpar();


}


// ==========================================
// STATUS DO SISTEMA
// ==========================================

function atualizarStatusSistema(
    mensagem
) {

    const status =
        document.getElementById(
            "statusSistema"
        );


    if (status) {

        status.textContent =
            mensagem;

    }


    console.log(
        mensagem
    );

}


// ==========================================
// BOTÃO LIMPAR
// ==========================================

function configurarBotaoLimpar() {


    const btnLimpar =
        document.getElementById(
            "btnLimpar"
        );


    if (!btnLimpar) {

        return;

    }


    btnLimpar.addEventListener(
        "click",
        limparSistema
    );


}


// ==========================================
// LIMPAR SISTEMA
// ==========================================

function limparSistema() {


    const confirmar =
        confirm(
            "Deseja limpar a conferência atual?"
        );


    if (!confirmar) {

        return;

    }


    // Limpa arquivos

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



    // Limpa textos

    const nomes = [

        "nomePremmia",
        "nomeInterno"

    ];


    nomes.forEach(
        id => {

            const elemento =
                document.getElementById(id);


            if (elemento) {

                elemento.textContent =
                    "Nenhum arquivo selecionado";

            }

        }
    );



    // Limpa resultados

    window.resultadosConferencia = [];


    const corpoTabela =
        document.getElementById(
            "corpoTabela"
        );


    if (corpoTabela) {

        corpoTabela.innerHTML = "";

    }



    esconderResultado();



    atualizarStatusSistema(
        "Sistema limpo. Aguardando novas planilhas."
    );


}


// ==========================================
// ESCONDER RESULTADOS
// ==========================================

function esconderResultado() {


    const resultado =
        document.getElementById(
            "resultado"
        );


    if (resultado) {

        resultado.style.display =
            "none";

    }


    const tabela =
        document.getElementById(
            "tabelaResultado"
        );


    if (tabela) {

        tabela.style.display =
            "none";

    }


}


// ==========================================
// VALIDAÇÃO ANTES DA CONFERÊNCIA
// ==========================================

function validarArquivos() {


    const premmia =
        window.dadosPremmia || [];


    const interno =
        window.dadosInterno || [];



    if (
        premmia.length === 0
    ) {

        alert(
            "Carregue a planilha do Portal Premmia."
        );

        return false;

    }



    if (
        interno.length === 0
    ) {

        alert(
            "Carregue a planilha do sistema interno."
        );

        return false;

    }


    return true;

}


// ==========================================
// MONITORAMENTO DOS DADOS
// ==========================================

function atualizarContadorArquivos() {


    const quantidadePremmia =
        window.dadosPremmia?.length || 0;


    const quantidadeInterno =
        window.dadosInterno?.length || 0;



    const contador =
        document.getElementById(
            "contadorDados"
        );


    if (contador) {

        contador.textContent =
            `Premmia: ${quantidadePremmia} registros | Interno: ${quantidadeInterno} registros`;

    }


}


// ==========================================
// DISPONIBILIZA FUNÇÕES
// ==========================================

window.atualizarStatusSistema =
    atualizarStatusSistema;


window.validarArquivos =
    validarArquivos;


window.atualizarContadorArquivos =
    atualizarContadorArquivos;


window.limparSistema =
    limparSistema;
