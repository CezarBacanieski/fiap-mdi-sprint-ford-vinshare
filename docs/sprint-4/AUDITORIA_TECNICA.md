# Auditoria técnica — Sprint 4

## Escopo e referência

- Commit auditado: `c3b238b01ff7aeac08ae078903a729933c16defd` (`main`).
- O PDF oficial do desafio não estava disponível no workspace durante a auditoria. Esta evidência usa somente os requisitos da Sprint 4 fornecidos para o projeto.
- A aplicação permanece um protótipo local: não há backend, autenticação remota, APIs Ford ou confirmação remota de agendamento.

## Arquitetura encontrada

Expo Router organiza as telas; React Native Paper e componentes próprios fazem a interface; hooks concentram o estado de domínio; `services/storage.ts` persiste em AsyncStorage; `services/api.ts` contém FIPE/ViaCEP; e `services/notifications.ts` encapsula notificações locais. TanStack Query é usado para catálogo FIPE e concessionárias demonstrativas.

## Matriz resumida

| Funcionalidade | Evidência | Problema encontrado | Severidade | Correção/validação |
| --- | --- | --- | --- | --- |
| Inicialização | `app/_layout.tsx` | Falha do seed mantinha a tela de carregamento sem saída | P1 | Mensagem e nova tentativa; typecheck e testes |
| Garagem | `useVehicles`, tela Vehicles | Placa só exigia 7 caracteres, aceitava duplicidade e ID podia colidir | P1 | Validação BR, duplicidade e ID único; teste específico |
| Agendamento | `useServices` | Hook aceitava veículo/concessionária inexistente e datas passadas | P1 | Validação antes de persistir; teste específico |
| Rewards | `useRewards` | Ações rápidas podiam usar saldo/histórico obsoletos | P1 | Fila local e escrita agrupada; teste de resgate concorrente |
| Notificações | `service/new.tsx` | UI informava lembrete criado mesmo sem permissão/suporte | P2 | Mensagem condicional ao resultado real |
| Build | `package.json` | Cinco pacotes Expo fora do patch compatível | P1 | `expo install --fix`; Expo Doctor 21/21 |

## Correções executadas

1. Validação de placa nos formatos Mercosul e tradicional (`ABC1D23`/`ABC-1234`) e bloqueio de veículo já cadastrado.
2. Validação defensiva de agendamento no hook, além dos controles da tela.
3. Serialização de ganhos/resgates para preservar saldo e histórico quando o usuário toca rapidamente.
4. Tratamento recuperável da falha de preparação do armazenamento local.
5. Mensagem honesta para lembretes locais: eles dependem de permissão e de dispositivo/build compatível.
6. Atualização somente dos patches recomendados pelo Expo SDK 57 instalado.

## Verificações executadas

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | aprovado |
| `npm test -- --watch=false` | 8 suítes, 31 testes aprovados |
| `npm run doctor` | 21/21 verificações aprovadas |
| `npx expo export --platform android` | bundle Android gerado com sucesso |
| `git diff --check` | sem erros de espaço |

Os testes ainda emitem avisos `act(...)` originados por carregamento assíncrono de ícones e do provider de autenticação em testes já existentes; não são falhas de teste nem aparecem como erro de runtime nesta validação.

## Limitações e pendências externas

- FIPE e ViaCEP requerem internet; concessionárias, veículos, serviços e rewards são dados demonstrativos locais.
- Notificações locais não foram testadas em aparelho/build próprio nesta auditoria. No Android, Expo Go não é suportado para este fluxo.
- O bundle Android foi exportado localmente, mas não houve build remoto, instalação de APK nem smoke test físico, pois exigiriam EAS autenticado e/ou aparelho.
- `npm audit` reportou 68 vulnerabilidades transitivas (16 moderadas, 51 altas, 1 crítica). Não foi aplicado `npm audit fix` automático para não impor upgrades potencialmente incompatíveis; requer triagem de dependências.
