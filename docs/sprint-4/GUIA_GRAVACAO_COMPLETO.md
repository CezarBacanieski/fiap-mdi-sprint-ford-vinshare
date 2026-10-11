# Guia completo de gravação — Ford+ VIN Share, Sprint 4

Guia operacional baseado no código presente no repositório e na auditoria local. O PDF oficial da FIAP não foi encontrado no workspace; os critérios considerados são os descritos em `MATRIZ_REQUISITOS.md` e no briefing fornecido.

## Antes de gravar: plataforma e preparação

### Onde executar

Use um emulador Android ou iOS com Metro/Expo. O projeto declara somente `ios` e `android` em `app.json`; embora exista o script `npm run web`, o projeto não declara suporte web e não tem `react-native-web` nem `@expo/metro-runtime` instalados diretamente. Portanto, não planeje a gravação no navegador: ela pode falhar antes de abrir a primeira tela.

No ambiente de desenvolvimento já preparado, abra o terminal e inicie o app com `npm run android` (ou `npm run start` e selecione o emulador disponível). Este guia não pressupõe nem executa APK/EAS. Faça um ensaio no mesmo emulador e tamanho de janela que serão usados na gravação.

### Estado de demonstração recomendado

- Faça a inicialização do app antes de gravar. Se for a primeira abertura, pressione `Continuar` duas vezes e depois `Comecar`. O onboarding fica salvo localmente.
- Mantenha os dois veículos demonstrativos do seed. A primeira tela de dashboard usa o primeiro da lista: Ranger XLS 2022, placa BRA-2E19, 42.500 km, score 78; o segundo é Territory Titanium 2023. Esses dados são fictícios e os scores são indicadores de demonstração.
- Não é necessário cadastrar outro veículo para demonstrar garagem, detalhe, dashboard ou agendamento. Assim se evita depender da API FIPE durante a tomada principal. Se o grupo decidir gravar cadastro, use os valores da tabela abaixo e digite o modelo manualmente caso a FIPE não responda.
- O seed já traz histórico e saldo local de rewards (1.850 pontos). Os serviços seed têm datas fixas de 2023–2026; algumas datas já passaram no momento da gravação. Para demonstrar um agendamento futuro, crie um novo durante o vídeo e escolha uma data útil oferecida pelo próprio seletor.
- Deixe internet disponível para a busca de modelos FIPE e para a consulta opcional de CEP ViaCEP. A lista de concessionárias, os veículos, o histórico, agenda e rewards são locais/demonstrativos.
- Não conceda nem prometa notificação para a gravação. A permissão depende do dispositivo e do ambiente; Android Expo Go não atende o fluxo. O agendamento local continua demonstrável sem notificação.
- Evite pressionar repetidamente as opções de ganhar pontos ou resgatar: elas mudam saldo e transações persistidos no armazenamento daquele app. Para restaurar o seed local, use `Perfil` → `Sair` e conclua o onboarding novamente apenas se o armazenamento ainda não tiver sido marcado como seed; o seed não sobrescreve dados já inicializados. Para uma tomada previsível de rewards, prefira mostrar o saldo, categoria, opções e histórico sem alterar valores.

### Cadastro opcional — valores demonstrativos

| Campo | Valor demonstrativo | Justificativa |
| --- | --- | --- |
| Marca | Ford | Campo fixo/desabilitado na tela |
| Modelo Ford | Ranger | Texto livre aceito; com internet, a FIPE pode sugerir resultados após dois caracteres |
| Versão | XLS 2.0 | Texto demonstrativo |
| Ano | 2024 | Opção visível na lista de anos do formulário |
| Placa | QWE1A23 | Formato Mercosul válido e fictício; não use placa real |
| Km | 12.000 | Quilometragem numérica não negativa |
| Cor | Cinza | Texto demonstrativo |
| Combustível | Diesel | Uma das opções visíveis |

O cadastro cria chassi demonstrativo e Vehicle Health Score/scores de sistemas fixos de protótipo. Não os descreva como dados verificados do veículo.

## O que explicar sobre o projeto

### Problema e solução

O desafio é fortalecer o VIN Share na América do Sul e incentivar a relação de pós-venda entre proprietários Ford e a rede oficial. O aplicativo responde a essa proposta reunindo numa experiência móvel a garagem, informações de manutenção, histórico e um fluxo demonstrativo de agendamento, além de um programa local de fidelidade. O protótipo mostra uma hipótese de experiência; ele não mede aumento de VIN Share, retenção, receita nem conversão.

O usuário vê um dashboard com veículo principal, quilometragem, Vehicle Health Score demonstrativo, manutenção recomendada e atividade recente; pode navegar pela garagem, consultar detalhe e histórico, simular novo agendamento, explorar pontos e editar perfil. FIPE fornece sugestões de modelos Ford; ViaCEP pode complementar o endereço de uma concessionária demonstrativa. Os dados do negócio ficam localmente no AsyncStorage. Não há backend Ford, login remoto, agenda corporativa, telemetria nem confirmação real da concessionária.

### Público e diferenciais que podem ser demonstrados

O público proposto é o proprietário de veículo Ford que precisa acompanhar a manutenção e encontrar o caminho para serviços da rede autorizada. A interface centraliza informações que no protótipo ficam organizadas por veículo, conecta manutenção a um fluxo de agendamento e apresenta rewards como incentivo. O diferencial verificável aqui é a jornada integrada no app e a persistência local do protótipo; não afirme que concessionárias, pontuação, benefícios ou recomendações estejam conectados a sistemas Ford.

### Tecnologias — explicação curta para a fala

| Tecnologia | O que faz e por que está aqui | Onde aparece / recurso | Frase para narrar |
| --- | --- | --- | --- |
| React Native | Cria a interface móvel usando componentes React para Android e iOS. | `app/`, `components/`; telas, cartões, listas, formulários. | “React Native permite construir a interface mobile com componentes reutilizáveis.” |
| Expo | Ferramentas e módulos para executar e integrar recursos nativos no app React Native. | `app.json`, scripts de execução, fontes, splash e Notifications. | “Expo organiza a execução e os recursos nativos do aplicativo.” |
| TypeScript | Adiciona tipos às entidades e contratos para detectar incompatibilidades durante desenvolvimento. | `types/index.ts`, hooks, services e telas. | “TypeScript tipa veículos, serviços e operações e ajuda a encontrar erros antes de executar.” |
| Expo Router | Navegação baseada na estrutura de arquivos e rotas. | `app/_layout.tsx`, `app/(tabs)/`, `app/service/`, `app/vehicle/`. | “No Expo Router, a estrutura de arquivos define as telas e os caminhos de navegação.” |
| React Native Paper | Componentes visuais de interface, como campos, botões, abas segmentadas, menus e snackbar. | `PaperProvider`, `TextInput`, `Searchbar`, `FAB`, `Snackbar`, `Switch`. | “O Paper fornece controles visuais consistentes para formulários e ações.” |
| TanStack Query | Gerencia consulta/cache assíncronos e estados de busca. | `hooks/useVehicles.ts` para modelos FIPE; `hooks/useServices.ts` para catálogo de concessionárias. | “TanStack Query controla as consultas de catálogo e evita repetir buscas a cada renderização.” |
| Axios | Cliente HTTP para chamadas às APIs públicas. | `services/api.ts`; FIPE e ViaCEP, com timeout e cabeçalho JSON. | “Axios faz as chamadas HTTP à FIPE e ao ViaCEP.” |
| AsyncStorage | Armazenamento chave-valor local no dispositivo, sem criptografia. | `services/storage.ts`, `hooks/useAuth.tsx` e perfil; onboarding, veículos, serviços, usuário, rewards e preferências. | “AsyncStorage mantém os dados locais da demonstração entre aberturas do aplicativo.” |
| Jest | Executor de testes automatizados. | `jest.config.js`, `*.test.ts` e `*.test.tsx`. | “Jest executa os testes automatizados de regras e fluxos do projeto.” |
| React Native Testing Library | Renderiza componentes/hooks em testes e verifica comportamentos pela interface. | `@testing-library/react-native` nos testes de hooks e telas. | “A Testing Library valida o que o usuário vê e faz, sem depender de teste manual para cada regra.” |

### Arquitetura em uma explicação de 20 segundos

Abra `docs/sprint-4/ARQUITETURA.md` e mostre o Mermaid renderizado, se o visualizador usado suportar. Caso contrário, mostre o arquivo no editor com zoom suficiente ou explique sobre a própria tela do app: “As telas ficam em `app/`; componentes visuais são reutilizados em `components/`; os hooks concentram operações de domínio; `services/storage.ts` persiste localmente e `services/api.ts` chama FIPE e ViaCEP; notificações locais ficam encapsuladas em outro serviço.” O fluxo é tela → hook → serviço → AsyncStorage/API → estado atualizado na tela.

## Inventário completo de telas e rotas

Rotas físicas encontradas no Expo Router. O caminho inicial depende do marcador local de onboarding.

| Tela | Arquivo | Caminho de navegação | Objetivo | Funcionalidades e ações | Dados utilizados |
| --- | --- | --- | --- | --- | --- |
| Inicialização/layout raiz | `app/_layout.tsx` | inicial; envolve todas as rotas | Preparar fontes, providers, seed e redirecionamento | Carrega Query Client, Paper, Auth, error boundary; redireciona para onboarding ou tabs. Em erro do seed há `Tentar novamente`. | AsyncStorage: onboarding e seed; fontes locais. |
| Onboarding | `app/onboarding/index.tsx` | inicial se não concluído; Perfil → `Sair` reinicia | Apresentar três telas introdutórias | `Continuar` avança; no fim aparece `Comecar`, grava onboarding concluído e abre Início. | Conteúdo estático em `constants/mockData.ts`; flag local. |
| Início/Dashboard | `app/(tabs)/index.tsx` | aba `Inicio`; pós-onboarding | Resumir veículo, manutenção e atividade | Sino limpa contador visual; `Agendar Agora`; atalhos `Agendar servico`, `Historico`, `Pontos Ford+`, `Concessionarias`; `Ver tudo`. | Usuário, veículos, serviços e recomendações locais; indicador demonstrativo. |
| Veículos/Garagem | `app/(tabs)/vehicles.tsx` | aba `Veiculos`; cards abrem detalhe | Listar e gerenciar veículos | Botão flutuante `+`; modal `Adicionar veiculo`; `Salvar`, `Cancelar`; tocar cartão abre detalhe; ícone de excluir abre confirmação `Excluir veiculo?` com `Cancelar`/`Excluir`. | Veículos em AsyncStorage; modelo pode consultar FIPE. |
| Detalhe do veículo | `app/vehicle/[id].tsx` | toque em veículo na Garagem | Exibir dados e visão de saúde do veículo | Voltar; `Ver historico completo`; `Agendar revisao`. Mostra score, placa, km, cor, chassi, saúde por sistema, recomendações, timeline. | Veículo e serviços locais; recomendações fixas simuladas. |
| Serviços | `app/(tabs)/services.tsx` | aba `Servicos`; dashboard `Historico`/`Ver tudo` | Consultar agenda local e histórico | Segmentos `Proximos`/`Historico`; puxar lista para atualizar; tocar card futuro abre detalhe; botão `+` ou `Agendar servico`. Cards de histórico expandem detalhes. | Serviços em AsyncStorage, veículos locais; concessionárias demonstrativas. |
| Novo agendamento | `app/service/new.tsx` | Início `Agendar Agora`; Serviços `+`; detalhe do veículo `Agendar revisao` | Criar registro local de serviço em três etapas | `Continuar`, selecionar veículo/tipos/km, pesquisar e selecionar concessionária, selecionar data/horário, escrever `Observacoes especiais`, `Voltar`, `Confirmar Agendamento`. | Veículos/serviços locais, catálogo mock; ViaCEP opcional; lembrete local condicional. |
| Detalhe do agendamento | `app/service/[id].tsx` | tocar card na lista `Proximos` | Mostrar dados do agendamento escolhido | Voltar; `Ver meus servicos`. Mostra status, tipo, veículo, data/hora, concessionária, detalhes, km e notas. | Serviço local. Texto de check-in é informativo demonstrativo. |
| Pontos/Rewards | `app/(tabs)/rewards.tsx` | aba `Pontos`; dashboard `Pontos Ford+` | Mostrar saldo, nível, ganhos, resgates e histórico | Cards em `COMO GANHAR PONTOS` adicionam pontos; `Resgatar` desconta se há saldo. Exibe evolução e até cinco transações. | Usuário, saldo e transações locais; catálogo de rewards e ganhos estático. |
| Perfil | `app/(tabs)/profile.tsx` | aba `Perfil` | Ver/editar informações e preferências | `Editar` alterna campos Nome/E-mail/Telefone e botão para `Salvar`; switches `Notificacoes` e `Lembrete de revisao`; tema escuro desabilitado; `Sair` reinicia onboarding. | Usuário e preferências em AsyncStorage; membros e idioma estáticos. |

### Detalhes de interação por tela

- **Inicialização:** providers envolvem o app; seed inicial só grava demonstrações na primeira preparação. Onboarding não é autenticação. Os campos de carregamento podem aparecer por um instante; espere antes de tocar.
- **Onboarding:** slides “Mantenha seu Ford em dia”, “Historico completo na palma da mao” e “Ganhe pontos e resgate beneficios”. Só há o botão `Continuar`/`Comecar`, não há login nem coleta de dados.
- **Início:** saudação, sino, veículo primário, quilometragem, anel `Vehicle Health Score`, cartão do próximo serviço, recomendações, atalhos e três atividades recentes. O cartão `Concessionarias` leva ao mesmo novo agendamento, não a um mapa/lista independente. `Agendar Agora` também abre novo agendamento.
- **Veículos:** campos reais do modal: `Marca` (fixo Ford), `Modelo Ford`, `Versao`, ano selecionável, `Placa`, `Km`, `Cor` e combustível. A busca FIPE começa após dois caracteres; escolher sugestão preenche modelo, mas o formulário também aceita texto digitado. Placa deve estar em formato brasileiro e não duplicar registro existente. Excluir é local e tem confirmação do sistema.
- **Detalhe do veículo:** score e sistema são valores do modelo local. A timeline exibe serviços concluídos daquele veículo; “historico oficial” é texto de interface e não significa integração a uma base Ford real.
- **Serviços:** `Proximos` inclui registros com status Agendado, Confirmado ou Em andamento; `Historico` contém Concluido. O rótulo “oficial” do subtítulo não altera a origem mock/local dos dados.
- **Novo agendamento:** passo 1 veículo, tipos e km; passo 2 concessionária, data útil e horário; passo 3 revisão do resumo e observações. `Buscar por nome ou bairro` filtra catálogo local. Selecionar concessionária tenta ViaCEP pelo CEP e apresenta dica se responder; com falha, usa referência local. Confirmar cria `Agendado` local e retorna à lista. Não existe reserva de slot ou confirmação de concessionária.
- **Detalhe de serviço:** não há editar/cancelar. `Ver meus servicos` retorna à aba Serviços.
- **Pontos:** os métodos disponíveis incluem revisão na rede oficial, troca de óleo, indicação, avaliação e perfil completo. No protótipo, qualquer toque adiciona o valor fixo local sem comprovação externa. Resgate também altera somente saldo/histórico locais; o botão desabilita quando o saldo é insuficiente.
- **Perfil:** `Editar` permite alterar somente nome, e-mail e telefone; CPF é mostrado mascarado. Preferências de notificação/lembrete persistem como flags locais. `Tema escuro` é mostrado mas desabilitado; idioma é fixo Português (BR). `Sair` só limpa flag do onboarding.

### O que priorizar e o que deixar fora

Mostre Dashboard, detalhe de veículo, Serviços com criação de um agendamento futuro, e Pontos com saldo/histórico. Garagem pode entrar antes do detalhe para mostrar a navegação. Se houver tempo, use Perfil em 10 segundos para registrar preferências locais. Deixe edição de perfil, exclusão, resgate/ganho de pontos, todos os cards de histórico, configurações de notificação e onboarding completo fora da tomada principal: consomem tempo ou alteram estado persistido. Não demonstre notificações, rede de concessionárias real, confirmação externa, diagnóstico, mapa ou login.

## Demonstração guiada — instruções durante a gravação

Os tempos desta parte reservam 2:05. Faça ensaio antes: escolha os elementos mais importantes da rolagem para não correr. Os nomes aparecem sem acentos em parte da interface conforme as strings no código; confira visualmente o texto que o build realmente renderizar.

### PASSO 1 — ABRIR O DASHBOARD

**Tempo estimado:** 01:15–01:35

**Onde estou:** `Inicio` (rota `/(tabs)`).

**Onde clicar:** Nenhum clique além de `Inicio` se o app não abrir nesta aba. Se aparecer onboarding, pressione `Continuar` duas vezes e `Comecar` antes de iniciar a gravação oficial.

**O que fazer:** Espere os skeletons sumirem. Enquadre o cartão do primeiro veículo e o resumo de manutenção. Faça uma rolagem curta até `PROXIMAS MANUTENCOES`.

**O que deve aparecer:** Ranger XLS, ano/placa, km, anel de `Vehicle Health Score`, alerta do próximo serviço, recomendações, atalhos e atividade recente.

**O que falar:** “Na tela inicial, o proprietário acompanha o veículo principal, quilometragem e um indicador demonstrativo de saúde. Também encontra recomendações e acessos rápidos para histórico, agendamento e pontos.”

**O que essa funcionalidade demonstra:** Contextualiza o pós-venda numa visão única e mostra composição de dados locais por hooks.

**Arquivo relacionado:** `app/(tabs)/index.tsx`, `components/ui/ProgressRing.tsx`, `hooks/useVehicles.ts`, `hooks/useServices.ts`.

**Observações:** Não chame o score de diagnóstico ou telemetria. As datas seed são fixas e podem estar no passado; não leia a data do card como agenda atual.

### PASSO 2 — GARAGEM E DETALHE DO VEÍCULO

**Tempo estimado:** 01:35–01:58

**Onde estou:** Dashboard; depois aba `Veiculos` e rota `/vehicle/[id]`.

**Onde clicar:** Toque na aba `Veiculos`; toque no card `Ranger XLS`.

**O que fazer:** Mostre rapidamente a lista e abra o primeiro veículo. Desça até `SAUDE POR SISTEMA` e `RECOMENDACOES`; encerre com um enquadramento da linha do tempo, sem entrar em cada registro.

**O que deve aparecer:** Na garagem, os dois veículos do seed. No detalhe, dados gerais, score, motor/freios/pneus/suspensão/ar/fluidos, recomendações e histórico local. A tela oferece `Ver historico completo` e `Agendar revisao`.

**O que falar:** “A garagem permite navegar pelos veículos cadastrados. No detalhe, mostramos os dados de cada veículo e organizamos indicadores por sistema, recomendações e serviços concluídos. Nesta versão, esses indicadores e o histórico são demonstração local.”

**O que essa funcionalidade demonstra:** Navegação dinâmica por ID, lista de veículos persistidos e apresentação relacionada de manutenção.

**Arquivo relacionado:** `app/(tabs)/vehicles.tsx`, `app/vehicle/[id].tsx`, `components/ui/VehicleCard.tsx`, `components/ui/HealthBar.tsx`, `components/charts/MaintenanceChart.tsx`.

**Observações:** Não use `+` nesta tomada se a conexão FIPE estiver instável; cadastro não é necessário para demonstrar o fluxo principal.

### PASSO 3 — CRIAR AGENDAMENTO LOCAL

**Tempo estimado:** 01:58–02:38

**Onde estou:** Detalhe do veículo.

**Onde clicar:** `Agendar revisao` (atalho mais direto). Na primeira etapa, confirme Ranger e km 42.500; escolha `Revisao Preventiva`; pressione `Continuar`. Na segunda etapa, toque numa concessionária demonstrativa (por exemplo, Ford Saraiva - Tatuape), selecione uma data útil futura exibida e um horário (por exemplo, `10:00`); pressione `Continuar`. Na terceira etapa, revise e pressione `Confirmar Agendamento`.

**O que fazer:** Fale enquanto percorre os três passos. Não dependa de ViaCEP: se a dica de endereço não aparecer, continue. No resumo, não digite observações pessoais. Aguarde a mensagem de criação e retorno automático para `Servicos`.

**O que deve aparecer:** Resumo de veículo, serviço, data/hora, concessionária e km; depois o registro aparece na lista `Proximos` com status `Agendado`.

**O que falar:** “O fluxo organiza veículo, tipo de serviço, concessionária demonstrativa e disponibilidade de data e horário. Ao confirmar, criamos um registro local para a demonstração. A seleção não consulta a agenda real nem confirma um horário com uma concessionária.”

**O que essa funcionalidade demonstra:** Formulário em etapas, validação no fluxo, gravação local e atualização da lista.

**Arquivo relacionado:** `app/service/new.tsx`, `hooks/useServices.ts`, `services/storage.ts`, `services/api.ts`.

**Observações:** A data é gerada a partir do dia em que a tela abre; escolha uma data útil futura realmente visível, não uma data decorada de antemão. ViaCEP é opcional. A mensagem informa se lembrete pôde ser agendado; não prometa a notificação.

### PASSO 4 — MOSTRAR REWARDS

**Tempo estimado:** 02:38–03:05

**Onde estou:** Aba `Servicos` após o agendamento; depois aba `Pontos`.

**Onde clicar:** Toque em `Pontos` na barra inferior.

**O que fazer:** Enquadre `SALDO FORD+`, categoria e progresso; role até `RESGATAR BENEFICIOS` e `HISTORICO DE PONTOS`. Não pressione `Resgatar` nem um método de ganho durante a tomada principal.

**O que deve aparecer:** Saldo seed de 1.850 pontos, categoria Prata, catálogo de benefícios e transações locais. O cartão de 1.500 pontos deve estar disponível conforme o saldo; opções acima do saldo ficam desabilitadas.

**O que falar:** “O módulo de fidelidade apresenta saldo, categoria, formas previstas de ganhar pontos, benefícios e histórico. Nesta versão, as regras e transações são locais e demonstrativas, sem integração a um programa real.”

**O que essa funcionalidade demonstra:** Uma jornada de incentivo ligada conceitualmente ao pós-venda, com atualização persistida em AsyncStorage.

**Arquivo relacionado:** `app/(tabs)/rewards.tsx`, `components/ui/RewardCard.tsx`, `hooks/useRewards.ts`, `services/storage.ts`.

**Observações:** Saldo pode variar se essa instalação já foi usada. Não restaure o app sem ensaiar, pois o seed só roda uma vez e logout não apaga os dados locais.

### PASSO 5 — TRANSIÇÃO PARA A EXPLICAÇÃO TÉCNICA

**Tempo estimado:** 03:05–03:20

**Onde estou:** Aba `Pontos`, depois editor com `docs/sprint-4/ARQUITETURA.md`.

**Onde clicar:** Se o gráfico e histórico estiverem visíveis, faça uma última rolagem curta e alterne para o editor previamente aberto no arquivo da arquitetura.

**O que fazer:** Deixe o diagrama Mermaid em tela e ajuste o zoom antes da gravação.

**O que deve aparecer:** Telas → hooks → serviços, ramificações para AsyncStorage, APIs públicas e notificações locais.

**O que falar:** “Agora eu mostro como as partes se conectam: a interface aciona os hooks de domínio, que usam serviços para persistir dados localmente ou consultar as duas APIs públicas.”

**O que essa funcionalidade demonstra:** Organização das responsabilidades implementada no repositório.

**Arquivo relacionado:** `docs/sprint-4/ARQUITETURA.md`.

**Observações:** Se o editor não renderizar Mermaid, deixe o código e explique as camadas verbalmente. O diagrama não inclui backend porque o projeto não possui um.

## Roteiro cronometrado, fala integral

Duração-alvo: 5:40 de fala, com até cinco segundos para transições (término planejado em 5:45). Ensaie com cronômetro e retire pausas, sem acelerar a fala. A demonstração guiada acima ocupa 01:15–03:20.

### BLOCO 1 — INTRODUÇÃO E PROBLEMA — 00:00–00:35

**Tela:** título Ford+ VIN Share; em seguida, dashboard por volta de 00:12.

**Fala:** “Olá, somos a equipe do Ford+. No desafio de VIN Share, o contexto é fortalecer o relacionamento entre proprietários Ford e a rede oficial de pós-venda. Para o cliente, acompanhar manutenção e encontrar o próximo serviço pode ficar espalhado entre canais. Nossa proposta explora uma jornada móvel que reúne essas informações. O que veremos é um protótipo acadêmico, sem métricas de impacto comercial.”

### BLOCO 2 — SOLUÇÃO PROPOSTA — 00:35–01:15

**Tela:** dashboard; depois garagem.

**Fala:** “O Ford+ foi pensado para proprietários Ford que querem organizar o acompanhamento do veículo. No dashboard, o app reúne veículo principal, quilometragem, recomendações demonstrativas e atividade. Na garagem, cada veículo tem uma tela de detalhe; em Serviços, o usuário percorre um agendamento demonstrativo; em Pontos, consulta saldo e benefícios simulados. A proposta é conectar conveniência, pós-venda e incentivo numa experiência. Os dados apresentados aqui são locais, e as concessionárias não representam agenda real.”

### BLOCO 3 — DEMONSTRAÇÃO PRÁTICA — 01:15–03:20

**Tela e ação:** execute os PASSOS 1 a 5 desta seção. Reserve Dashboard 20 s, garagem/detalhe 23 s, agendamento 40 s, rewards 27 s e transição 15 s.

**Fala:** use o texto “O que falar” em cada passo. Evite improvisar sobre disponibilidade real, estado mecânico ou confirmação de atendimento.

### BLOCO 4 — TECNOLOGIAS E ARQUITETURA — 03:20–04:35

**Tela:** `docs/sprint-4/ARQUITETURA.md` e, se couber, `package.json` para stack.

**Fala:** “A interface foi construída com React Native e Expo, e TypeScript descreve os contratos de veículo, serviço e usuário. Expo Router organiza as rotas pelos arquivos em `app/`. React Native Paper fornece controles de formulário e navegação visual. As telas chamam hooks de domínio; esses hooks mantêm o estado e chamam os serviços. AsyncStorage persiste os dados de demonstração no dispositivo. Axios consulta a FIPE para modelos e ViaCEP para endereço; TanStack Query controla essas consultas e seu cache. O catálogo de concessionárias é local. Jest e React Native Testing Library verificam regras e comportamentos em testes. Notificações, quando suportadas e autorizadas, são locais; não há push remoto.”

**Orientação de tela:** aponte para a interface/telas, hooks e serviços no diagrama, seguindo o fluxo. Evite abrir vários arquivos em sequência; o diagrama basta e `package.json` serve como comprovação da stack.

### BLOCO 5 — QUALIDADE E LIMITES — 04:35–05:20

**Tela:** `docs/sprint-4/AUDITORIA_TECNICA.md`, tabela “Verificações executadas”.

**Fala:** “Na validação local, o TypeScript passou; a suíte teve 31 testes aprovados em 8 suítes; o Expo Doctor aprovou 21 de 21 verificações; e o bundle Android foi exportado. Exportar o bundle não equivale a gerar, instalar e testar um APK, então não apresentamos smoke test físico como concluído. O armazenamento é local e não criptografado; os indicadores, rewards, serviços e concessionárias são demonstrativos. FIPE e ViaCEP são as únicas APIs externas identificadas. O app não possui backend, integração corporativa Ford, telemetria, mapa ou confirmação real de agenda.”

**Orientação de tela:** deixe a tabela legível. Não abra o terminal para executar comandos durante a tomada; os resultados já estão documentados.

### BLOCO 6 — ENCERRAMENTO — 05:20–05:45

**Tela:** voltar ao dashboard ou tela final com o nome do grupo.

**Fala:** “O Ford+ transforma a proposta do desafio em uma jornada demonstrável para organizar veículos, manutenção, serviços e fidelidade. O próximo passo de evolução seria validar a experiência com usuários e, mediante integrações oficiais e requisitos próprios, conectar agenda e dados reais. Obrigado.”

Não diga que esse próximo passo já foi implementado. Se houver entregáveis multidisciplinares reais, cite-os aqui em uma frase objetiva; não invente artefatos.

## Checklist de gravação

- [ ] Rodar o ensaio completo no mesmo emulador e conferir duração abaixo de seis minutos.
- [ ] Fechar notificações do sistema, banners e janelas que possam cobrir a interface.
- [ ] Confirmar que o onboarding já foi concluído e que o seed/saldo estão no estado desejado.
- [ ] Abrir previamente `ARQUITETURA.md` e `AUDITORIA_TECNICA.md` no editor com zoom legível.
- [ ] Confirmar que o emulador está conectado e o app carregou antes de iniciar a captura.
- [ ] No agendamento, selecionar data futura útil visível no próprio seletor.
- [ ] Não afirmar que endereço ViaCEP, slot, lembrete, benefício ou agendamento foram confirmados por uma concessionária.
- [ ] Gravar uma tomada de ensaio, ouvir o áudio e conferir texto pequeno/legibilidade.
- [ ] Cronometrar a versão final: alvo 5:40; máximo absoluto 6:00.
- [ ] Assistir ao vídeo completo e confirmar que o link final abre para avaliadores.
- [ ] Enviar o mesmo link às disciplinas participantes no Teams e guardar evidências.
