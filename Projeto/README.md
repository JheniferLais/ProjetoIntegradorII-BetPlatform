<img width=100% src="https://capsule-render.vercel.app/api?type=waving&color=2480D3&height=120&section=header"/>

<div align="center">
    <img src="src/view/assets/logoREADME.png" alt="Logo da Wager" width="350"/>
</div>

<div align="center">
    <h1>Plataforma de Apostas em Eventos Futuros</h1>
</div>

<div align="center">
    <ul style="list-style: none; padding: 0;">
        <li><a href="#clone">Clonando</a></li>
        <li><a href="#data">Configurando Banco</a></li>
        <li><a href="#config">Configurando Variáveis</a></li>
        <li><a href="#started">Executando</a></li>
    </ul>
</div>


<details>
  <summary align="center">💻 <strong>Tecnologias</strong></summary>
  <div align="center">

• Banco de Dados Oracle e DataGrip  
• WebStorm e Visual Studio Code  
• HTML, CSS e JavaScript  
• NodeJS e Typescript

  </div>
</details>


<details>
  <summary align="center">📋 <strong>Pré-requisitos</strong></summary>
  <div align="center">

• [Structured Query Language (SQL)](https://www.oracle.com/br/database/sqldeveloper/technologies/download/)  
• [Banco de Dados Oracle](https://www.oracle.com/database/technologies/oracle21c-windows-downloads.html)  
• [WebStorm](https://www.jetbrains.com/webstorm/) ou [VSCode](https://code.visualstudio.com/)  
• [NodeJS](https://nodejs.org/pt)  
• [Git](https://git-scm.com/downloads)

  </div>
</details>



<h2 id="clone">📂 Clonando...</h2>

```bash
git clone https://github.com/JheniferLais/ProjetoIntegradorII_EngSoftware_Time8.git
```



<h2 id="data">🛢️ Configurando Banco de Dados</h2>

Execute o arquivo `Script Banco de Dados` em seu software de SQL para gerar a estrutura completa do banco de dados wager.

<p> Encontre-o em: <p>

```yaml
ProjetoIntegradorII/
└── Banco de Dados/
    ├── ...
    └── Script Banco de Dados (Oracle-SQLdeveloper)
```



<h2 id="config">⚙️ Configurando Variáveis do Ambiente .env</h2>

Use o exemplo abaixo como referência para substituir o arquivo de configuração `.env` com suas credenciais. Remova as chaves `{}` e insira suas informações reais.

```yaml
# Configurações de Banco de Dados
DATABASE_USER={YOUR_DATABASE_USER}          # Substitua pelo seu nome de usuário do banco de dados
DATABASE_PASSWORD={YOUR_DATABASE_PASSWORD}  # Substitua pela sua senha do banco de dados
DATABASE_STRING={YOUR_DATABASE_STRING}      # Substitua pelo seu string de conexão do banco de dados

# Configurações de Email
EMAIL_USERNAME={YOUR_EMAIL}                 # Substitua pelo seu endereço de email
EMAIL_PASSWORD={YOUR_EMAIL_PASSWORD_APP}    # Substitua pela senha do seu aplicativo de email
```


<h2 id="started">🚀 Executando o Projeto</h2>

<h3>Instalando as dependências</h3>

Certifique-se de esta na raíz do projeto `\Projeto`

O comando abaixo instalará todas as dependências necessárias:

```shell
npm install
```

<h3>Iniciando o servidor</h3>

Os comandos abaixo iram gerar todos os arquivos .js no diretório `build` e iniciar o servidor:

```shell
npm run build 
npm start
```

<h3>Uma alternativa...Iniciando o servidor com nodemon</h3>

O nodemon é uma alternativa que reinicia automaticamente o projeto em Node.js sempre que há alterações no código, evitando a necessidade de rodá-lo manualmente a cada mudança:

```shell
npm run dev
```

<img width=100% src="https://capsule-render.vercel.app/api?type=waving&color=2480D3&height=120&section=footer"/>