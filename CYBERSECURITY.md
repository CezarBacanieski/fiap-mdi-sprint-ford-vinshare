# CYBERSECURITY.md

## 1) Visão geral da arquitetura de segurança

Esta implementação aplica **Secure by Default**, **OWASP Top 10**, **Zero Trust** e controles práticos para o escopo acadêmico do Ford+.

Camadas implementadas:

- **Cliente (Expo/React Native)**  
  - validação e sanitização centralizada (`security/validation.ts`, `security/sanitization.ts`);
  - sessão autenticada com rotação de refresh token (`security/auth.ts`);
  - RBAC com permissões explícitas (`security/permissions.ts`);
  - dados sensíveis persistidos com criptografia local AES-GCM quando disponível (`security/cryptoStorage.ts`);
  - logs estruturados e auditáveis sem dados sensíveis (`security/logger.ts`);
  - limitação de taxa local para reduzir abuso e brute force (`security/rateLimiter.ts`);
  - hardening de runtime com bloqueio de captura de tela quando disponível (`services/runtimeHardening.ts`).

- **Servidor (Expo Router API Routes + middleware)**  
  - middleware de bloqueio inicial para rotas `/api` (`app/+middleware.ts`);
  - headers de segurança globais no `app.json`;
  - CORS allowlist, CSRF header obrigatório e rate limiting por IP (`app/api/_lib/http.ts`);
  - proteção contra prototype pollution e payload malformado (`app/api/_lib/http.ts`);
  - assinatura HMAC de payload (`app/api/_lib/payloadSignature.ts`);
  - endpoints de auth seguros com rotação/revogação (`app/api/auth/*+api.ts`);
  - endpoint administrativo com RBAC de admin (`app/api/admin/audit+api.ts`);
  - endpoint de veículos com validação forte e auditoria (`app/api/vehicles+api.ts`).

---

## 2) Ameaças mitigadas

Mitigações implementadas (total/parcial):

- **SQL Injection / NoSQL Injection**: validação e bloqueio de payloads suspeitos + whitelist de campos.
- **XSS**: sanitização de caracteres perigosos e normalização NFKC.
- **Command Injection**: entradas não executadas e filtradas.
- **Path Traversal**: validação rígida de IDs de rota e bloqueio de padrões `../`.
- **Prototype Pollution**: rejeição de chaves `__proto__`, `prototype`, `constructor` no body.
- **Mass Assignment**: objetos de entrada montados por whitelist e não por spread irrestrito.
- **Brute force**: limiter de login + lock temporário.
- **Replay de refresh token**: token marcado como usado e rotação obrigatória.
- **Clickjacking**: `X-Frame-Options: DENY`.
- **Enumeração de usuário**: mensagem de login genérica para falha de credenciais.
- **Abuso de API / scraping**: rate limiting e CORS restrito.

---

## 3) Decisões técnicas

- **Autenticação mockada segura para portfólio**: login local com hash iterativo e rotação de tokens para demonstrar fluxo real.
- **Criptografia local com fallback**: AES-GCM usando Web Crypto quando disponível; fallback controlado em ambientes limitados.
- **Middleware + API Routes**: viabiliza demonstração prática de segurança de backend dentro do mesmo repositório Expo.
- **Logs estruturados com redaction**: evita vazamento de token, CPF, email, phone, segredo.

---

## 4) Fluxo de autenticação

1. Usuário acessa `app/sign-in.tsx`.
2. `signIn()` valida tentativa, aplica lock/rate-limit, gera sessão curta e refresh rotativo.
3. Sessão é persistida criptografada em storage local.
4. Em bootstrap (`app/_layout.tsx`), o app tenta `refreshAuthSession()`.
5. Refresh token usado é invalidado (anti-replay) e substituído por novo token.
6. Logout executa revogação de sessão e limpeza de credenciais.

Endpoints de auth no servidor:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `DELETE /api/auth/revoke`

---

## 5) RBAC

Papéis:

- `admin`
- `analyst`
- `user`

Permissões mapeadas por papel em `security/permissions.ts`, incluindo:

- `vehicle:view`
- `vehicle:create`
- `vehicle:delete`
- `service:create`
- `service:view`
- `profile:update`
- `rewards:redeem`
- `security:admin`

Guardas aplicados:

- UI e hooks (ex.: criação/remoção de veículo, criação de serviço, update de perfil);
- API (`/api/admin/audit`) para rota administrativa.

---

## 6) Criptografia usada

- **Em repouso (cliente):** AES-GCM (quando disponível) via `security/cryptoStorage.ts`.
- **Assinatura de payload (API):** HMAC-SHA256 (`app/api/_lib/payloadSignature.ts`).
- **Hash de senha (escopo acadêmico):** hash iterativo (12k rounds SHA-256) para demonstração de custo computacional e política forte.

> Em produção real, mover autenticação para backend dedicado com Argon2id/bcrypt e KMS/HSM.

---

## 7) Proteção de APIs

- TLS enforcement parcial por header `x-forwarded-proto` (`ensureHttpsRequest`).
- HSTS e secure headers via `app.json`.
- CORS restrito por allowlist.
- CSRF token exigido em métodos de escrita (`x-csrf-token`).
- Rate limiting por IP.
- Body parsing com limite de tamanho.
- Preflight OPTIONS explícito.

---

## 8) Rate limiting

- Cliente:
  - login, criação de veículo, criação de serviço, lookup CEP, busca FIPE.
- Servidor:
  - limite por IP na borda (`withSecurity`).

Backoff e lock:

- lock temporário após múltiplas tentativas de login inválidas.

---

## 9) Hardening aplicado

- deny-by-default em permissões sensíveis;
- validação server-side e client-side;
- sanitização centralizada;
- headers anti-clickjacking, nosniff, CSP, referrer e permissions policy;
- sessão curta + refresh rotativo + revogação;
- mensagens de erro sem stack trace/tecnologia interna;
- bloqueio de user-agent e path suspeitos no middleware;
- tentativa de prevenção de screen capture no runtime.

---

## 10) Retenção, anonimização e descarte

Implementação no escopo:

- dados de API de demonstração retornam placa/chassi mascarados;
- logs com redaction de PII;
- limpeza de sessão e tokens no logout.

Recomendação produção:

- política formal de retenção por tipo de dado;
- job de expurgo automático;
- trilha de auditoria imutável em storage WORM/SIEM.

---

## 11) Logging e auditoria

Eventos auditados:

- login com sucesso;
- rotação de refresh;
- revogação de sessão;
- criação/remoção de veículo;
- criação de serviço;
- atualização de perfil;
- consulta administrativa;
- consultas massivas via endpoint de veículos.

Características:

- JSON estruturado;
- `requestId` e `correlationId`;
- redaction automática de campos sensíveis.

---

## 12) Monitoramento de ameaças

Detecção/alertas implementados:

- padrões de path traversal;
- user-agents ofensivos;
- replay de refresh token;
- excesso de tentativas de login;
- flood de requisições.

---

## 13) DevSecOps

Arquivos:

- `.github/workflows/security.yml`
- `.github/dependabot.yml`
- `.semgrep.yml`

Pipeline de segurança:

- testes de segurança (`npm run test:security`);
- SAST (CodeQL);
- secret scanning (Gitleaks);
- dependency scanning (`npm audit`);
- atualização contínua de dependências (Dependabot).

---

## 14) Variáveis de ambiente necessárias

Base:

- `EXPO_PUBLIC_STORAGE_SECRET`
- `API_HMAC_SECRET`
- `NODE_ENV=production`

Arquivo de referência: `.env.example`.

---

## 15) Checklist OWASP Top 10 (resumo)

- A01 Broken Access Control → RBAC + guards + deny-by-default.
- A02 Cryptographic Failures → AES-GCM local + assinatura HMAC.
- A03 Injection → validação/sanitização + filtros de payload.
- A04 Insecure Design → secure-by-default + separação de camadas.
- A05 Security Misconfiguration → headers, CORS, CSP, HSTS.
- A06 Vulnerable Components → workflow de audit/dependency scan.
- A07 Identification/Auth Failures → tokens curtos, refresh rotativo, lock.
- A08 Data Integrity Failures → assinatura de payload.
- A09 Logging/Monitoring Failures → audit logs estruturados.
- A10 SSRF → allowlist de origens externas.

---

## 16) Checklist LGPD/GDPR básico

- minimização de dados em logs;
- mascaramento de dados sensíveis;
- trilha de eventos de acesso/alteração;
- documentação de retenção e expurgo (parcial no escopo);
- recomendação de consentimento explícito para analytics/export.

---

## 17) Endpoints protegidos

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `DELETE /api/auth/revoke`
- `GET /api/admin/audit` (admin only)
- `GET /api/vehicles`
- `POST /api/vehicles`
- `GET /api/security/status`

---

## 18) Exemplos de ataques mitigados

- tentativa com `../` em rota dinâmica → bloqueada por sanitização de ID;
- payload com chave `__proto__` → rejeitado;
- refresh token reutilizado (replay) → sessão invalidada;
- brute force de login → lock temporário + 429;
- origem não autorizada em CORS → 403.

---

## 19) Fluxo de resposta a incidentes (acadêmico)

1. Detectar (logs de segurança/auditoria).
2. Conter (revogar sessão/token e bloquear origem).
3. Erradicar (corrigir vetor de entrada e atualizar regra).
4. Recuperar (restaurar operação segura).
5. Pós-incidente (registrar lições e reforçar controles).

---

## 20) O que foi totalmente implementado, parcial e simplificado

### Totalmente implementado

- validação/sanitização centralizada de entradas principais;
- RBAC em hooks e endpoints administrativos;
- tokens curtos + refresh rotativo + revogação + anti-replay;
- secure headers, CORS restrito, CSRF header e rate limiting;
- logs estruturados e trilha de auditoria;
- pipeline DevSecOps base com SAST/secret/deps scan;
- testes mínimos de segurança.

### Parcialmente implementado

- criptografia em repouso depende da disponibilidade de Web Crypto no ambiente;
- TLS enforcement via headers/proxy context (não substitui mTLS/ingress corporativo);
- proteção de upload/antivírus está preparada conceitualmente, sem fluxo de upload real no app atual.

### Simplificado por escopo acadêmico

- autenticação e sessão em memória (não distribuída);
- banco de dados de API em memória (sem persistência externa real);
- sem SIEM/WAF/secret manager enterprise;
- sem MFA/TOTP operacional completo (recomendado para próxima fase).

### Limitações conhecidas

- não há backend dedicado separado (Node/Java/Spring) com banco real;
- métricas de observabilidade avançada e imutabilidade forte de logs não estão completas;
- cobertura de testes de segurança é mínima (smoke-level).

---

## 21) Instruções de segurança para deploy

1. Definir `NODE_ENV=production`.
2. Provisionar secrets em cofre (não usar `.env` em produção).
3. Forçar HTTPS no balanceador/edge.
4. Habilitar pipeline `security.yml` como gate de merge/deploy.
5. Bloquear deploy se `npm audit` retornar severidade `high/critical`.
6. Rotacionar `API_HMAC_SECRET` e `EXPO_PUBLIC_STORAGE_SECRET` periodicamente.

---

## 22) Recomendações futuras

- migrar autenticação para backend dedicado com Argon2id e refresh token persistente;
- adicionar MFA/TOTP real;
- integrar WAF e proteção DDoS;
- SIEM com alertas e retenção imutável;
- criptografia de dados sensíveis em banco real (KMS);
- ampliar testes para fuzzing, DAST e e2e de segurança.
