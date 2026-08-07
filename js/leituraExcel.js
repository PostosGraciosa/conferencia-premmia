// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// Leitura das planilhas Excel / CSV
// ==========================================


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
// DADOS GLOBAIS
// ==========================================

let dadosPremmia = [];

let dadosInterno = [];



// ==========================================
// EVENTO ARQUIVO PREMMIA
// ==========================================

if(arquivoPremmia){


    arquivoPremmia.addEventListener(
        "change",
        function(){


            if(this.files.length){


                nomePremmia.textContent =
                    "Arquivo selecionado: " +
                    this.files[0].name;


                nomePremmia.style.color =
                    "#006b3c";


                lerArquivoPremmia(
                    this.files[0]
                );


            }


            verificarArquivos();


        }
    );


}




// ==========================================
// EVENTO ARQUIVO INTERNO
// ==========================================


if(arquivoInterno){


    arquivoInterno.addEventListener(
        "change",
        function(){


            if(this.files.length){


                nomeInterno.textContent =
                    "Arquivo selecionado: " +
                    this.files[0].name;


                nomeInterno.style.color =
                    "#006b3c";


                lerArquivoInterno(
                    this.files[0]
                );


            }


            verificarArquivos();


        }
    );


}




// ==========================================
// VERIFICAR ARQUIVOS
// ==========================================


function verificarArquivos(){


    if(!btnConferir)
        return;



    if(
        arquivoPremmia &&
        arquivoInterno &&
        arquivoPremmia.files.length > 0 &&
        arquivoInterno.files.length > 0 &&
        dadosPremmia.length > 0 &&
        dadosInterno.length > 0
    ){


        btnConferir.disabled = false;


    }else{


        btnConferir.disabled = true;


    }


    atualizarContador();


}




// ==========================================
// LER PREMMIA
// ==========================================


function lerArquivoPremmia(file){


    const reader =
        new FileReader();



    reader.onload =
    function(e){


        try{


            const dados =
                new Uint8Array(
                    e.target.result
                );



            const workbook =
                XLSX.read(
                    dados,
                    {
                        type:"array",
                        cellDates:true
                    }
                );



            const aba =
                workbook.SheetNames[0];



            const planilha =
                workbook.Sheets[aba];



            const linhas =
                XLSX.utils.sheet_to_json(
                    planilha,
                    {
                        header:1,
                        defval:""
                    }
                );



            dadosPremmia =
                transformarPremmia(
                    linhas
                );



            window.dadosPremmia =
                dadosPremmia;



            console.log(
                "Premmia:",
                dadosPremmia
            );



            verificarArquivos();



        }
        catch(err){


            console.error(err);


            alert(
                "Erro ao carregar Portal Premmia."
            );


        }



    };



    reader.readAsArrayBuffer(file);


}




// ==========================================
// LER SISTEMA INTERNO
// ==========================================


function lerArquivoInterno(file){


    const reader =
        new FileReader();



    reader.onload =
    function(e){


        try{


            const dados =
                new Uint8Array(
                    e.target.result
                );



            const workbook =
                XLSX.read(
                    dados,
                    {
                        type:"array",
                        cellDates:true
                    }
                );



            const aba =
                workbook.SheetNames[0];



            const planilha =
                workbook.Sheets[aba];



            const linhas =
                XLSX.utils.sheet_to_json(
                    planilha,
                    {
                        header:1,
                        defval:""
                    }
                );



            dadosInterno =
                transformarInterno(
                    linhas
                );



            window.dadosInterno =
                dadosInterno;



            console.log(
                "Interno:",
                dadosInterno
            );



            verificarArquivos();



        }
        catch(err){


            console.error(err);


            alert(
                "Erro ao carregar sistema interno."
            );


        }



    };



    reader.readAsArrayBuffer(file);


}
