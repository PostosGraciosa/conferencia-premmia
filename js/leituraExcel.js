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
                nomePremmia.textContent = file.name;
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
                nomeInterno.textContent = file.name;
            }

            lerInterno(file);

        }
    );

}


// ==========================================
// ABRIR EXCEL
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

        } catch (erro) {

            console.error(
                "Erro ao abrir planilha:",
                erro
            );

            alert(
                "Não foi possível ler a planilha."
            );

        }

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

            console.log(
                "Planilha Premmia carregada:",
                linhas
            );

            dadosPremmia =
                transformarPremmia(linhas);

            window.dadosPremmia =
                dadosPremmia;

            console.log(
                "Premmia:",
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

    abrirExcel(
        file,
        function (linhas) {

            console.log(
                "Planilha interna carregada:",
                linhas
            );

            dadosInterno =
                transformarInterno(linhas);

            window.dadosInterno =
                dadosInterno;

            console.log(
                "Interno:",
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

function transformarPremmia(linhas) {

    const registros = [];

    linhas.forEach(
        (linha, index) => {

            if (!Array.isArray(linha)) {
                return;
            }

            // pula cabeçalho
            if (index === 0) {
                return;
            }

            if (linha.length < 7) {
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
                    converterValor(
                        linha[3]
                    ),


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


            if (
                registro.autorizacao &&
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
//
// ESTRUTURA INFORMADA:
//
// A Administradora
// B Valor
// C Horário
// D Movimento
// E Data Fiscal
// F Bom Para
// G Valor Líquido
// H Cliente
// I Filial
// J Funcionário
// K Tipo Inclusão
// L C. de Custo
// M Autorização
//
// O ARQUIVO ESTÁ CHEGANDO COM UMA COLUNA
// INICIAL EXTRA/VÁZIA.
//
// POR ISSO:
//
// linha[0] = coluna extra
// linha[1] = Administradora
// linha[2] = Valor
// linha[3] = Horário
// linha[4] = Movimento
// linha[5] = Data Fiscal
// linha[6] = Bom Para
// linha[7] = Valor Líquido
// linha[8] = Cliente
// linha[9] = Filial
// linha[10] = Funcionário
// linha[11] = Tipo Inclusão
// linha[12] = C. de Custo
// linha[13] = Autorização
//
// ==========================================

function transformarInterno(linhas) {

    const registros = [];


    linhas.forEach(
        (linha, index) => {

            if (!Array.isArray(linha)) {
                return;
            }


            // ==================================
            // MOSTRA PRIMEIRAS LINHAS
            // PARA CONFERÊNCIA
            // ==================================

            if (index <= 2) {

                console.log(
                    "LINHA INTERNA BRUTA " + index + ":",
                    linha
                );

            }


            // pula cabeçalho

            if (index === 0) {
                return;
            }


            // ==================================
            // IGNORA LINHAS VAZIAS
            // ==================================

            if (
                linha.every(
                    valor =>
                        valor === "" ||
                        valor === null ||
                        valor === undefined
                )
            ) {

                return;

            }


            // ==================================
            // DADOS
            // ==================================

            const registro = {

                origem:
                    "INTERNO",


                administradora:
                    limparTexto(
                        linha[1]
                    ),


                valor:
                    converterValor(
                        linha[2]
                    ),


                hora:
                    limparTexto(
                        linha[3]
                    ),


                movimento:
                    limparTexto(
                        linha[4]
                    ),


                data:
                    limparTexto(
                        linha[5]
                    ),


                bomPara:
                    limparTexto(
                        linha[6]
                    ),


                valorLiquido:
                    converterValor(
                        linha[7]
                    ),


                cliente:
                    limparTexto(
                        linha[8]
                    ),


                filial:
                    limparTexto(
                        linha[9]
                    ),


                operador:
                    limparTexto(
                        linha[10]
                    ),


                tipo:
                    limparTexto(
                        linha[11]
                    ),


                centroCusto:
                    limparTexto(
                        linha[12]
                    ),


                autorizacao:
                    normalizarAutorizacao(
                        linha[13]
                    )

            };


            console.log(
                "Linha interna interpretada:",
                registro
            );


            // ==================================
            // ACEITA REGISTRO
            // ==================================

            // O sistema interno pode ter registros
            // sem autorização, especialmente em
            // Vale/Desconto.
            //
            // Portanto NÃO vamos exigir autorização.
            //
            // O que precisamos é ter valor.

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

        .toUpperCase()

        // remove espaços
        .replace(/\s/g, "")

        // remove .0 somente no final
        .replace(/\.0$/, "")

        // remove caracteres especiais
        .replace(/[^\w]/g, "");

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


    // ==================================
    // NÚMERO
    // ==================================

    if (
        typeof valor === "number"
    ) {

        return Number(
            valor.toFixed(2)
        );

    }


    // ==================================
    // DATA DO EXCEL
    // NÃO É VALOR
    // ==================================

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


    // remove R$
    texto =
        texto.replace(
            /R\$/gi,
            ""
        );


    texto =
        texto.trim();


    // ==================================
    // FORMATO BRASILEIRO
    //
    // 2,50
    // 1.250,50
    // ==================================

    if (
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

    }

    // ==================================
    // FORMATO
    //
    // 2.50
    // ==================================

    else {

        // mantém ponto decimal

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
// DATA
// ==========================================

function extrairData(valor) {

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

function extrairHora(valor) {

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


    const resultado =
        texto.match(
            /\d{1,2}:\d{2}/
        );


    if (resultado) {

        return resultado[0];

    }


    return "";

}


// ==========================================
// VERIFICAR ARQUIVOS
// ==========================================

function verificarArquivos() {

    console.log(
        "Verificando:",
        dadosPremmia.length,
        dadosInterno.length
    );


    if (
        dadosPremmia.length > 0 &&
        dadosInterno.length > 0
    ) {

        if (btnConferir) {

            btnConferir.disabled =
                false;

        }


        atualizarStatus(
            "Planilhas carregadas. Pronto para conferir."
        );


        console.log(
            "BOTÃO CONFERIR HABILITADO"
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
            "Aguardando planilhas"
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


    contador.innerHTML = `

        Premmia:
        <strong>
            ${dadosPremmia.length}
        </strong>
        registros

        &nbsp; | &nbsp;

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


console.log(
    "leituraExcel.js completo carregado"
);
