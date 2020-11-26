<h1 align="center">
    <a href="https://clin-paulo-lima.herokuapp.com/">Clin</a> e <a href="https://clin-dashboard.herokuapp.com/">Clin Dashboard</a>
</h1>

<p align="center">
 <a href="#sobre">Sobre</a> •
 <a href="#layout">Layout</a> • 
 <a href="#tecnologias">Tecnologias</a> • 
 <a href="#executa">Executando o projeto</a> • 
  <a href="#autores">Autores</a>
</p>

<h2 id="sobre">💻Sobre o projeto:</h2>

<p>Trata-se de um sistema que abrange duas aplicações para controle de pacientes e de profissionais que atendem estes pacientes.</p>
<p>As duas aplicações são alimentadas pela mesma API e possuem sistema de ingresso separados.</p>
<p>Na aplicação <a href="https://clin-paulo-lima.herokuapp.com/">Clin</a> os usuários, profissionais de saúde, podem acessar o sistema, verificar os dados 
dos seus paciente e modificá-los e verificar os dados de outros profissionais de saúde e modificá-los, de acordo com o seu nível de permissão. Na aplicação
<a href="https://clin-dashboard.herokuapp.com/">Clin Dashboard</a> o profissional de saúde pode apenas verificar os dados de seus pacientes e visualizá-los, 
assim como dados gerais do sistema, como quantidade total de pacientes e de profissionais cadastrados.</p>

<h2 id="layout">🎨 Layout</h2>
<div display="flex" flex-wrap="wrap" width="1000px">
  <img alt="Login" title="#Login" src="https://imgur.com/paL0IY5.png" width="500px" />
  <img alt="Dashboard" title="#Dashboard" src="https://imgur.com/02GClNn.png" />
  <img alt="Pacientes" title="#Pacientes" src="https://imgur.com/zL7AnJq.png" width="500px" />
  <img alt="cadastro" title="#cadastro" src="https://imgur.com/XyvRGuj.png" width="500px" />
  <img alt="atualizar" title="#atualizar" src="https://imgur.com/upk48pG.png" width="500px" />
  <img alt="usuarios" title="#usuarios" src="https://imgur.com/KRITuFi.png" width="500px" />
</div>

<h2 id="tecnologias">🛠 Tecnologias</h2>
<p>As seguintes tecnologias foram usadas para construir esse projeto:</p>
<ul>
  <li><a href="https://nodejs.org/en/">NodeJS</a></li>
  <li><a href="https://reactjs.org/">ReactJS</a></li>
</ul>

<h2 id="executa">🚀 Executando o projeto</h2>
<p>Para executar o projeto é necessário ter em sua máquina o conteúdo tanto do backend quanto do frontend instalados.</p>

<p>Para criar a base de dados, siga o passo a passo abaixo:</p>

<p>Primeiramente é preciso criar um banco de dados MySQL e configurar um arquivo .ENV com os dados de configuração do banco.</p>
<p>A partir daí, todo o restante do processo é automatizado e feito através do esquema de migrations do Knex.</p>
<p>Em seu terminal rode o comando:</p>
<code>yarn knex migrate:latest</code>
<p>Em seguida:</p>
<code>yarn knex seed:run</code>

<h4>Backend</h4>
<p>Para instalar o backend, siga o passo a passo abaixo:</p>

<p>git clone https://github.com/prmlimajr/clin_backend.git</p>

<p>cd clin-backend</p>

<code>yarn</code>

<p>E após a instalação:</p>
<code>yarn dev</code>

<p>O servidor inciará na porta:3333 - acesse http://localhost:3333</p>

<h4>Frontend</h4>
<p>Para instalar o frontend, siga o passo a passo abaixo:</p>

<p>git clone https://github.com/prmlimajr/clin_frontend.git</p>

<code>yarn</code>
<p>E em seguida:</p>
<code>yarn start</code>

<p>O servidor inciará na porta:3000 - acesse http://localhost:3000</p>

<h2 id="autores">😯 Autor</h2>
<a href="https://www.linkedin.com/in/prmlimajr/">Paulo Lima</a>
