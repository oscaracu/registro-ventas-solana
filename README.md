# Registro de Ventas Solana

Monorepo con un programa Anchor y una aplicación React para registrar múltiples ventas por cliente sin depender del SKU como identidad.

## Contenido

- `programa/`: programa Rust/Anchor. Cada venta usa una semilla PDA basada en `id_venta` en little-endian.
- `app/`: frontend React, cliente Codama e integración con Solana Devnet.
- `app/.devcontainer/`: entorno reproducible con Node.js 22, Rust, Solana CLI y Anchor CLI.

## Desarrollo

Abrir la carpeta raíz con VS Code Dev Containers y ejecutar las verificaciones:

```bash
cd app
npm install
npm run verificar
```

El Program ID local se configura en `programa/declare_id!()` y `programa/Anchor.toml`, y debe coincidir con `app/idl.json` y `app/src/config/programa.json`.

Las keypairs locales de despliegue se excluyen de Git y deben mantenerse fuera del repositorio.
