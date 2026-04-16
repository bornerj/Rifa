Status: ACTIVE
Date: 2026-04-15
Context: O fluxo do participante com OTP por SMS/WhatsApp aumentava atrito, dependia de provedor adicional e nao era mais desejado para o MVP. A operacao real da rifa depende mais da confirmacao manual do PIX pelo admin do que de uma verificacao previa por telefone.
Decision: Remover OTP, SMS e WhatsApp do fluxo do participante. O participante informa nome, email e telefone, gera uma cota por confirmacao e recebe o numero imediatamente na tela. A confirmacao formal sera enviada por email via Brevo somente apos o admin confirmar manualmente que o PIX foi recebido.
Consequences: O fluxo publico fica mais simples e reduz dependencia de SMS. O email do participante passa a ser obrigatorio para recibo e confirmacao. A tela publicada prioriza participacao e pagamento, sem grade publica de cotistas. A seguranca operacional passa a depender da confirmacao manual do PIX e de controles contra abuso de reservas, como rate limiting e validacao de entrada.
