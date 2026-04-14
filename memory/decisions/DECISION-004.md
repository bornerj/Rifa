Status: ACTIVE
Date: 2026-04-13
Context: Havia uma ideia inicial de armazenar QR Code e de fazer um sorteio visualizado como animacao, mas isso precisava ser transformado em uma implementacao mais segura e auditavel.
Decision: O sistema persiste o payload e os metadados do PIX, gerando o QR Code sob demanda. O sorteio seleciona de forma segura uma cota elegivel ja registrada no banco, e qualquer animacao na interface e apenas apresentacional.
Consequences: O resultado da rifa passa a ser auditavel e menos sujeito a contestacao. Em troca, a camada de persistencia precisa manter metadados claros do sorteio e o front nao pode ser tratado como fonte de verdade para o numero vencedor.
