/*
  # Criar usuários de autenticação para teste

  1. Usuários de Teste
    - admin@viagenspremium.com.br (Proprietário - João Silva Santos)
    - maria@turmundo.com.br (Agente - Maria Fernanda Costa)
  
  2. Configurações
    - Senhas: 123456 para ambos
    - Email confirmado automaticamente
    - Vinculação com tabela users através do auth_id

  Nota: Este script deve ser executado após conectar ao Supabase
*/

-- Função para criar usuários de teste (será executada manualmente via Supabase Dashboard)
-- Os usuários devem ser criados no Supabase Auth Dashboard com as seguintes credenciais:

-- 1. admin@viagenspremium.com.br - senha: 123456
-- 2. maria@turmundo.com.br - senha: 123456

-- Após criar os usuários no Auth, execute este script para vincular com a tabela users:

-- Atualizar usuário João Silva com auth_id (substitua pelo ID real do Supabase Auth)
-- UPDATE users 
-- SET auth_id = 'AUTH_ID_DO_JOAO'
-- WHERE full_name = 'João Silva Santos';

-- Atualizar usuário Maria Fernanda com auth_id (substitua pelo ID real do Supabase Auth)
-- UPDATE users 
-- SET auth_id = 'AUTH_ID_DA_MARIA'
-- WHERE full_name = 'Maria Fernanda Costa';

-- Por enquanto, vamos criar uma função que pode ser chamada depois
CREATE OR REPLACE FUNCTION link_auth_users()
RETURNS void AS $$
BEGIN
  -- Esta função será usada para vincular os usuários após criação no Auth
  RAISE NOTICE 'Para vincular os usuários:';
  RAISE NOTICE '1. Crie os usuários no Supabase Auth Dashboard';
  RAISE NOTICE '2. Execute UPDATE users SET auth_id = ''AUTH_ID'' WHERE email = ''email''';
END;
$$ LANGUAGE plpgsql;

-- Executar a função para mostrar as instruções
SELECT link_auth_users();