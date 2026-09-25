# Ford+

Aplicativo mobile desenvolvido para o **Desafio 02 — Boosting VIN Share in South America with Intelligent Solutions**, da FIAP em parceria com a Ford. O Ford+ propõe fortalecer o relacionamento com proprietários e incentivar a manutenção na rede oficial Ford ao reunir informações do veículo, recomendações de manutenção, agendamento de serviços e benefícios de fidelidade. A demonstração usa dados locais e integrações públicas; não mede aumento real de VIN Share.

## Funcionalidades disponíveis

- Onboarding e encerramento de sessão locais para repetir a demonstração.
- Dashboard com veículo principal, Vehicle Health Score, manutenção recomendada, próximo serviço e histórico recente.
- Garagem de veículos: listagem, cadastro local, detalhe técnico, saúde por sistema e exclusão confirmada.
- Serviços: histórico, agendamentos futuros, detalhe de agendamento e novo agendamento em três etapas.
- Concessionárias de demonstração com busca; consulta do endereço pelo CEP via ViaCEP durante o agendamento.
- Busca de modelos Ford na API pública FIPE durante o cadastro do veículo.
- Ford+ Rewards: saldo, níveis, transações, ganho de pontos e resgate local de benefícios.
- Perfil editável com persistência em AsyncStorage e preferências de notificações e lembretes.
- Notificações locais e lembrete de serviço quando disponíveis no dispositivo e com permissão concedida. No Android, o app desativa essa integração no Expo Go; valide em development build ou APK.

Veículos, serviços, concessionárias, rewards e perfil começam com dados de demonstração e ficam no armazenamento local do app. FIPE e ViaCEP são as únicas APIs externas usadas; não há integração com APIs Ford, backend de produção, mapa ou geolocalização.

## Stack

- Expo SDK 57, React Native 0.86.3, React 19.2.3 e TypeScript 6.
- Expo Router para navegação por arquivos.
- React Native Paper, Expo Vector Icons, Reanimated e SVG para a interface.
- TanStack React Query para a consulta de modelos FIPE e carregamento dos dados locais de concessionárias.
- AsyncStorage para persistência de onboarding, veículos, serviços, perfil, rewards e preferências.
- Axios para chamadas HTTP; date-fns para datas; APIs públicas FIPE e ViaCEP.
- Expo Notifications para notificações locais (não push remoto).

## Arquitetura

```text
app/
  _layout.tsx           # raiz, providers e navegação inicial
  (tabs)/               # dashboard, veículos, serviços, rewards e perfil
  onboarding/           # fluxo inicial
  vehicle/[id].tsx      # detalhe/saúde do veículo
  service/new.tsx       # agendamento em etapas
  service/[id].tsx      # detalhe de agendamento
components/
  ui/                   # componentes visuais reutilizáveis
  charts/               # gráficos de manutenção e fidelidade
hooks/                  # estado e operações de domínio
services/               # AsyncStorage, notificações e integrações HTTP
constants/              # tema e dados de demonstração
types/                  # tipos do domínio
assets/prints/          # capturas de tela já disponíveis
__tests__/, *.test.tsx  # testes automatizados
```

## Como executar

Pré-requisitos: Node.js 22.13 ou superior (requisito do Expo SDK 57) e npm. Veja a [referência do SDK 57](https://docs.expo.dev/versions/v57.0.0/).

```bash
npm ci
npm run doctor
npm run typecheck
npm run start
```

Para iniciar diretamente em um emulador Android ou dispositivo configurado:

```bash
npm run android
```

Também é possível abrir `npx expo start` e ler o QR code com o Expo Go compatível com SDK 57. No Android, notificações locais não são suportadas pelo Expo Go usado por este projeto; valide-as em development build ou APK instalado.

## Build Android (APK)

O perfil `preview` em `eas.json` usa distribuição interna e `android.buildType: apk`, gerando um APK instalável. O identificador Android é `br.com.fiap.fordplus`.

```bash
npx eas-cli login
npm run build:android:apk
```

Quando o build terminar, o EAS CLI exibirá o link do artefato; também é possível abrir a página da build e baixar o APK. No aparelho Android, abra o arquivo e confirme a instalação se solicitado. O perfil `production` gera AAB para distribuição pela loja, não APK instalável diretamente.

### APK disponível

- [Baixar APK da build EAS `21da9131`](https://expo.dev/accounts/vitorbmulford/projects/ford-plus-vinshare/builds/8809d57a-594e-4e61-a27b-02f8a6f267b4).
- Essa build terminou com sucesso em Expo SDK 57, mas foi feita no commit `9b44620`; o `main` atual está no commit `2264af5` e contém mudanças posteriores. Gere um novo build pelo comando acima para produzir o APK correspondente exatamente ao código atual.
- O link direto do artefato tem expiração indicada pelo EAS em **8 de outubro de 2026**.

## Testes e validação da Sprint 3

Na branch `main` (commit `2264af5`), a instalação limpa e as verificações locais concluíram:

- `npm ci` — dependências instaladas pelo lockfile.
- `npm test` — 28/28 testes aprovados em 8 suítes.
- `npm run typecheck` — TypeScript aprovado.
- `npm run doctor` — Expo Doctor: 21/21 verificações aprovadas.
- `npx expo export --platform android` — bundle Android exportado; este comando não gera APK.

A suíte Jest usa `jest-expo` e Testing Library com mocks para AsyncStorage, Expo Notifications, Expo Router, FIPE e ViaCEP. Cobre persistência, hooks de domínio, onboarding/logout, veículos, agendamento, rewards, perfil, preferências de notificação, Error Boundary e atualização da aba de veículos ao receber foco.

**Status da entrega:** código atual de `main` validado por testes, typecheck, Expo Doctor e exportação Android. A build EAS terminada e linkada acima é de um commit anterior; a instalação e o smoke test do APK construído a partir do `main` atual ainda precisam ser feitos.

### Executar os testes

```bash
npm test
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

## Demonstração visual

As telas abaixo reutilizam as capturas existentes em `assets/prints/` e demonstram os principais fluxos do aplicativo.

### Dashboard

![Dashboard Ford+ com veículo, Vehicle Health Score e próximo serviço](assets/prints/Captura%20de%20tela%202026-05-20%20203529.png)

### Garagem de veículos

![Garagem com veículos cadastrados e seus Vehicle Health Scores](assets/prints/Captura%20de%20tela%202026-05-20%20203555.png)

### Agendamento de serviço

![Primeira etapa: seleção do veículo e tipo de serviço](assets/prints/Captura%20de%20tela%202026-05-20%20203744.png)

![Segunda etapa: concessionária, data e horário](assets/prints/Captura%20de%20tela%202026-05-20%20203756.png)

### Ford+ Rewards

![Saldo, nível, opções de ganho e resgate de benefícios](assets/prints/Captura%20de%20tela%202026-05-20%20203653.png)

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
