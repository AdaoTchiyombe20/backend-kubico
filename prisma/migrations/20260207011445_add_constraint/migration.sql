-- Primeiro, remove o trigger se já existir (para evitar erros em re-execuções)
DROP TRIGGER IF EXISTS enforce_admin_exclusivity ON user_roles;
DROP FUNCTION IF EXISTS check_admin_exclusivity();

-- Cria a função de validação
CREATE OR REPLACE FUNCTION check_admin_exclusivity()
RETURNS TRIGGER AS $$
DECLARE
  current_role VARCHAR;
  has_admin BOOLEAN;
  has_other_roles BOOLEAN;
BEGIN
  -- Pega o nome da role sendo inserida/atualizada
  SELECT r.role INTO current_role 
  FROM roles r
  WHERE r.id = NEW.role_id;

  -- Verifica se o usuário já tem ADMIN (excluindo o registro atual)
  SELECT EXISTS(
    SELECT 1 
    FROM user_roles ur
    INNER JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = NEW.user_id
    AND r.role = 'ADMIN'
    AND (TG_OP = 'INSERT' OR ur.id != NEW.id)
  ) INTO has_admin;

  -- Verifica se o usuário tem outras roles (CLIENT, OWNER, NORMAL)
  SELECT EXISTS(
    SELECT 1 
    FROM user_roles ur
    INNER JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = NEW.user_id
    AND r.role IN ('CLIENT', 'OWNER', 'NORMAL')
    AND (TG_OP = 'INSERT' OR ur.id != NEW.id)
  ) INTO has_other_roles;

  -- Regra 1: Se está tentando adicionar ADMIN e já tem outras roles
  IF current_role = 'ADMIN' AND has_other_roles THEN
    RAISE EXCEPTION 'Usuário já possui outras roles. ADMIN deve ser exclusivo.';
  END IF;

  -- Regra 2: Se está tentando adicionar outra role e já é ADMIN
  IF current_role IN ('CLIENT', 'OWNER', 'NORMAL') AND has_admin THEN
    RAISE EXCEPTION 'Usuário já é ADMIN. Não é possível adicionar outras roles.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria o trigger
CREATE TRIGGER enforce_admin_exclusivity
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION check_admin_exclusivity();