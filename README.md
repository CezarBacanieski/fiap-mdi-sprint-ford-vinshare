# Ford+

Aplicativo mobile da FIAP para o **Desafio 02 — Boosting VIN Share in South America with Intelligent Solutions**, em parceria com a Ford. O Ford+ incentiva o retorno à rede oficial ao reunir informações do veículo, manutenção preventiva, agendamento de serviços e benefícios de fidelidade em uma experiência local e demonstrável.

## Funcionalidades disponíveis

- Onboarding persistido localmente e encerramento de sessão para repetir a demonstração.
- Dashboard com veículo principal, Vehicle Health Score, manutenção recomendada, próximo serviço e histórico recente.
- Garagem de veículos: listagem, cadastro local, detalhe técnico, saúde por sistema e exclusão confirmada.
- Serviços: histórico, agendamentos futuros, detalhe de agendamento e novo agendamento em três etapas.
- Concessionárias simuladas com busca; consulta de CEP via ViaCEP ao selecionar uma unidade.
- Consulta de modelos Ford via FIPE durante o cadastro do veículo.
- Ford+ Rewards: saldo, níveis, transações, ganho de pontos e resgate local de benefícios.
- Perfil editável com persistência em AsyncStorage e preferências de notificações e lembretes.
- Notificações locais em builds de desenvolvimento/produção quando o dispositivo concede permissão.

Os dados de veículos, serviços, rewards e perfil são exemplos locais inicializados no primeiro uso. Não há integração com APIs Ford nem backend de produção.

## Stack

- Expo SDK 57, React Native 0.86 e TypeScript estrito.
- Expo Router para navegação por arquivos.
- React Native Paper, Expo Vector Icons, Reanimated e SVG para a interface.
- TanStack React Query para consultas FIPE e concessionárias.
- AsyncStorage para persistência local.
- Axios, date-fns, ViaCEP e API FIPE.

## Arquitetura

```text
app/
  (tabs)/              # Dashboard, veículos, serviços, rewards e perfil
  onboarding/          # Fluxo inicial
  vehicle/[id].tsx     # Detalhe de veículo
  service/new.tsx      # Novo agendamento
  service/[id].tsx     # Detalhe de agendamento
components/
  ui/                  # Componentes visuais reutilizáveis
  charts/              # Gráficos de saúde e fidelidade
hooks/                 # Estado e operações de domínio
services/              # Storage, notificações e integrações HTTP
constants/             # Tema e dados de demonstração
types/                 # Tipos do domínio
docs/screenshots/      # Evidências da versão final (captura manual)
```

## Como executar

Pré-requisitos: Node.js LTS e npm.

```bash
npm install
npm run doctor
npm run typecheck
npx expo start
```

Para abrir no Android conectado/emulado:

```bash
npm run android
```

O Expo Go é adequado para a maior parte da demonstração. Por restrições da plataforma, as notificações locais Android devem ser validadas em development build ou APK instalado.

## Build Android (APK)

O arquivo `eas.json` contém o perfil `preview`, configurado para gerar um APK instalável, e o identificador Android é `br.com.fiap.fordplus`.

```bash
npx eas-cli login
npm run build:android:apk
```

Ao final, o EAS exibirá um link para baixar o APK. Transfira-o ao aparelho e permita a instalação de apps da fonte usada para o download quando o Android solicitar. O perfil `production` gera AAB para publicação em loja.

### APK Sprint 3

- Arquivo/release: adicionar após o EAS Build.
- Link de download: adicionar após o EAS Build.
- Instalação: baixar o APK no Android, abrir o arquivo e confirmar a instalação.

## Testes e validações locais

```bash
npm run typecheck
npm test
npm run doctor
npx expo export --platform android
```

O último comando valida a criação do bundle Android; ele não gera um APK instalável. O APK é produzido pelo comando EAS acima.

## Validação da Sprint 3

### Testes automatizados

- 28 testes automatizados em 8 arquivos de teste.
- 28/28 aprovados.
- TypeScript aprovado.
- Expo Doctor: 21/21 verificações aprovadas.

Cobertura funcional:

- persistência e AsyncStorage;
- veículos, confirmação de exclusão e atualização ao retornar o foco;
- serviços, validações e agendamentos;
- rewards e perfil;
- onboarding e logout;
- FIPE e ViaCEP;
- notificações e preferências de lembretes;
- Error Boundary e ação de tentar novamente.

### Validação do build

- `npm run typecheck` ✅
- `npm run doctor` ✅
- `npm test` ✅
- `npx expo export --platform android` ✅
- EAS Build APK: [em fila](https://expo.dev/accounts/vitorbmulford/projects/ford-plus-vinshare/builds/21da9131-7ae3-460f-82ca-1125251d2a5d)
- Instalação e smoke test Android: pendentes da conclusão da build.

### Testes automatizados

A suíte Jest usa `jest-expo` e Testing Library com mocks para AsyncStorage, Expo Notifications, Expo Router, FIPE e ViaCEP. Ela cobre persistência, hooks de domínio, onboarding/logout, veículos, agendamento, rewards, perfil, preferências de notificação, Error Boundary e o recarregamento da aba de veículos ao receber foco.

```bash
npm test
# desenvolvimento
npm run test:watch
```

### Smoke test pós-instalação

- [ ] O app inicia e o onboarding abre no primeiro uso.
- [ ] Concluir onboarding abre o dashboard.
- [ ] Abrir e consultar os detalhes de cada veículo.
- [ ] Cadastrar um veículo e confirmar que a garagem e dashboard refletem a alteração.
- [ ] Excluir um veículo e confirmar que a confirmação é exibida.
- [ ] Criar um agendamento escolhendo veículo, serviço, concessionária, data e horário.
- [ ] Confirmar que o novo agendamento aparece em Serviços.
- [ ] Abrir o detalhe de um agendamento futuro.
- [ ] Ganhar pontos e resgatar um benefício em Rewards.
- [ ] Editar dados do perfil, sair e reiniciar o onboarding.
- [ ] Validar a permissão e um lembrete local no APK/development build.

## Screenshots para a entrega

As imagens antigas em `assets/prints/` não são a evidência da versão final e não devem ser usadas no relatório da Sprint 3. Após instalar o APK, capture manualmente e salve as imagens atuais em `docs/screenshots/`:

1. `01-onboarding.png` — primeira tela do onboarding.
2. `02-dashboard.png` — dashboard com Health Score e alerta de serviço.
3. `03-veiculos.png` — garagem de veículos.
4. `04-detalhe-veiculo.png` — saúde por sistema e linha do tempo.
5. `05-servicos.png` — lista de próximos serviços.
6. `06-novo-agendamento-etapa-1.png` — veículo e tipo de serviço.
7. `07-novo-agendamento-etapa-2.png` — concessionária, data e horário.
8. `08-confirmacao-agendamento.png` — resumo/feedback após confirmar.
9. `09-rewards.png` — saldo, nível e benefícios.
10. `10-perfil.png` — perfil e configurações.

## Limitações atuais

- Dados de negócio e concessionárias são mocks persistidos localmente.
- FIPE e ViaCEP dependem de conexão; o fluxo principal permanece demonstrável com os dados já existentes.
- Não há login remoto, APIs Ford, mapa/geolocalização em tempo real, push remoto ou backend.
- A geração do APK depende de conta EAS autenticada e é realizada fora do repositório.

## Integrantes

| Nome | RM |
| --- | --- |
| Milton Cezar Bacanieski | 555206 |
| Victório Bastelli | 554723 |
| Lorenzo Mangini | 554901 |
| Vitor Bebiano | 555026 |
