<div align="center">

# Ford+

### Seu Ford, sempre em dia.

Aplicativo mobile desenvolvido para fortalecer o relacionamento entre clientes Ford e a rede oficial de concessionárias, aumentando retenção, recorrência de serviços e engajamento no pós-venda.

<br/>

![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK%2055-000020?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

# 📖 Sobre o Projeto

O **Ford+** é uma solução mobile desenvolvida para o **Challenge 02 da FIAP em parceria com a Ford Brasil**, dentro do tema:

> **Boosting VIN Share in South America with Intelligent Solutions**

O conceito de **VIN Share** representa a porcentagem de veículos Ford que retornam à rede oficial de concessionárias para manutenção e serviços de pós-venda.

O objetivo do Ford+ é aumentar essa retenção por meio de uma experiência digital moderna, centralizada e recorrente, conectando o cliente à Ford durante toda a jornada de propriedade do veículo.

O aplicativo transforma o pós-venda em uma experiência contínua, oferecendo:

- acompanhamento da saúde do veículo;
- histórico de manutenção;
- agendamento inteligente;
- notificações preventivas;
- programa de fidelidade;
- benefícios exclusivos.

A proposta foi desenhada para aproximar a Ford do momento real de uso do cliente, incentivando o retorno à rede autorizada de maneira prática e estratégica.

---

# ✨ Principais Funcionalidades

## 🚗 Gestão do Veículo

- Dashboard premium com informações do veículo principal;
- Vehicle Health Score (pontuação de saúde do veículo);
- Controle de quilometragem;
- Breakdown de sistemas:
  - motor;
  - freios;
  - pneus;
  - suspensão;
  - ar-condicionado;
  - fluidos.

## 🔔 Experiência Inteligente

- Alertas de manutenção preventiva;
- Notificações locais com Expo Notifications;
- Lembretes de revisão;
- Avisos de benefícios e recompensas.

## 📅 Pós-venda e Serviços

- Histórico completo de serviços realizados;
- Agendamento em múltiplas etapas;
- Seleção de:
  - veículo;
  - serviço;
  - concessionária;
  - data;
  - horário.

## 🏆 Fidelização

- Sistema Ford+ Rewards;
- Acúmulo de pontos;
- Níveis de fidelidade;
- Histórico de recompensas;
- Resgate de benefícios exclusivos.

## 🏢 Rede de Concessionárias

- Lista de concessionárias Ford;
- Distância e avaliação;
- Horários de funcionamento;
- Estrutura preparada para geolocalização futura.

---

# 🛠️ Stack Tecnológica

| Tecnologia | Objetivo |
|---|---|
| React Native | Desenvolvimento mobile cross-platform |
| Expo | Ecossistema e ferramentas de desenvolvimento |
| TypeScript | Tipagem estática e escalabilidade |
| Expo Router | Navegação baseada em arquivos |
| React Query | Gerenciamento de cache e requisições |
| AsyncStorage | Persistência local de dados |
| FIPE API | Consulta de modelos Ford |
| ViaCEP | Estrutura de consulta de endereços |

---

# 🏗️ Arquitetura do Projeto

O projeto foi estruturado com foco em:

- escalabilidade;
- reutilização de componentes;
- separação de responsabilidades;
- facilidade de manutenção.

## Estrutura principal

```bash
app/
 ├── (tabs)/
 ├── vehicle/[id]
 ├── service/*
components/
 ├── ui/
 ├── charts/
hooks/
services/
storage/
````

## Decisões Técnicas

### React Native + Expo

Permite entregar uma experiência consistente para iOS e Android utilizando uma única base de código.

### Expo Router

Organiza a navegação através de rotas baseadas em arquivos, facilitando manutenção e escalabilidade.

### React Query

Centraliza:

* cache;
* loading;
* sincronização;
* tratamento de erros das APIs externas.

### AsyncStorage

Viabiliza persistência local para o MVP sem necessidade de backend dedicado.

---

# 🔌 Integrações Externas

## FIPE API

Consulta de modelos Ford reais:

```http
GET /carros/marcas/26/modelos
```

## ViaCEP

Estrutura de enriquecimento de endereços via CEP.

## Expo Notifications

Sistema de notificações locais para:

* lembretes de manutenção;
* alertas;
* recompensas.

---

# 📱 Demonstração

## 🎥 Vídeo Demonstrativo

Veja o Ford+ em funcionamento:

<a href="https://youtube.com/shorts/XM4Dn7UZGRs?feature=share">
  <img src="https://img.youtube.com/vi/XM4Dn7UZGRs/hqdefault.jpg" width="420" alt="Vídeo demonstrativo do Ford+">
</a>

<br/>

👉 [Assistir demonstração completa](https://youtube.com/shorts/XM4Dn7UZGRs?feature=share)

---

## 🎥 Vídeo Explicativo

Explicando o Ford+ :

<a href="https://youtu.be/nqJf0cdi8Ds?si=pIM6Dl0LUz8Nr8xH">
  <img src="https://img.youtube.com/vi/nqJf0cdi8Ds/hqdefault.jpg" width="420" alt="Vídeo demonstrativo do Ford+">
</a>

<br/>

👉 [Assistir demonstração completa](https://youtu.be/nqJf0cdi8Ds?si=pIM6Dl0LUz8Nr8xH)

# 🖼️ Screenshots do Aplicativo

<div align="center">

| Home                                                                                | Serviços                                                                    | Perfil                                                                             |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203529.png" width="220"> | <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203618.png" width="220"> | <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203719.png" width="220"> |

| Meus Veículos                                                                         | Pontos                                                                           | Agendamento                                                                     |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203555.png" width="220"> | <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203653.png" width="220"> | <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203756.png" width="220"> |

</div>

---

# 🚀 Como Executar o Projeto

## Pré-requisitos

* Node.js LTS
* npm
* Expo Go ou emulador Android/iOS

## Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Acesse a pasta
cd fiap-mdi-sprint-ford-vinshare

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

Depois disso:

* escaneie o QR Code com o Expo Go;
* ou pressione:

  * `a` para Android;
  * `i` para iOS.

---

# 🎯 Objetivo Estratégico

O Ford+ foi concebido para atuar diretamente nos principais fatores que impactam o VIN Share:

* aumento da recorrência de manutenção;
* fortalecimento do relacionamento pós-venda;
* fidelização do cliente;
* incentivo ao retorno à rede oficial;
* criação de recorrência digital.

A proposta combina:

* experiência do usuário;
* estratégia de negócio;
* retenção;
* tecnologia mobile;
* gamificação.

---

# 🔮 Próximos Passos

* Backend com Node.js + PostgreSQL;
* Integração real com APIs Ford;
* Push Notifications via FCM/APNs;
* Autenticação biométrica;
* Geolocalização em tempo real;
* Mapa de concessionárias próximas;
* Sistema de diagnósticos inteligentes;
* Inspeção assistida com realidade aumentada (AR).

---

# 👥 Integrantes

| Nome                    | RM        |
| ----------------------- | --------- |
| Milton Cezar Bacanieski | RM 555206 |
| Victório Bastelli       | RM 554723 |
| Lorenzo Mangini         | RM 554901 |
| Vitor Bebiano           | RM 555026 |

---

# 📩 Contato

**Professor responsável:**
[profhercules.ramos@fiap.com.br](mailto:profhercules.ramos@fiap.com.br)

---

<div align="center">

### Ford+ • FIAP x Ford Brasil Challenge 2026

Tecnologia, experiência e fidelização no pós-venda automotivo.

</div>
```



## Resumo completo da branch de cyber

O commit **“sprint cybersecurity”** implementa uma camada ampla de segurança no aplicativo Ford+, abrangendo autenticação, autorização, proteção de APIs, validação de dados, armazenamento criptografado, logs de auditoria, testes automatizados e integração com ferramentas DevSecOps.

**Estatísticas do commit:**

- **2.901 linhas adicionadas**
- **114 linhas removidas**
- **3.015 alterações no total**
- Commit: [`4857c8607c1ffddc2d7854cd089b72b71951f8a1`](https://github.com/CezarBacanieski/fiap-mdi-sprint-ford-vinshare/commit/4857c8607c1ffddc2d7854cd089b72b71951f8a1)

---

# 1. Novo sistema de autenticação

Foi criado um fluxo completo de autenticação segura, com:

- Tela de login em `app/sign-in.tsx`.
- Login com e-mail e senha.
- Política de senha forte:
  - mínimo de 12 caracteres;
  - letras maiúsculas;
  - letras minúsculas;
  - números;
  - caracteres especiais.
- Geração de access token e refresh token.
- Access token com duração curta de 15 minutos.
- Refresh token com duração de 7 dias.
- Rotação obrigatória do refresh token.
- Bloqueio contra reutilização de refresh token.
- Revogação de sessão durante logout.
- Bloqueio temporário após várias tentativas inválidas.
- Limitação de tentativas de login por dispositivo e usuário.
- Mensagens genéricas para evitar enumeração de usuários.
- Cookies `HttpOnly`, `Secure` e `SameSite=Strict` nas APIs de autenticação.

Foram adicionados os endpoints:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `DELETE /api/auth/revoke`

A implementação principal está em `security/auth.ts`.

---

# 2. Controle de acesso baseado em papéis — RBAC

Foi criado um sistema de autorização com três papéis:

- `admin`
- `analyst`
- `user`

Também foram definidas permissões específicas, como:

- `vehicle:view`
- `vehicle:create`
- `vehicle:delete`
- `service:create`
- `service:view`
- `profile:update`
- `rewards:redeem`
- `security:admin`

As permissões foram centralizadas em `security/permissions.ts`.

O controle passou a ser aplicado em diferentes áreas:

- Cadastro de veículos.
- Remoção de veículos.
- Criação de serviços.
- Atualização de perfil.
- Consulta de auditoria administrativa.
- Acesso aos endpoints de veículos.

O endpoint `GET /api/admin/audit` passou a exigir um usuário com a permissão `security:admin`.

---

# 3. Proteção das APIs

Foi adicionada uma estrutura centralizada para proteger as rotas da API em `app/api/_lib/http.ts`.

Os controles incluem:

- CORS com lista de origens permitidas.
- Validação de origem.
- Proteção CSRF para operações de escrita.
- Rate limiting por endereço IP.
- Limite de tamanho de payload.
- Tratamento seguro de JSON inválido.
- Proteção contra prototype pollution.
- Bloqueio das chaves:
  - `__proto__`;
  - `prototype`;
  - `constructor`.
- Geração de `X-Request-ID`.
- Geração de `X-Correlation-ID`.
- Tratamento padronizado de erros.
- Ocultação de mensagens internas e stack traces.
- Cache desabilitado para respostas sensíveis.
- Verificação parcial de HTTPS usando `x-forwarded-proto`.

Também foram adicionados headers de segurança, incluindo:

- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `Content-Security-Policy`
- `Cache-Control: no-store`

---

# 4. Assinatura HMAC dos payloads

O arquivo `app/api/_lib/payloadSignature.ts` adiciona assinatura de payload usando **HMAC-SHA256**.

Essa funcionalidade permite:

- Gerar uma assinatura para o corpo da requisição.
- Verificar se o payload foi alterado.
- Rejeitar requisições com assinatura ausente.
- Rejeitar requisições com assinatura inválida.
- Comparar assinaturas usando comparação em tempo constante.

A chave utilizada é obtida da variável de ambiente:

```env
API_HMAC_SECRET
```

Essa proteção foi aplicada principalmente aos endpoints de:

- Login.
- Refresh de sessão.
- Revogação de sessão.
- Criação de veículos.

---

# 5. Validação e sanitização de entradas

Foram criados os arquivos:

- `security/sanitization.ts`
- `security/validation.ts`

As entradas passaram a ser normalizadas e validadas contra:

- XSS.
- SQL Injection.
- Path Traversal.
- Command Injection.
- Caracteres de controle.
- Payloads muito grandes.
- Formatos inválidos.
- Valores numéricos fora do intervalo.
- IDs de rota malformados.
- Dados de veículo inválidos.
- Dados de serviço inválidos.
- Dados de perfil inválidos.
- CEPs inválidos.
- Termos de pesquisa suspeitos.

Também foi adicionada normalização Unicode usando `NFKC`.

As validações abrangem:

## Veículos

- Marca.
- Modelo.
- Versão.
- Ano.
- Placa.
- Quilometragem.
- Combustível.
- Cor.

## Serviços

- Veículo relacionado.
- Tipos de serviço.
- Quilometragem.
- Concessionária.
- Data.
- Horário.
- Observações.

## Perfil

- Nome.
- E-mail.
- Telefone.

## IDs de rota

As telas de detalhes de veículos e serviços passaram a validar os parâmetros de rota utilizando `sanitizeRouteId`, reduzindo o risco de manipulação de URLs e path traversal.

---

# 6. Armazenamento local de credenciais

Sessão e refresh token são armazenados pelo `expo-secure-store`, que usa o Keystore no Android e o Keychain no iOS. Não há chave em `EXPO_PUBLIC_*`: valores públicos são incorporados ao bundle e não constituem segredo.

Dados do domínio do protótipo (perfil, veículos, serviços e recompensas) permanecem em AsyncStorage. Isso é uma limitação conhecida, documentada em `docs/cybersecurity/SPRINT3.md`, e deve ser substituído por uma arquitetura de dados protegida antes de uso produtivo.

`API_HMAC_SECRET` é segredo exclusivo do servidor e deve ter no mínimo 32 caracteres em ambiente de execução. O arquivo `.env.example` contém apenas o nome de referência.

---

# 7. Alterações no fluxo de navegação

O arquivo `app/_layout.tsx` foi alterado para utilizar as proteções do Expo Router com `Stack.Protected`.

Foram criados três grupos de proteção:

1. Usuários não autenticados:
   - acesso à tela de login.

2. Usuários autenticados que ainda não concluíram o onboarding:
   - acesso ao onboarding.

3. Usuários autenticados e com onboarding concluído:
   - acesso às abas principais;
   - detalhes de veículos;
   - criação de serviços;
   - detalhes de serviços.

Também foi adicionado:

- Restauração automática da sessão.
- Atualização do refresh token durante o bootstrap.
- Ativação do hardening de runtime.
- Inicialização paralela dos dados e da sessão.

---

# 8. Hardening do runtime

Foi adicionado `services/runtimeHardening.ts`.

Quando disponível, o aplicativo tenta impedir captura de tela por meio do módulo `expo-screen-capture`.

Caso o recurso não esteja disponível, o aplicativo registra um evento de segurança indicando que o hardening foi aplicado apenas parcialmente.

---

# 9. Middleware de segurança

Foi criado `app/+middleware.ts` para proteger as rotas `/api`.

O middleware bloqueia:

## User-agents suspeitos

- `sqlmap`
- `nikto`
- `acunetix`
- `nmap`

## Caminhos suspeitos

- `../`
- `%2e%2e%2f`
- tentativas contendo `<script`

As requisições bloqueadas retornam respostas padronizadas com:

- Código de erro.
- Status HTTP apropriado.
- `X-Request-ID`.
- Registro no log de segurança.

---

# 10. Novas APIs de veículos

Foi adicionada a API `app/api/vehicles+api.ts`.

Ela implementa:

## `GET /api/vehicles`

- Exige access token.
- Valida permissão `vehicle:view`.
- Exige HTTPS quando o contexto de proxy fornece essa informação.
- Registra consulta de veículos em auditoria.
- Retorna dados mascarados de placa e chassi.

## `POST /api/vehicles`

- Exige access token.
- Valida permissão `vehicle:create`.
- Valida o payload.
- Verifica a assinatura HMAC.
- Cria o veículo.
- Registra a criação em auditoria.
- Retorna status HTTP `201`.

Também foi adicionado um armazenamento em memória em `app/api/_lib/database.ts`.

Nesse armazenamento:

- A placa é criptografada.
- O chassi é criptografado.
- A placa retornada é mascarada.
- O chassi retornado é mascarado.
- Os dados são mantidos em um `Map` em memória.

---

# 11. Logs estruturados e auditoria

Foi criado `security/logger.ts`.

O sistema agora possui:

- Logs de segurança.
- Logs de auditoria.
- Logs estruturados em JSON.
- Identificadores de requisição.
- Identificadores de correlação.
- Redação automática de informações sensíveis.

Campos como os seguintes são ocultados nos logs:

- Senhas.
- Tokens.
- Authorization.
- CPF.
- E-mail.
- Telefone.
- Segredos.
- Cookies.
- Chassi.

Foram adicionados registros para eventos como:

- Login realizado.
- Falha de autenticação.
- Rotação de refresh token.
- Revogação de sessão.
- Criação de veículo.
- Exclusão de veículo.
- Criação de serviço.
- Atualização de perfil.
- Resgate de recompensa.
- Consulta administrativa.
- Erros de API.
- Tentativas de acesso bloqueadas.
- Consultas externas malsucedidas.

---

# 12. Rate limiting

Foi implementado um limitador em memória em `security/rateLimiter.ts`.

Foram criados dois limitadores principais:

## Autenticação

- Limite de 5 tentativas.
- Janela de 10 minutos.
- Bloqueio temporário de 15 minutos.

## Ações gerais

- Limite de 40 ações por minuto.
- Bloqueio temporário de 1 minuto.

O rate limiting foi aplicado em:

- Login.
- Cadastro de veículos.
- Criação de serviços.
- Consulta de modelos FIPE.
- Consulta de concessionárias.
- Consulta de CEP.
- Atualização de perfil.

Também foi adicionado rate limiting geral por IP nas APIs, com limite de 80 requisições por minuto.

---

# 13. Proteção das APIs externas

O arquivo `services/api.ts` foi reforçado.

Foram adicionadas:

- Validação de URLs permitidas.
- Obrigatoriedade de HTTPS.
- Allowlist para:
  - `parallelum.com.br`;
  - `viacep.com.br`.
- Headers de segurança nas requisições.
- `X-Request-ID`.
- `X-Correlation-ID`.
- Identificador da versão de segurança do cliente.
- Tratamento seguro de erros externos.
- Rate limiting para consultas à FIPE e ViaCEP.
- Sanitização dos termos de pesquisa.
- Sanitização de CEP.

Erros das APIs externas agora são convertidos para uma resposta segura, sem expor detalhes técnicos ao usuário.

---

# 14. Alterações nas telas do aplicativo

## Tela de login

Foi criada `app/sign-in.tsx`, contendo:

- Interface de acesso seguro.
- Campos de e-mail e senha.
- Validação mínima antes do envio.
- Sanitização dos dados.
- Indicador de carregamento.
- Mensagens amigáveis de erro.
- Navegação para o onboarding após autenticação.

## Perfil

`app/(tabs)/profile.tsx` passou a:

- Utilizar o armazenamento protegido.
- Sanitizar nome, e-mail e telefone.
- Validar alterações do perfil.
- Exibir o papel de acesso do usuário.
- Utilizar logout real em vez de apenas resetar o onboarding.
- Exibir mensagens de sucesso ou erro usando `Snackbar`.

## Veículos

`app/(tabs)/vehicles.tsx` passou a:

- Verificar permissão para excluir veículos.
- Sanitizar os campos do formulário.
- Tratar erros de segurança.
- Exibir mensagens de erro.
- Aplicar controle de acesso para exclusão.

## Novo agendamento

`app/service/new.tsx` passou a:

- Sanitizar a pesquisa de concessionárias.
- Sanitizar observações.
- Tratar erros de segurança.
- Exibir mensagens de sucesso ou falha.
- Validar melhor as entradas do formulário.

## Detalhes de veículos e serviços

Foram adicionadas validações dos IDs de rota em:

- `app/vehicle/[id].tsx`
- `app/service/[id].tsx`

---

# 15. Integração do RBAC nos hooks

Os hooks principais foram reforçados.

## `hooks/useAuth.tsx`

Agora gerencia:

- Sessão atual.
- Estado de autenticação.
- Papel do usuário.
- Login.
- Logout.
- Renovação da sessão.
- Permissões.
- Persistência criptografada dos tokens.

## `hooks/useVehicles.ts`

Agora verifica:

- Permissão para criar veículos.
- Permissão para excluir veículos.
- Rate limiting.
- Validação dos dados.
- Auditoria de criação e exclusão.
- Registro seguro de falhas na consulta FIPE.

## `hooks/useServices.ts`

Agora verifica:

- Permissão para criar agendamentos.
- Rate limiting.
- Validação dos dados.
- Auditoria da criação de serviços.

## `hooks/useRewards.ts`

Agora verifica:

- Permissão para atualizar perfil.
- Rate limiting de alterações.
- Validação dos dados do usuário.
- Sanitização da descrição das transações.
- Auditoria de pontos ganhos.
- Auditoria de recompensas resgatadas.

---

# 16. Testes automatizados de segurança

Foram adicionados testes em:

- `__tests__/security/auth.test.ts`
- `__tests__/security/permissions.test.ts`
- `__tests__/security/validation.test.ts`

Os testes cobrem:

## Autenticação

- Criação de sessão.
- Rotação do refresh token.
- Bloqueio de replay do refresh token.

## Permissões

- Permissão administrativa para ações de segurança.
- Bloqueio de exclusão de veículo para usuário comum.

## Validação

- Aceitação de payload seguro de veículo.
- Bloqueio de payload contendo `<script>`.
- Bloqueio de criação de serviço sem tipos de serviço.

Também foram adicionados ao `package.json`:

```json
"test": "jest --runInBand",
"test:security": "jest __tests__/security --runInBand",
"security:audit": "npm audit --audit-level=high",
"security:sast": "npx semgrep scan --config .semgrep.yml ."
```

O projeto passou a utilizar:

- Jest.
- Jest Expo.
- Tipos do Jest.
- Configuração específica de transformação para React Native e Expo.

---

# 17. Pipeline DevSecOps

Foi criado o workflow `.github/workflows/security.yml`.

Ele executa automaticamente:

## Testes de segurança

Executa:

```bash
npm run test:security
```

## Auditoria de dependências

Executa:

```bash
npm run security:audit
```

A auditoria falha quando encontra vulnerabilidades de severidade alta ou crítica.

## Secret scanning

Utiliza:

- Gitleaks.

## SAST

Utiliza:

- CodeQL.
- Linguagem JavaScript/TypeScript.

O pipeline é executado em:

- Pull requests.
- Pushes para `main`.
- Pushes para `master`.

Também foi adicionado `.github/dependabot.yml`, configurando:

- Atualização semanal de dependências NPM.
- Limite de até 10 pull requests abertas.
- Labels `dependencies` e `security`.

---

# 18. Regras Semgrep

Foi adicionado `.semgrep.yml` com regras para detectar:

- Possíveis secrets hardcoded.
- Uso de `Math.random()` em operações sensíveis.

A regra de secrets procura padrões relacionados a:

- API keys.
- Secrets.
- Tokens.

---

# 19. Documentação de segurança

Foi criado o arquivo `CYBERSECURITY.md`, com uma documentação extensa sobre:

- Arquitetura de segurança.
- Camadas de proteção.
- Ameaças mitigadas.
- Fluxo de autenticação.
- RBAC.
- Criptografia.
- Proteção de APIs.
- Rate limiting.
- Hardening.
- Logs e auditoria.
- Monitoramento.
- DevSecOps.
- Variáveis de ambiente.
- Checklist OWASP Top 10.
- Checklist básico LGPD/GDPR.
- Endpoints protegidos.
- Exemplos de ataques mitigados.
- Fluxo de resposta a incidentes.
- Limitações conhecidas.
- Instruções para deploy.
- Recomendações futuras.

A documentação também deixa claro que o projeto ainda utiliza algumas simplificações acadêmicas, como:

- Banco de dados em memória.
- Sessões em memória.
- Ausência de backend dedicado.
- Ausência de MFA operacional completo.
- Ausência de SIEM, WAF e secret manager corporativo.
- Cobertura de testes ainda básica.

---

# 20. Configurações do aplicativo

O `app.json` foi alterado para:

- Utilizar saída web no modo `server`.
- Habilitar middleware do Expo Router.
- Configurar headers de segurança.
- Adicionar CSP.
- Bloquear uso de câmera, microfone e geolocalização por meio de `Permissions-Policy`.
- Impedir clickjacking.
- Habilitar HSTS.
- Definir política de referrer.

O `tsconfig.json` também passou a incluir os tipos do Jest.

---

## Resumo final

Esse commit transforma o projeto de uma aplicação funcional com dados mockados em uma aplicação com uma **base de segurança estruturada**, adicionando:

- Autenticação com tokens.
- Refresh token rotativo.
- Proteção contra replay.
- RBAC.
- Validação e sanitização de entradas.
- Criptografia local.
- Assinatura HMAC.
- Proteção contra CSRF.
- Rate limiting.
- CORS restrito.
- Headers de segurança.
- Middleware de bloqueio.
- Logs estruturados.
- Auditoria.
- Mascaramento de dados sensíveis.
- Testes automatizados.
- CodeQL.
- Gitleaks.
- Semgrep.
- Dependabot.
- Documentação completa de cybersecurity.

Em termos de escopo, o commit implementa praticamente toda a camada de segurança prevista para a sprint de cybersecurity, embora algumas partes — como banco persistente, MFA, SIEM, WAF e backend dedicado — permaneçam documentadas como melhorias futuras ou limitações do escopo acadêmico.
