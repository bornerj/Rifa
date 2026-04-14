Status: ACTIVE
Date: 2026-04-13
Context: O fluxo da rifa precisava equilibrar seguranca, baixo atrito para o participante e custo operacional reduzido no MVP.
Decision: O admin acessa com email e senha e precisa confirmar o email por link magico. O participante valida o telefone por OTP de 6 digitos via SMS no MVP. O pagamento e feito por PIX com exibicao de QR Code e confirmacao manual pelo admin da rifa.
Consequences: O admin ganha um fluxo de acesso mais seguro e o participante consegue entrar sem conta tradicional. Em troca, o sistema depende de um provedor de email e de um provedor de SMS em producao, e a conciliacao financeira continua manual ate uma futura integracao automatica.
