ALTER TABLE usuarios
ADD COLUMN nombre VARCHAR(100) NULL AFTER id;

UPDATE usuarios
SET nombre = 'Usuario'
WHERE nombre IS NULL OR TRIM(nombre) = '';

ALTER TABLE usuarios
MODIFY COLUMN nombre VARCHAR(100) NOT NULL;