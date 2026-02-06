ALTER TABLE "owner"
ADD CONSTRAINT proprietario_tipo_bi_check
CHECK (
  ("tipo" = 'PF' AND "bi" IS NOT NULL)
  OR
  ("tipo" = 'PJ' AND "bi" IS NULL)
);
