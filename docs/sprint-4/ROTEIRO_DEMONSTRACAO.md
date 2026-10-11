# Roteiro reproduzível de demonstração

| Fluxo | Estado inicial e ações | Resultado esperado | Internet/permissões | Risco e alternativa |
| --- | --- | --- | --- | --- |
| Dashboard | Conclua onboarding; abra Dashboard | veículo principal, score demonstrativo e serviços locais | não | seed ausente: use “Tentar novamente” |
| Cadastro | Garagem → `+`; informe modelo, placa válida, km e salve | veículo aparece na lista e persiste ao retornar | FIPE só para sugestão de modelo | sem FIPE, digite um modelo Ford; o cadastro continua local |
| Detalhe | Toque no veículo cadastrado | dados técnicos e indicadores demonstrativos | não | não tratar score como diagnóstico real |
| Agendamento | Serviços → novo; escolha veículo, serviço, concessionária, data útil futura, horário e confirme | serviço local aparece em Serviços | ViaCEP opcional para dica de endereço; notificação depende de permissão/build | sem ViaCEP, endereço local permanece; sem permissão, confirme a mensagem condicional |
| Rewards | Rewards; ganhe pontos e resgate item compatível | saldo e histórico locais atualizados | notificação opcional | sem permissão, a operação continua sem alerta local |
| Perfil | Perfil → Editar → Salvar; altere preferências; Sair | perfil/pref. persistidos e onboarding reaparece | não | não apresentar “Sair” como logout remoto |

Antes de gravar, faça o smoke test de APK descrito no checklist. Para demonstração de notificação, use development build ou APK Android: Expo Go Android não oferece suporte a esse fluxo.
