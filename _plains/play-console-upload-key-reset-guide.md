# Play Console + EAS: guia prático para reset de upload key (sem crédito EAS)

## Objetivo
Evitar bloqueio de envio no Google Play quando o App Bundle é assinado com certificado diferente do esperado.

Erro típico:
- "Seu Android App Bundle foi assinado com uma chave incorreta"
- Play pede um SHA1 esperado, mas o build enviado está com outro SHA1.

## Quando isso acontece
- Mudança de conta/owner/projeto no EAS.
- Mudança de `extra.eas.projectId`.
- Build em outro ambiente com outra keystore.
- Rotina com múltiplas contas para economizar créditos.

## Regra mais importante
Não é problema do código do app. É problema de chave de assinatura de upload.

## Decisão rápida
1. Se você já tem a chave nova (SHA1 novo conhecido):
   - Faça reset da upload key no Play Console (recomendado).
2. Se você precisa manter o SHA1 antigo:
   - Recupere e use a keystore antiga no EAS/projeto antigo.

Na prática, o reset costuma ser o caminho mais rápido.

---

## Fluxo completo (recomendado)

### 1) Confirmar a keystore atual usada no EAS
No projeto:

```bash
npx eas-cli credentials -p android
```

No menu:
- Android Keystore
- Download keystore

Salve em caminho explícito, por exemplo:
- `/Users/SEU_USUARIO/Downloads/gymlog-upload.jks`

Guarde também:
- Keystore password
- Key alias
- Key password

### 2) Gerar o arquivo PEM

```bash
keytool -export -rfc \
  -keystore /Users/SEU_USUARIO/Downloads/gymlog-upload.jks \
  -alias SEU_ALIAS \
  -file /Users/SEU_USUARIO/Downloads/upload_certificate.pem
```

### 3) Validar o SHA1 do PEM antes de enviar

```bash
keytool -printcert -file /Users/SEU_USUARIO/Downloads/upload_certificate.pem | grep 'SHA1:'
```

Confirme que o SHA1 mostrado é o mesmo SHA1 da chave nova que você quer registrar no Play.

### 4) Solicitar reset da upload key no Play Console
Caminho:
- Integridade do app
- Assinatura de apps
- Solicitar redefinição da chave de upload

No formulário:
- Motivo: pode usar "Outro"
- Enviar: `upload_certificate.pem`
- Clicar em "Solicitar"

### 5) Aguardar aprovação
Status comum:
- "há uma solicitação pendente"

Pode levar de horas até 1-2 dias úteis.

### 6) Enviar novo AAB após aprovação
Se estiver sem crédito EAS cloud:

```bash
npm run build:android:production:local
```

Depois envie o AAB no Play Console.

---

## Checklist de prevenção (múltiplas contas)

1. Sempre registrar qual conta EAS está ativa antes do build.
2. Manter uma tabela local por app com:
   - package name
   - projectId
   - owner
   - SHA1 upload key esperado no Play
3. Nunca iniciar build sem validar `extra.eas.projectId`.
4. Salvar keystore com nome padronizado e caminho fixo.
5. Testar SHA1 localmente antes de subir AAB.

Exemplo de padrão de arquivo:
- `/Users/SEU_USUARIO/Keys/com.fabio.gymlog-upload.jks`
- `/Users/SEU_USUARIO/Keys/com.fabio.gymlog-upload.pem`

---

## Diagnóstico rápido (copiar e colar)

### Ver se o arquivo JKS existe

```bash
ls -lh /Users/SEU_USUARIO/Downloads/gymlog-upload.jks
```

### Procurar JKS no Mac

```bash
find "$HOME/Downloads" "$HOME/Desktop" "$PWD" -type f \( -name '*.jks' -o -name '*.keystore' \) 2>/dev/null | head -n 50
```

### Ler SHA1 direto da keystore

```bash
keytool -list -v -keystore /Users/SEU_USUARIO/Downloads/gymlog-upload.jks -alias SEU_ALIAS | grep SHA1
```

---

## Segurança (obrigatório)
- Nunca compartilhar senha de keystore em chat, commit, print ou ticket.
- Se senha/chave vazou, girar credenciais assim que possível.
- Salvar credenciais em cofre seguro (password manager).

---

## Notas deste projeto
- App Android package: `com.fabio.gymlog`
- Se o Play estiver esperando SHA1 antigo e o build está com novo SHA1, faça reset da upload key no Play.
- Trocar owner/conta sem alinhar keystore quase sempre causa esse erro.
