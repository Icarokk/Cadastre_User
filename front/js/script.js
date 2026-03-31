// ================= MENU =================
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("open");
}

//====================MODO NOTURNO=================

function toggleDarkMode() {
  document.body.classList.toggle("dark");

  // salva preferência
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("tema", "dark");
  } else {
    localStorage.setItem("tema", "light");
  }
}

function toggleDarkMode() {
  const body = document.body;
  const btn = document.querySelector(".btn-noturno");

  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    localStorage.setItem("tema", "dark");
    btn.textContent = "☀️";
  } else {
    localStorage.setItem("tema", "light");
    btn.textContent = "🌙";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tema = localStorage.getItem("tema");
  const btn = document.querySelector(".btn-noturno");

  if (tema === "dark") {
    document.body.classList.add("dark");
    btn.textContent = "☀️";
  }
});

// carregar tema salvo
document.addEventListener("DOMContentLoaded", () => {
  const tema = localStorage.getItem("tema");

  if (tema === "dark") {
    document.body.classList.add("dark");
  }
});

// GARANTE QUE O HTML CARREGOU
document.addEventListener("DOMContentLoaded", () => {

  // ================= PEGAR VALORES =================
  function pegarValores() {
    return {
      nome: document.getElementById("nome").value,
      sobrenome: document.getElementById("sobrenome").value,
      data_nascimento: document.getElementById("nascimento").value, // corrigido
      sexo: document.getElementById("sexo").value,
      endereco: document.getElementById("endereco").value,
      numero: document.getElementById("numero").value,
      bairro: document.getElementById("bairro").value,
      cidade: document.getElementById("cidade").value,
      uf: document.getElementById("UF").value,
      cep: document.getElementById("cep").value,
      cpf: document.getElementById("cpf").value
    };
  }
  
  /* ================= CPF ================= */
  const cpfInput = document.getElementById("cpf");
  if (cpfInput) {
    cpfInput.addEventListener("input", function(e) {
      let v = e.target.value.replace(/\D/g, "").slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, "$1.$2")
           .replace(/(\d{3})(\d)/, "$1.$2")
           .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = v;
    });
  }

  /* ================= CEP ================= */
  const cepInput = document.getElementById("cep");
  if (cepInput) {
    cepInput.addEventListener("input", function(e) {
      let v = e.target.value.replace(/\D/g, "").slice(0, 8);
      v = v.replace(/(\d{5})(\d)/, "$1-$2");
      e.target.value = v;
    });
  }

  /* ================= TELEFONE ================= */
  const numeroInput = document.getElementById("numero");
  if (numeroInput) {
    numeroInput.addEventListener("input", function(e) {
      let v = e.target.value.replace(/\D/g, "").slice(0, 11);
      v = v.replace(/(\d{2})(\d)/, "($1) $2")
           .replace(/(\d{5})(\d)/, "$1-$2");
      e.target.value = v;
    });
  }

  // ================= SUBMIT =================
  const form = document.querySelector("form");

  if (form) {
    form.addEventListener("submit", async function(e) {
      e.preventDefault();

      const dados = pegarValores();

      if (!validarFormulario(dados)) return;

      try {
        const resposta = await fetch("/usuarios", { // corrigido
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          alert("✅ " + resultado.mensagem);
          limparFormulario();
        } else {
          alert("❌ " + resultado.mensagem);
        }

      } catch (erro) {
        console.error(erro);
        alert("❌ Erro ao conectar com o servidor");
      }
    });
  }

});

/* ================= VALIDAÇÃO ================= */
function validarFormulario(dados) {

  function erro(campo, msg) {
    campo.style.border = "2px solid red";
    campo.focus();
    alert(msg);
    return false;
  }

  if (!dados.nome.trim() || /\d/.test(dados.nome))
    return erro(document.getElementById("nome"), "Nome inválido");

  if (!dados.sobrenome.trim() || /\d/.test(dados.sobrenome))
    return erro(document.getElementById("sobrenome"), "Sobrenome inválido");

  if (!dados.data_nascimento)
    return erro(document.getElementById("nascimento"), "Informe a data");

  if (!dados.endereco.trim())
    return erro(document.getElementById("endereco"), "Endereço obrigatório");

  if (!dados.numero.trim())
    return erro(document.getElementById("numero"), "Telefone obrigatório");

  // ✅ REGEX CORRETO TELEFONE
  const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  if (!telefoneRegex.test(dados.numero))
    return erro(document.getElementById("numero"), "Telefone inválido");

  if (!dados.bairro.trim())
    return erro(document.getElementById("bairro"), "Bairro obrigatório");

  if (!/^[A-Za-z]{2}$/.test(dados.uf))
    return erro(document.getElementById("UF"), "UF inválido");

  if (!dados.cidade.trim())
    return erro(document.getElementById("cidade"), "Cidade obrigatória");

  if (!/^\d{5}-\d{3}$/.test(dados.cep))
    return erro(document.getElementById("cep"), "CEP inválido");

  if (!validarCPF(dados.cpf))
    return erro(document.getElementById("cpf"), "CPF inválido");

  return true;
}

/* ================= CPF VALIDAÇÃO ================= */
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(cpf.substring(10, 11));
}

/* ================= LIMPAR ================= */
function limparFormulario() {
  document.querySelectorAll("input, select").forEach(campo => {
    if (campo.tagName === "SELECT") {
      campo.selectedIndex = 0;
    } else {
      campo.value = "";
    }
    campo.style.border = "2px solid #7b4dff";
  });
}